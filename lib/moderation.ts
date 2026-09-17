/* -------------------------------------------------------------------- */
/*  Moderação de conteúdo — recados anônimos                             */
/* -------------------------------------------------------------------- */
//
// Filtro simples de termos proibidos. NÃO é infalível: variações com
// espaço, acento ou leetspeak básico (p0rr@, m3rd4) são tratadas via
// normalização, mas alguém motivado sempre encontra um jeito de
// escapar de uma lista fixa. Por isso os recados que passam aqui
// ainda vão para fila de aprovação manual (status "pendente") antes
// de ir pro destinatário — este filtro é só a primeira barreira,
// pra bloquear os casos óbvios sem precisar de revisão humana.
//
// Edite a lista TERMOS_PROIBIDOS livremente. Prefira incluir a forma
// "base" da palavra (sem flexão de gênero/número quando possível) e
// deixe a normalização cuidar de variações simples.
//
// IMPORTANTE sobre frases: uma frase só bloqueia se aparecer EXATAMENTE
// naquela ordem ("quero comer teu cu" não bloqueia "comer teu cu valeria").
// Por isso, sempre que possível, prefira cadastrar a palavra-raiz isolada
// (ex: "cu") em vez de só a frase completa — a palavra isolada pega
// qualquer combinação que a contenha.

export const TERMOS_PROIBIDOS: string[] = [
  // xingamentos comuns
  "arrombado",
  "arrombada",
  "babaca",
  "bosta",
  "buceta",
  "bucetinha",
  "caralho",
  "corno",
  "corna",
  "cuzao",
  "cuzão",
  "cuzuda",
  "desgraça",
  "desgracado",
  "desgraçado",
  "fake",
  "filha da puta",
  "filho da puta",
  "foda-se",
  "fodase",
  "foder",
  "fuder",
  "fudendo",
  "fudido",
  "fudida",
  "idiota",
  "imbecil",
  "merda",
  "otario",
  "otário",
  "ordinária",
  "cadela",
  "vaca",
  "piranha",
  "porra",
  "putinha",
  "putão",
  "puta",
  "puto",
  "rapariga",
  "retardado",
  "retardada",
  "vadia",
  "vadio",
  "vagabunda",
  "vagabundo",
  "viado",
  "viadinho",

  // partes do corpo / termos sexuais usados de forma ofensiva
  // (palavra isolada, não frase — pega qualquer combinação que a contenha)
  "cu",
  "ppk",
  "pica",
  "rola",
  "peitos",
  "seios",

  // frases específicas (reforçam contexto além das palavras isoladas acima)
  "rabo gostoso",
  "passa lingua na tua ppk",
  "vai tomar no cú",
  "gosta de levar pica",
  "chave de buceta",
  "chupa minha rola",
  "chupa minha pica",

  // ameaças / incitação a violência
  "vou te matar",
  "vou matar voce",
  "vou matar você",
  "vou te pegar",
  "vou te bater",
  "cuidado que voce vai ver",
  "cuidado que você vai ver",

  // discurso de ódio (raça, orientação, etc.) — termos base
  "macaco", // uso pejorativo racista; falsos positivos são raros no contexto de recado
  "nazista",
  "bicha", // dependendo do contexto pode ser reapropriado, mas em recado anônimo o risco de uso pejorativo é alto
  "sapatao",
  "sapatão",

  // assédio / conteúdo sexual não solicitado explícito
  "manda nudes",
  "manda nude",
  "quero te comer",
  "gostosa gostosa",
];

/**
 * Remove acentos, baixa a caixa, troca leetspeak básico e colapsa
 * repetições de caractere (ex: "poooorraaa" -> "porra").
 */
function normalizar(texto: string): string {
  const substituicoesLeet: Record<string, string> = {
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "@": "a",
    "$": "s",
  };

  let normalizado = texto.toLowerCase();

  for (const [de, para] of Object.entries(substituicoesLeet)) {
    normalizado = normalizado.split(de).join(para);
  }

  normalizado = normalizado
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos

  normalizado = normalizado
    .replace(/[^a-z0-9\s]/g, " ") // pontuação vira espaço
    .replace(/(.)\1{2,}/g, "$1$1") // "aaaa" -> "aa"
    .replace(/\s+/g, " ")
    .trim();

  return normalizado;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface ResultadoModeracao {
  bloqueado: boolean;
  termosDetectados: string[];
}

/**
 * Verifica se o texto contém algum termo da lista de proibidos.
 * Compara com limites de palavra (\b) pra evitar falso positivo
 * dentro de palavras maiores (ex: "corno" não bater em "cornofulano").
 */
export function verificarConteudo(texto: string): ResultadoModeracao {
  const textoNormalizado = normalizar(texto);
  const termosDetectados: string[] = [];

  for (const termo of TERMOS_PROIBIDOS) {
    const termoNormalizado = normalizar(termo);
    if (!termoNormalizado) continue;

    const padrao = termoNormalizado
      .split(" ")
      .map(escapeRegex)
      .join("\\s+");

    const regex = new RegExp(`(?:^|\\s)${padrao}(?:$|\\s)`, "i");

    if (regex.test(` ${textoNormalizado} `)) {
      termosDetectados.push(termo);
    }
  }

  return {
    bloqueado: termosDetectados.length > 0,
    termosDetectados,
  };
}