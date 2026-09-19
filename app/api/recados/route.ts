import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recadosAnonimos } from "@/lib/db/schema";
import { verificarConteudo } from "@/lib/moderation";
import { verificarConteudoIA } from "@/lib/ai-moderation";
import { verificarRateLimit, extrairIp } from "@/lib/rate-limit";

// Mesma lógica usada no bot (confissoesHandler.js → extrairNumero),
// pra garantir que o formato salvo aqui seja o mesmo que o bot espera.
function normalizarTelefone(input: string): string | null {
  let numero = input.replace(/\D/g, "");
  if (numero.length === 10 || numero.length === 11) numero = "55" + numero;
  if (numero.length >= 12 && numero.length <= 13) return numero;
  return null;
}

// Baixa a foto/música do Vercel Blob AQUI NO SERVIDOR (infra-para-infra,
// não depende da rede do celular do bot) e converte para base64, para
// o bot encontrar tudo pronto no banco, sem precisar baixar nada depois.
async function baixarComoBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch (err) {
    console.error("[recados] falha ao baixar mídia para base64:", url, err);
    return null;
  }
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

    const conteudoLimpo = content.trim();

    // --- Camada 1: filtro de lista de palavras (rápido, sem depender de rede) ---
    const moderacaoLista = verificarConteudo(conteudoLimpo);
    if (moderacaoLista.bloqueado) {
      return NextResponse.json(
        {
          error:
            "Sua mensagem contém termos não permitidos. Reescreva o recado sem ofensas, ameaças ou conteúdo impróprio.",
        },
        { status: 422 }
      );
    }

    // --- Camada 2: moderação por IA (OpenAI Moderation, gratuita) ---
    // Pega o que a lista de palavras não cobre: erro de digitação proposital,
    // indiretas, gírias novas, etc. Se a API falhar ou não estiver
    // configurada, deixa passar (fail-open) — o recado ainda cai na fila
    // de aprovação manual (status "pendente").
    const moderacaoIA = await verificarConteudoIA(conteudoLimpo);
    if (moderacaoIA.bloqueado) {
      return NextResponse.json(
        {
          error:
            "Sua mensagem foi identificada como conteúdo impróprio. Reescreva o recado.",
        },
        { status: 422 }
      );
    }

    // --- Rate limiting ---------------------------------------------------
    const ip = extrairIp(request);
    const rateLimit = await verificarRateLimit({
      ip,
      numeroDestinatario: numeroNormalizado,
    });

    if (!rateLimit.permitido) {
      return NextResponse.json({ error: rateLimit.motivo }, { status: 429 });
    }

    // --- Baixa foto/música do Blob e converte para base64 -----------------
    const [photoBase64, musicBase64] = await Promise.all([
      photoUrl ? baixarComoBase64(photoUrl) : Promise.resolve(null),
      musicUrl ? baixarComoBase64(musicUrl) : Promise.resolve(null),
    ]);

    // --- Salva como pendente, aguardando aprovação manual -----------------
    await db.insert(recadosAnonimos).values({
      content: conteudoLimpo,
      photoUrl: photoUrl || null,
      musicUrl: musicUrl || null,
      photoBase64: photoBase64,
      musicBase64: musicBase64,
      numeroDestinatario: numeroNormalizado,
      status: "pendente",
      ip: ip || null,
      sinalizado: false,
      termosDetectados: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar recado:", error);
    return NextResponse.json({ error: "Erro ao salvar recado" }, { status: 500 });
  }
}