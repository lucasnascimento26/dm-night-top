/* -------------------------------------------------------------------- */
/*  Moderação por IA — Google Gemini API (gratuita, sem cartão)          */
/* -------------------------------------------------------------------- */
//
// Segunda camada de moderação, depois do filtro de lista de palavras
// (lib/moderation.ts). Usa o modelo Gemini do Google pra CLASSIFICAR
// se a mensagem é imprópria — pega erro de digitação proposital,
// indiretas e gírias novas, porque entende o sentido da frase, não
// só bate palavra por palavra numa lista.
//
// Como conseguir a chave (gratuita, SEM cartão de crédito):
// https://aistudio.google.com/app/api-keys
//
// IMPORTANTE — comportamento em caso de falha:
// Se a chave não estiver configurada, a chamada falhar, ou a resposta
// vier em formato inesperado, esta função NÃO bloqueia o recado — ela
// deixa passar (fail-open) pra não travar o formulário inteiro por
// causa de uma dependência externa. O recado ainda vai pra fila de
// aprovação manual (status "pendente"), então continua havendo uma
// camada de segurança mesmo se a IA cair.

export interface ResultadoModeracaoIA {
  bloqueado: boolean;
  categorias: string[];
  erro?: string;
}

const MODELO = "gemini-3.5-flash-lite";

const PROMPT_SISTEMA = `Você é um classificador de moderação de conteúdo para um site de recados anônimos entre pessoas no Brasil.
Analise a mensagem do usuário e responda APENAS com um JSON, sem nenhum texto antes ou depois, no formato:
{"improprio": true ou false, "categorias": ["lista", "de", "categorias"]}

Marque "improprio": true se a mensagem contiver QUALQUER um destes, mesmo com erro de digitação proposital, gíria ou letras faltando:
- ofensa, xingamento ou insulto direcionado a alguém
- ameaça ou incitação a violência
- discurso de ódio (racismo, homofobia, etc.)
- conteúdo sexual explícito ou assédio sexual não solicitado

Categorias possíveis: "ofensa", "ameaca", "odio", "sexual".
Se a mensagem for um recado normal, educado, elogio, declaração romântica respeitosa ou neutra, marque "improprio": false e "categorias": [].`;

export async function verificarConteudoIA(
  texto: string
): Promise<ResultadoModeracaoIA> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(
      "[moderacao-ia] GEMINI_API_KEY não configurada — pulando checagem por IA"
    );
    return { bloqueado: false, categorias: [], erro: "sem_api_key" };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: PROMPT_SISTEMA }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: texto }],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      const detalhe = await response.text().catch(() => "");
      console.error("[moderacao-ia] erro na Gemini API:", response.status, detalhe);
      return { bloqueado: false, categorias: [], erro: "falha_api" };
    }

    const data = await response.json();
    const textoResposta: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textoResposta) {
      return { bloqueado: false, categorias: [], erro: "resposta_vazia" };
    }

    let resultado: { improprio?: boolean; categorias?: string[] };
    try {
      resultado = JSON.parse(textoResposta);
    } catch {
      console.error("[moderacao-ia] resposta não é JSON válido:", textoResposta);
      return { bloqueado: false, categorias: [], erro: "json_invalido" };
    }

    return {
      bloqueado: resultado.improprio === true,
      categorias: Array.isArray(resultado.categorias) ? resultado.categorias : [],
    };
  } catch (error) {
    console.error("[moderacao-ia] falha ao chamar a API:", error);
    return { bloqueado: false, categorias: [], erro: "excecao" };
  }
}