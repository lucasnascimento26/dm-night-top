import { db } from "@/lib/db";
import { recadosAnonimos } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

/* -------------------------------------------------------------------- */
/*  Rate limiting para /api/recados                                      */
/* -------------------------------------------------------------------- */
//
// Sem Redis/Upstash/KV no projeto, então o limite é checado contando
// linhas recentes na própria tabela recados_anonimos. Funciona bem
// pro volume de um formulário de recados; se o tráfego crescer muito,
// vale migrar pra Upstash (mais rápido, tira carga do Postgres).

const LIMITE_POR_NUMERO = 3; // no máximo 3 recados para o mesmo destinatário
const JANELA_NUMERO_MS = 24 * 60 * 60 * 1000; // em 24h

const LIMITE_POR_IP = 5; // no máximo 5 recados enviados do mesmo IP
const JANELA_IP_MS = 60 * 60 * 1000; // em 1h

export interface ResultadoRateLimit {
  permitido: boolean;
  motivo?: string;
}

export async function verificarRateLimit(params: {
  ip: string | null;
  numeroDestinatario: string;
}): Promise<ResultadoRateLimit> {
  const { ip, numeroDestinatario } = params;

  const desdeNumero = new Date(Date.now() - JANELA_NUMERO_MS).toISOString();

  const [{ count: countNumero }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recadosAnonimos)
    .where(
      and(
        eq(recadosAnonimos.numeroDestinatario, numeroDestinatario),
        gte(recadosAnonimos.createdAt, desdeNumero)
      )
    );

  if (countNumero >= LIMITE_POR_NUMERO) {
    return {
      permitido: false,
      motivo:
        "Esse número já recebeu vários recados hoje. Tente novamente mais tarde.",
    };
  }

  if (ip) {
    const desdeIp = new Date(Date.now() - JANELA_IP_MS).toISOString();

    const [{ count: countIp }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(recadosAnonimos)
      .where(and(eq(recadosAnonimos.ip, ip), gte(recadosAnonimos.createdAt, desdeIp)));

    if (countIp >= LIMITE_POR_IP) {
      return {
        permitido: false,
        motivo: "Muitos recados enviados em pouco tempo. Aguarde um pouco e tente de novo.",
      };
    }
  }

  return { permitido: true };
}

/**
 * Extrai o IP do request, considerando proxies (Vercel usa x-forwarded-for).
 */
export function extrairIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();

  return null;
}