// ============================================================================
// ONDE MUDA O NÚMERO DO PAREDÃO ("1º Paredão", "2º Paredão"...)
// O título do selo NÃO fica no código: ele vem do banco (Neon), tabela "paredoes",
// coluna "titulo". Esta rota lê o paredão com ativo = true (o de maior id) e devolve
// o titulo para a página (selo ao lado de "Participantes").
//
// Para o próximo paredão, no Neon:
//   1) crie uma nova linha em "paredoes" com titulo = '2º Paredão', encerra_em e ativo = TRUE
//   2) marque o paredão antigo como ativo = FALSE
//   3) cadastre os participantes dele em "paredao_participantes"
// Não precisa mexer no código.
// ============================================================================


import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, desc, eq, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { paredoes, paredaoParticipantes, paredaoVotos } from "@/lib/db/schema";
import { hashAparelho, hashVotante } from "@/lib/paredao";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const [p] = await db
    .select()
    .from(paredoes)
    .where(eq(paredoes.ativo, true))
    .orderBy(desc(paredoes.id))
    .limit(1);

  if (!p) return NextResponse.json({ error: "Nenhum paredão ativo" }, { status: 404 });

  const rows = await db
    .select({
      id: paredaoParticipantes.id,
      nome: paredaoParticipantes.nome,
      foto: paredaoParticipantes.fotoUrl,
      votos: sql<number>`count(${paredaoVotos.id})::int`,
    })
    .from(paredaoParticipantes)
    .leftJoin(paredaoVotos, eq(paredaoVotos.participanteId, paredaoParticipantes.id))
    .where(eq(paredaoParticipantes.paredaoId, p.id))
    .groupBy(paredaoParticipantes.id)
    .orderBy(paredaoParticipantes.ordem);

  const total = rows.reduce((s, r) => s + r.votos, 0);
  const participantes = rows.map((r) => ({
    ...r,
    porcentagem: total ? Number(((r.votos / total) * 100).toFixed(2)) : 0,
  }));

  // Em quem esta pessoa já votou (por cookie OU por aparelho)
  let meuVoto: number | null = null;
  const voterId = (await cookies()).get("voter_id")?.value;
  const deviceId = new URL(req.url).searchParams.get("d");
  const condicoes: SQL[] = [];
  if (voterId) condicoes.push(eq(paredaoVotos.voterHash, hashVotante(voterId)));
  if (deviceId && deviceId !== "indisponivel" && deviceId.length <= 100) {
    condicoes.push(eq(paredaoVotos.deviceHash, hashAparelho(deviceId)));
  }
  if (condicoes.length) {
    const [v] = await db
      .select({ participanteId: paredaoVotos.participanteId })
      .from(paredaoVotos)
      .where(and(eq(paredaoVotos.paredaoId, p.id), or(...condicoes)))
      .limit(1);
    meuVoto = v?.participanteId ?? null;
  }

  return NextResponse.json({
    titulo: p.titulo,
    encerraEm: p.encerraEm.toISOString(),
    agora: new Date().toISOString(),
    encerrado: new Date() >= p.encerraEm,
    totalVotos: total,
    participantes,
    meuVoto,
  });
}