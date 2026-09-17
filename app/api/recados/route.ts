import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recadosAnonimos } from "@/lib/db/schema";

// Mesma lógica usada no bot (confissoesHandler.js → extrairNumero),
// pra garantir que o formato salvo aqui seja o mesmo que o bot espera.
function normalizarTelefone(input: string): string | null {
  let numero = input.replace(/\D/g, "");
  if (numero.length === 10 || numero.length === 11) numero = "55" + numero;
  if (numero.length >= 12 && numero.length <= 13) return numero;
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, photoUrl, musicUrl, numeroDestinatario } = body as {
      content?: string;
      photoUrl?: string;
      musicUrl?: string;
      numeroDestinatario?: string;
    };

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    if (!numeroDestinatario || typeof numeroDestinatario !== "string") {
      return NextResponse.json(
        { error: "Número de WhatsApp obrigatório" },
        { status: 400 }
      );
    }

    const numeroNormalizado = normalizarTelefone(numeroDestinatario);
    if (!numeroNormalizado) {
      return NextResponse.json(
        { error: "Número inválido. Use DDD + número, ex: (85) 99999-8888" },
        { status: 400 }
      );
    }

    await db.insert(recadosAnonimos).values({
      content: content.trim(),
      photoUrl: photoUrl || null,
      musicUrl: musicUrl || null,
      numeroDestinatario: numeroNormalizado,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar recado:", error);
    return NextResponse.json({ error: "Erro ao salvar recado" }, { status: 500 });
  }
}