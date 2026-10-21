import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { and, eq, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { paredoes, paredaoParticipantes, paredaoVotos } from "@/lib/db/schema";
import { hashAparelho, hashVotante, ipDoRequest } from "@/lib/paredao";

const MAX_VOTOS_POR_IP = 3;

export async function POST(req: Request) {
  const { participanteId, deviceId } = await req.json().catch(() => ({}));
  if (
    !Number.isInteger(participanteId) ||
    typeof deviceId !== "string" ||
    deviceId.length < 8 ||
    deviceId.length > 100
  ) {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const [part] = await db
    .select()
    .from(paredaoParticipantes)
    .where(eq(paredaoParticipantes.id, participanteId));
  if (!part) return NextResponse.json({ error: "Participante não existe" }, { status: 404 });

  const [p] = await db.select().from(paredoes).where(eq(paredoes.id, part.paredaoId));
  if (!p || !p.ativo || new Date() >= p.encerraEm) {
    return NextResponse.json({ error: "Votação encerrada" }, { status: 403 });
  }

  const jar = await cookies();
  let voterId = jar.get("voter_id")?.value;
  const novo = !voterId;
  if (!voterId) voterId = randomUUID();

  // Se a impressão do aparelho falhou no navegador, ela não é usada como trava.
  const deviceHash = deviceId === "indisponivel" ? null : hashAparelho(deviceId);
  const ip = ipDoRequest(req);

  function comCookie(res: NextResponse) {
    if (novo) {
      res.cookies.set("voter_id", voterId!, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  }

  // 1) Esta pessoa (cookie ou aparelho) já votou?
  const condicoes: SQL[] = [eq(paredaoVotos.voterHash, hashVotante(voterId))];
  if (deviceHash) condicoes.push(eq(paredaoVotos.deviceHash, deviceHash));
  const [jaVotou] = await db
    .select({ id: paredaoVotos.id })
    .from(paredaoVotos)
    .where(and(eq(paredaoVotos.paredaoId, p.id), or(...condicoes)))
    .limit(1);
  if (jaVotou) {
    return comCookie(NextResponse.json({ error: "Você já votou neste paredão" }, { status: 409 }));
  }

  // 2) Limite por rede (IP)
  if (ip) {
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(paredaoVotos)
      .where(and(eq(paredaoVotos.paredaoId, p.id), eq(paredaoVotos.ip, ip)));
    if (n >= MAX_VOTOS_POR_IP) {
      return comCookie(
        NextResponse.json(
          { error: "Já existe um voto registrado nesta rede de internet." },
          { status: 429 }
        )
      );
    }
  }

  // 3) Grava. Os índices únicos do banco (cookie e aparelho) garantem
  //    a regra mesmo com cliques simultâneos.
  const inserted = await db
    .insert(paredaoVotos)
    .values({
      paredaoId: p.id,
      participanteId,
      voterHash: hashVotante(voterId),
      deviceHash,
      ip,
    })
    .onConflictDoNothing()
    .returning({ id: paredaoVotos.id });

  return comCookie(
    inserted.length
      ? NextResponse.json({ ok: true })
      : NextResponse.json(
          { error: "Já existe um voto registrado neste aparelho." },
          { status: 409 }
        )
  );
}