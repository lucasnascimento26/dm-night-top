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

// Baixa a foto do Vercel Blob AQUI NO SERVIDOR (infra-para-infra,
// não depende da rede do celular) e converte pra base64.
async function baixarComoBase64(url: string): Promise<{ base64: string; mime: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mime = res.headers.get("content-type") || "application/octet-stream";
    const buffer = await res.arrayBuffer();
    return { base64: Buffer.from(buffer).toString("base64"), mime };
  } catch (err) {
    console.error("[pendentes] falha ao baixar mídia:", url, err);
    return null;
  }
}

export async function GET(request: Request) {
  if (!verificarSecret(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const recados = await db
      .select()
      .from(recadosAnonimos)
      .where(eq(recadosAnonimos.status, "pendente"))
      .orderBy(recadosAnonimos.id)
      .limit(50);

    const resultado = await Promise.all(
      recados.map(async (recado) => {
        let photoBase64: string | null = null;
        let photoMime: string | null = null;
        if (recado.photoUrl) {
          const foto = await baixarComoBase64(recado.photoUrl);
          if (foto) {
            photoBase64 = foto.base64;
            photoMime = foto.mime;
          }
        }

        const musicDownloadUrl = recado.musicUrl
          ? `/api/recados/media/${recado.id}?type=music`
          : null;

        return {
          id: recado.id,
          content: recado.content,
          numero_destinatario: recado.numeroDestinatario,
          status: recado.status,
          created_at: recado.createdAt,
          photo_base64: photoBase64,
          photo_mime: photoMime,
          music_download_url: musicDownloadUrl,
        };
      })
    );

    return NextResponse.json({ recados: resultado });
  } catch (error) {
    console.error("[pendentes] erro:", error);
    return NextResponse.json({ error: "Erro ao buscar recados" }, { status: 500 });
  }
}