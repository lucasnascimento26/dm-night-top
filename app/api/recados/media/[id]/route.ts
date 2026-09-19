import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { recadosAnonimos } from "@/lib/db/schema";

export const runtime = "nodejs";

function verificarSecret(request: Request): boolean {
  const secretEnviado = request.headers.get("x-bot-secret");
  const secretEsperado = process.env.BOT_API_SECRET;
  return !!secretEsperado && secretEnviado === secretEsperado;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verificarSecret(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const recadoId = Number(id);
  if (!Number.isInteger(recadoId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("type");

  try {
    const [recado] = await db
      .select()
      .from(recadosAnonimos)
      .where(eq(recadosAnonimos.id, recadoId))
      .limit(1);

    if (!recado) {
      return NextResponse.json({ error: "Recado não encontrado" }, { status: 404 });
    }

    const url = tipo === "music" ? recado.musicUrl : recado.photoUrl;
    if (!url) {
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 });
    }

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Falha ao buscar mídia original" }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
        "Content-Length": upstream.headers.get("content-length") || "",
      },
    });
  } catch (error) {
    console.error("[media] erro:", error);
    return NextResponse.json({ error: "Erro ao servir mídia" }, { status: 500 });
  }
}