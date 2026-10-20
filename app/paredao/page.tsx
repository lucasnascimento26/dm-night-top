"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Loader from "../components/Loader";
import "./reveal-scroll.css";

// Textos das informações.
const INFO_PAREDAO = {
  titulo: "O que acontece no paredão?",
  texto: "O mais votado responde a todas as perguntas no dia do evento.",
};
const INFO_VOTO = {
  titulo: "Quem pode votar?",
  texto: "Só membros do grupo Damas da Night podem votar.",
};

// PROPORÇÃO DO QUADRO DA FOTO (largura / altura).
// Coloque aqui a proporção REAL da imagem dos participantes para ela aparecer inteira, sem sobras.
// Exemplos: "1 / 1" (quadrada), "3 / 4" (retrato), "4 / 5", "16 / 9" (paisagem).
const ASPECTO_FOTO = "1 / 1";

type Participante = {
  id: number;
  nome: string;
  porcentagem: number;
  // Coloque as fotos em public/images/participantes/ e preencha a coluna foto_url no banco.
  foto: string | null;
};

type DadosParedao = {
  encerraEm: string;
  agora: string;
  encerrado: boolean;
  totalVotos: number;
  participantes: Participante[];
  meuVoto: number | null;
};

const css = `
@keyframes dn-twinkle { 0%,100% { opacity:.15; transform:scale(.55); } 50% { opacity:1; transform:scale(1); } }
.dn-twinkle { animation: dn-twinkle 2.6s ease-in-out infinite; transform-origin:center; }
@keyframes dn-shine { 0% { background-position: 200% center; } 100% { background-position: -50% center; } }
.dn-shine {
  background-image: linear-gradient(100deg, #6d28d9 0%, #c026d3 18%, #faf5ff 40%, #e879f9 58%, #6d28d9 100%);
  background-size: 250% auto;
  background-position: 200% center;
  animation: dn-shine 3.5s linear infinite;
}
.dn-borda {
  border: 1.5px solid transparent;
  background-image:
    linear-gradient(#0b0618, #0b0618),
    linear-gradient(100deg, #4c1d95 0%, #a855f7 20%, #f5d0fe 40%, #a855f7 60%, #4c1d95 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  background-size: 100% 100%, 250% auto;
  background-position: 0 0, 200% center;
  animation: dn-shine 3.5s linear infinite;
  box-shadow: 0 0 14px rgba(139,92,246,.28);
}
.dn-borda-ativa {
  background-image:
    linear-gradient(#0b0618, #0b0618),
    linear-gradient(100deg, #86198f 0%, #e879f9 20%, #ffffff 40%, #e879f9 60%, #86198f 100%);
  box-shadow: 0 0 22px rgba(217,70,239,.6);
}

/* ---------- ENTRADA SUAVE DO TOPO (TUDO JUNTO, COMO UMA IMAGEM SÓ) ----------
   O fade é aplicado UMA VEZ no bloco inteiro (fundo + logos + robô), não em cada imagem.
   Assim o bloco é composto primeiro e só depois ganha opacidade: nada aparece "uma a uma".
   Os blocos ficam invisíveis até o Loader começar a sair (data-pronto="1" no <main>).
   Todos usam o mesmo atraso (--d: 0s) para entrarem exatamente ao mesmo tempo. */
@keyframes dn-entra {
  from { opacity: 0; filter: blur(10px); }
  to   { opacity: 1; filter: blur(0); }
}
.dn-hero-item { opacity: 0; }
[data-pronto="1"] .dn-hero-item {
  animation: dn-entra 1.1s cubic-bezier(.2,.7,.2,1) both;
  animation-delay: var(--d, 0s);
}

/* ---------- FOTOS DOS PARTICIPANTES ---------- */
.dn-card-foto {
  isolation: isolate;
  background: #0b0618;
}
.dn-foto-img {
  transition: transform .9s cubic-bezier(.2,.7,.2,1);
  will-change: transform;
}
.dn-borda:hover .dn-foto-img { transform: scale(1.04); }

/* Linha neon que separa a foto do corpo do card */
.dn-foto-linha {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #a855f7 20%, #f5d0fe 50%, #a855f7 80%, transparent 100%);
  box-shadow: 0 0 10px 1px rgba(168,85,247,.7);
}

/* Selos de vidro fosco sobre a foto (1º lugar / seu voto) */
.dn-selo {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Painel de vidro fosco na base da foto (nome + porcentagem) */
.dn-painel {
  background: linear-gradient(135deg, rgba(20,10,45,.62), rgba(11,6,24,.72));
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  border: 1px solid rgba(255,255,255,.14);
  box-shadow:
    0 8px 24px rgba(0,0,0,.35),
    inset 0 1px 0 rgba(255,255,255,.12);
}

/* MOBILE (abaixo de 774px): borda dos cards SEM animação (mais leve para o celular).
   O gradiente fica parado com o brilho claro no meio da borda, mantendo o visual neon.
   Para mudar onde fica o brilho, mexa no "40%" (0% = esquerda, 100% = direita). */
@media (max-width: 773px) {
  .dn-borda {
    animation: none;
    background-position: 0 0, 40% center;
  }
}

/* Acima de 774px: o palco desktop (hero com o fundo back-desktop.webp) SUBSTITUI o fundo mobile */
@media (min-width: 774px) {
  .dn-fundo-mobile { display: none !important; }
}
/* A partir de 1018px: 3 participantes lado a lado e o bloco de infos empilhado dentro da sua metade.
   Feito em CSS com !important porque as classes sm:* do Tailwind venciam as min-[1018px]:*. */
@media (min-width: 1018px) {
  .dn-participantes { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 1.25rem !important; }
  .dn-info-bloco { grid-template-columns: minmax(0, 1fr) !important; padding-top: 0 !important; padding-bottom: 0 !important; }
  .dn-info-bloco > * { padding: .75rem 1rem !important; }
  .dn-info-bloco > * + * {
    border-left-width: 0 !important;
    border-inline-start-width: 0 !important;
    border-top-width: 1px !important;
  }

  /* CARDS MAIORES (1018px+): menos margem lateral, textos e botão maiores */
  .dn-conteudo { padding-left: 1rem !important; padding-right: 1rem !important; }
  .dn-card-corpo { padding: 1.25rem !important; padding-top: 1rem !important; }
  .dn-painel { padding: .75rem 1rem !important; }
  .dn-card-nome { font-size: 1.6rem !important; }
  .dn-card-pct { font-size: 2rem !important; }
  .dn-card-barra { height: .75rem !important; }
  .dn-card-btn { min-height: 3.25rem !important; font-size: .95rem !important; margin-top: 1.1rem !important; }
}
@media (prefers-reduced-motion: reduce) {
  .dn-borda { animation:none !important; background-position: 0 0, 40% center; }
  .dn-twinkle { animation:none !important; opacity:.7; }
  .dn-shine { animation:none !important; background-position: 40% center; }
  .dn-foto-img { transition: none !important; }
  .dn-borda:hover .dn-foto-img { transform: none !important; }
  .dn-hero-item { opacity: 1 !important; animation: none !important; }
}
`;

const useLayoutEffectSeguro = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const icon = "h-7 w-7 fill-none stroke-current stroke-[1.6]";

/* ---------- Ícones ---------- */
function IconOlho({ className = icon }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function IconGrupo({ className = icon }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="4.5" cy="9.5" r="2" />
      <circle cx="19.5" cy="9.5" r="2" />
    </svg>
  );
}

function IconCurtir() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.7] sm:h-6 sm:w-6" aria-hidden="true">
      <path d="M7 11v9H4v-9h3Zm0 0 4-7c1.5 0 2.2 1 2 2.3L12.6 9H19a1.8 1.8 0 0 1 1.8 2.2l-1.4 6.6A2 2 0 0 1 17.4 19H7" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2.4] sm:h-6 sm:w-6" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-none stroke-current stroke-[1.6]" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 7 8.5-7" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-current" aria-hidden="true">
      <path d="m14 2 8 8-2 1-3-.5-3.5 3.5.5 4-1.5 1.5-4-4-5 5-1-1 5-5-4-4L6 9.5l4 .5 3.5-3.5L13 3l1-1Z" />
    </svg>
  );
}

function IconCoroa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={className} aria-hidden="true">
      <path
        d="M3 20 1.5 6l8 6L16 2l6.5 10 8-6L29 20Z"
        fill="#fbbf24"
        stroke="#fde68a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RelogioOuro() {
  return (
    <svg viewBox="0 0 56 56" className="h-12 w-12 shrink-0" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="26" fill="#150b33" stroke="#3b2a6b" strokeWidth="2" />
      <circle cx="28" cy="28" r="26" pathLength={100} stroke="#fbbf24" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="68 32" transform="rotate(100 28 28)" />
      <circle cx="28" cy="29" r="11" stroke="#fbbf24" strokeWidth="2.4" />
      <path d="M28 22.5V29l4 2.5" stroke="#fbbf24" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 16.5h6" stroke="#fbbf24" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Estrelinhas cintilantes (só opacity/transform) ---------- */
const brilhos = [
  { x: "6%", y: "22%", s: 16, d: "0s" },
  { x: "88%", y: "12%", s: 20, d: ".6s" },
  { x: "78%", y: "58%", s: 12, d: "1.2s" },
  { x: "14%", y: "62%", s: 12, d: "1.8s" },
  { x: "58%", y: "4%", s: 10, d: "2.2s" },
  { x: "93%", y: "40%", s: 10, d: ".3s" },
];

function Brilhos() {
  return (
    <>
      {brilhos.map((b, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox="0 0 24 24"
          width={b.s}
          height={b.s}
          className="dn-twinkle pointer-events-none absolute"
          style={{ left: b.x, top: b.y, animationDelay: b.d }}
        >
          <path
            d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12Z"
            fill="#f5d0fe"
          />
        </svg>
      ))}
    </>
  );
}

/* Linha neon: brilho largo + brilho curto + linha nítida (todos com o "shine" correndo)
   e uma bolinha luminosa na ponta que encosta no texto. A máscara apaga a ponta de fora. */
function LinhaNeon({ lado }: { lado: "esq" | "dir" }) {
  const esq = lado === "esq";
  const mask = `linear-gradient(${esq ? "to right" : "to left"}, transparent 0%, #000 55%)`;
  return (
    <span className="relative block h-[3px] flex-1" aria-hidden="true">
      <span
        className="absolute inset-0"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      >
        <span
          className="dn-shine absolute inset-x-0 -top-3 h-[27px] rounded-full opacity-60"
          style={{ filter: "blur(10px)" }}
        />
        <span
          className="dn-shine absolute inset-x-0 -top-[5px] h-[13px] rounded-full opacity-90"
          style={{ filter: "blur(4px)" }}
        />
        <span className="dn-shine absolute inset-0 rounded-full" />
      </span>
      <span
        className={`absolute top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-fuchsia-100 shadow-[0_0_6px_2px_#e879f9,0_0_14px_4px_#a855f7] ${
          esq ? "right-0" : "left-0"
        }`}
      />
    </span>
  );
}

/* ---------- Hero desktop (acima de 774px) ----------
   O palco tem a mesma proporção do print (1897x934) e usa o back-desktop.webp como fundo,
   então anel e pódio ficam sempre no mesmo lugar. Tudo é posicionado em % do palco:
   - robô: dentro do anel, com os pés em cima do pódio
   - logo: começa na altura do pódio (coroa encostando nos pés do robô)
   - frase: logo abaixo da logo
   RESPONSIVIDADE: o palco é um "container" (containerType: inline-size). A logo grande e a frase
   escalam só em % / cqw (sem larguras mínimas fixas), então nunca se sobrepõem em telas menores
   (ex.: 774px–1100px). Para ajustar o encaixe, mexa nos valores top-[...] / h-[...] abaixo.
   ENTRADA: a própria <section> (fundo + logos + robô + estrelinhas) tem "dn-hero-item",
   então tudo aparece JUNTO, como uma imagem só. A frase (fora do palco) usa o mesmo atraso. */
function HeroDesktop() {
  return (
    <>
    <section
      className="dn-hero-item relative hidden w-full overflow-hidden min-[774px]:block"
      style={
        {
          "--d": "0s",
          aspectRatio: "1897 / 934",
          backgroundImage: "url('/images/back-desktop.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          containerType: "inline-size",
        } as CSSProperties
      }
    >
      <h1 className="sr-only">Paredão Damas</h1>

      {/* logo pequena (canto superior) */}
      <Image
        src="/images/logo-damas-da-night-neon.webp"
        alt="Logo Damas da Night em letras rosa neon"
        width={220}
        height={80}
        priority
        className="absolute left-[3%] top-[3%] z-10 w-[13%] min-w-32"
      />

      {/* estrelinhas ao redor do anel */}
      <div className="pointer-events-none absolute left-[30%] top-[5%] h-[58%] w-[40%]">
        <Brilhos />
      </div>

      {/* robô: dentro do anel, pés no pódio */}
      <div className="absolute left-1/2 top-[9.8%] h-[53.5%] -translate-x-1/2">
        <Image
          src="/images/mascote-robo-damas-da-night.webp"
          alt="Mascote robô roxo com um olho da Damas da Night fazendo coração com as mãos"
          width={380}
          height={420}
          priority
          className="h-full w-auto"
        />
      </div>

      {/* logo grande: coroa nos pés do robô, no pódio (escala só em % do palco) */}
      <div className="absolute left-1/2 top-[49%] w-[28%] -translate-x-1/2">
        <Image
          src="/images/logo-paredao.webp"
          alt="Logo da Damas da Night com um olho roxo no centro"
          width={520}
          height={300}
          priority
          className="h-auto w-full"
        />
      </div>

      {/* degradê na base: funde o fundo com o roxo escuro do resto da página */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-b from-transparent to-[#06030f]" />
    </section>

    {/* frase: FORA do palco (no espaço entre o hero e a barra de informações), só acima de 774px.
        Usa vw porque o palco ocupa 100% da largura da tela. Mesmo atraso (0s) do palco. */}
    <p
      className="dn-hero-item relative z-10 mx-auto hidden items-center justify-center font-bold italic tracking-wide min-[774px]:flex"
      style={
        {
          "--d": "0s",
          width: "clamp(300px, 42vw, 600px)",
          fontSize: "clamp(15px, 2vw, 30px)",
          gap: "clamp(8px, 1.2vw, 20px)",
          marginTop: "-3.5vw", // espaço acima (mais negativo = mais perto da logo)
          marginBottom: "2vw", // espaço abaixo (até a barra de informações)
        } as CSSProperties
      }
    >
      <LinhaNeon lado="esq" />
      <span className="whitespace-nowrap">O PAREDÃO TÁ ON!</span>
      <LinhaNeon lado="dir" />
    </p>
    </>
  );
}

/* ---------- Contagem regressiva (usa a hora do servidor) ---------- */
function useContagem(encerraEm: string | null, offset: number) {
  const [restante, setRestante] = useState(0);

  useEffect(() => {
    if (!encerraEm) return;
    const fim = new Date(encerraEm).getTime();
    const tick = () => setRestante(Math.max(0, fim - (Date.now() + offset)));
    tick();
    // A tela só mostra dias/horas/minutos, então 1 atualização por 30s basta.
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [encerraEm, offset]);

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dias: pad(Math.floor(restante / 86_400_000)),
    horas: pad(Math.floor((restante % 86_400_000) / 3_600_000)),
    min: pad(Math.floor((restante % 3_600_000) / 60_000)),
    fechado: encerraEm !== null && restante === 0,
  };
}

/* ---------- Página ---------- */
export default function ParedaoPage() {
  const [dados, setDados] = useState<DadosParedao | null>(null);
  const [offset, setOffset] = useState(0); // relógio do servidor - relógio do cliente
  const [msg, setMsg] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null); // impressão digital do aparelho
  const { dias, horas, min, fechado } = useContagem(dados?.encerraEm ?? null, offset);

  const [loading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [minimoPassou, setMinimoPassou] = useState(false); // tempo mínimo do loader já passou
  const [heroPronto, setHeroPronto] = useState(false); // fundos + logos + robô carregados
  const [cardsProntos, setCardsProntos] = useState(false); // dados da API + fotos dos participantes carregados
  const [limite, setLimite] = useState(false); // passou 8s: libera mesmo que algo tenha falhado

  // Calcula a impressão do aparelho (roda só no navegador, não usa o banco).
  useEffect(() => {
    import("@fingerprintjs/fingerprintjs")
      .then((FP) => FP.load())
      .then((fp) => fp.get())
      .then((r) => setDeviceId(r.visitorId))
      .catch(() => setDeviceId("indisponivel"));
  }, []);

  const carregar = useCallback(async () => {
    if (!deviceId) return;
    try {
      const r = await fetch(`/api/paredao?d=${encodeURIComponent(deviceId)}`, { cache: "no-store" });
      if (!r.ok) return;
      const j: DadosParedao = await r.json();
      setOffset(new Date(j.agora).getTime() - Date.now());
      setDados(j);
    } catch {
      // mantém os dados atuais se a conexão falhar
    }
  }, [deviceId]);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 30_000); // atualiza as porcentagens
    return () => clearInterval(id);
  }, [carregar]);

  async function votar(id: number) {
    if (enviando || !deviceId) return;
    setEnviando(true);
    setMsg("");
    try {
      const r = await fetch("/api/paredao/votar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participanteId: id, deviceId }),
      });
      const j = await r.json().catch(() => ({}));
      setMsg(r.ok ? "Voto registrado! 💜" : j.error ?? "Erro ao votar");
    } catch {
      setMsg("Erro de conexão, tente de novo.");
    }
    await carregar();
    setEnviando(false);
  }

  const participantes = dados?.participantes ?? [];
  const lider =
    dados && dados.totalVotos > 0
      ? participantes.reduce((a, b) => (b.porcentagem > a.porcentagem ? b : a)).id
      : null;
  // Líder sempre no primeiro card: ordena por porcentagem (maior primeiro).
  // O sort é estável, então em empate vale a ordem original (a mesma usada para escolher o líder).
  const ordenados =
    lider === null
      ? participantes
      : [...participantes].sort((a, b) => b.porcentagem - a.porcentagem);
  const votado = dados?.meuVoto ?? null;
  const jaVotou = votado !== null;
  const encerrado = fechado || (dados?.encerrado ?? false);

  // Tempo mínimo do loader (3,2s).
  useEffect(() => {
    const t = setTimeout(() => setMinimoPassou(true), 3200);
    return () => clearTimeout(t);
  }, []);

  // A página já fica montada POR BAIXO do loader. O loader só sai quando TUDO estiver pronto:
  // (1) fundos + logos + robô, (2) dados da API, (3) fotos dos participantes.
  // Limite de 8s para nunca travar (ex.: API fora do ar ou foto quebrada).
  useEffect(() => {
    let cancelado = false;

    const fundos = ["/images/back-desktop.webp", "/images/backparedao-mobile.webp"].map(
      (src) =>
        new Promise<void>((res) => {
          const img = new window.Image();
          img.onload = img.onerror = () => res();
          img.src = src;
        })
    );

    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("main img")).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener("load", () => res(), { once: true });
            img.addEventListener("error", () => res(), { once: true });
          })
    );

    Promise.all([...fundos, ...imgs]).then(() => {
      if (!cancelado) setHeroPronto(true);
    });

    const t = setTimeout(() => setLimite(true), 8000);

    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, []);

  // Quando os dados chegam, os cards são renderizados; aí esperamos as fotos deles carregarem.
  const dadosCarregados = dados !== null;
  useEffect(() => {
    if (!dadosCarregados) return;
    let cancelado = false;

    const fotos = Array.from(
      document.querySelectorAll<HTMLImageElement>(".dn-participantes img")
    ).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener("load", () => res(), { once: true });
            img.addEventListener("error", () => res(), { once: true });
          })
    );

    Promise.all(fotos).then(() => {
      if (!cancelado) setCardsProntos(true);
    });

    return () => {
      cancelado = true;
    };
  }, [dadosCarregados]);

  // Quando o tempo mínimo passou E tudo está carregado (ou estourou o limite),
  // o loader começa a sair e o topo (fundo + logos + robô) entra junto, com fade suave.
  const tudoPronto = heroPronto && cardsProntos;
  useEffect(() => {
    if (!minimoPassou || !(tudoPronto || limite)) return;
    setIsExiting(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [minimoPassou, tudoPronto, limite]);

  // Garante o título da aba, mesmo que o layout da pasta não seja aplicado.
  useEffect(() => {
    document.title = "Damas da Night — Paredão";
  }, []);

  // Revela os elementos suavemente ao entrar na tela (uma vez só).
  // IMPORTANTE: a classe "reveal" só pode ficar em elementos cujo className NÃO muda
  // entre renders. Se o React reescrever o className, ele apaga o "is-visible"
  // (adicionado aqui via classList) e o elemento some.
  useEffect(() => {
    if (loading) return;
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading, participantes.length]);

  // Troca de posição SUAVE dos cards (técnica FLIP):
  // guarda a posição de cada card a cada render; quando a ordem muda, o card "volta"
  // visualmente para onde estava e desliza até o novo lugar.
  // Para deixar mais lento/rápido, mexa em DURACAO_TROCA (ms).
  const DURACAO_TROCA = 1400;
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const posAnterior = useRef<Map<number, { x: number; y: number }>>(new Map());
  const ordemAnterior = useRef("");
  const ordemKey = ordenados.map((p) => p.id).join(",");

  useLayoutEffectSeguro(() => {
    const novas = new Map<number, { x: number; y: number }>();
    cardRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      novas.set(id, { x: r.left + window.scrollX, y: r.top + window.scrollY });
    });

    const ordemMudou = ordemAnterior.current !== "" && ordemAnterior.current !== ordemKey;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (ordemMudou && !reduzir) {
      const ids = ordemKey.split(",").map(Number);
      novas.forEach((pos, id) => {
        const antes = posAnterior.current.get(id);
        const el = cardRefs.current.get(id);
        if (!antes || !el) return;
        const dx = antes.x - pos.x;
        const dy = antes.y - pos.y;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

        // quem sobe ganha um leve "destaque" (cresce um pouco); quem desce recua de leve.
        const subindo = dy + dx > 0;
        const escalaMeio = subindo ? 1.025 : 0.975;
        const opacidadeMeio = subindo ? 1 : 0.85;
        // pequeno atraso escalonado: os cards não se movem todos no mesmo instante
        const atraso = ids.indexOf(id) * 70;

        el.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 1 },
            {
              transform: `translate(${dx / 2}px, ${dy / 2}px) scale(${escalaMeio})`,
              opacity: opacidadeMeio,
              offset: 0.5,
            },
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
          ],
          {
            duration: DURACAO_TROCA,
            delay: atraso,
            easing: "cubic-bezier(.65, 0, .35, 1)",
            fill: "backwards",
          }
        );
      });
    }

    ordemAnterior.current = ordemKey;
    posAnterior.current = novas;
  });

  return (
    <>
      {/* Loader por cima: a página já está montada por baixo, carregando as imagens */}
      {loading && (
        <div className="fixed inset-0 z-[9999]">
          <Loader isExiting={isExiting} />
        </div>
      )}

      <main
        data-pronto={isExiting ? "1" : "0"}
        className="content-fade-in relative min-h-screen overflow-hidden bg-[#06030f] font-sans text-white"
      >
        <style>{css}</style>

        {/* DESKTOP (acima de 774px): palco com o fundo back-desktop.webp */}
        <HeroDesktop />

        {/* coluna limitada a 767px: no celular tem o fundo mobile; no desktop é só o conteúdo abaixo do palco.
            A partir de 1018px a coluna passa a 1320px (antes 1100px) para os cards ficarem maiores. */}
        <div className="relative mx-auto min-h-screen w-full max-w-[767px] overflow-hidden bg-[#06030f] min-[1018px]:max-w-[1320px]">
        {/* fundo mobile (imagem): só aparece abaixo de 774px.
            Tem "dn-hero-item" com o MESMO atraso (0s) do <header>, então fundo + logos + robô entram juntos. */}
        <div
          aria-hidden="true"
          className="dn-hero-item dn-fundo-mobile pointer-events-none absolute inset-0 bg-[#06030f] bg-[length:100%_auto] bg-top bg-no-repeat"
          style={
            {
              "--d": "0s",
              backgroundImage: "url('/images/backparedao-mobile.webp')",
            } as CSSProperties
          }
        />

        <div className="dn-conteudo relative mx-auto px-3 pb-8 sm:px-6 min-[774px]:pt-4">
          {/* TOPO MOBILE (abaixo de 774px): o <header> inteiro faz UM fade só (logos + mascote juntos) */}
          <header
            className="dn-hero-item relative min-[774px]:hidden"
            style={{ "--d": "0s" } as CSSProperties}
          >
            <h1 className="sr-only">Paredão Damas</h1>

            {/* logo pequena (canto superior) */}
            <Image
              src="/images/logo-damas-da-night-neon.webp"
              alt="Logo Damas da Night em letras rosa neon"
              width={220}
              height={80}
              className="absolute left-0 top-4 z-10 w-24 sm:w-32"
              priority
            />

            {/* mascote */}
            <div className="relative order-1 -mx-3 aspect-[100/68] sm:-mx-6">
              <div className="absolute inset-0">
                <Brilhos />
                <div className="absolute inset-x-0 bottom-0 flex h-[94%] justify-center">
                  <Image
                    src="/images/mascote-robo-damas-da-night.webp"
                    alt="Mascote robô roxo com um olho da Damas da Night fazendo coração com as mãos"
                    width={380}
                    height={420}
                    className="h-full w-auto"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* logo grande */}
            <div className="relative z-[1] order-2 -mt-[calc(4.5rem_+_5%)] flex flex-col items-center">
              <Image
                src="/images/logo-paredao.webp"
                alt="Logo da Damas da Night com um olho roxo no centro"
                width={520}
                height={300}
                className="h-auto w-[74%] max-w-[360px]"
                priority
              />
              <p className="mt-2 flex w-[86%] max-w-[420px] items-center gap-3 text-[15px] font-bold italic tracking-wide sm:text-base">
                <LinhaNeon lado="esq" />
                <span className="whitespace-nowrap">O PAREDÃO TÁ ON!</span>
                <LinhaNeon lado="dir" />
              </p>
            </div>
          </header>

          {/* BARRA DE INFORMAÇÕES */}
          <section className="reveal mt-3 space-y-3 rounded-3xl border border-violet-500/50 bg-gradient-to-b from-[#1c0d40] to-[#0b0618] p-3 min-[1018px]:grid min-[1018px]:grid-cols-2 min-[1018px]:gap-3 min-[1018px]:space-y-0">
            <div className="rounded-2xl border border-violet-400/40 bg-[#120a2c] p-3">
              <div className="flex items-center gap-3">
                <RelogioOuro />
                <p className="text-sm font-medium leading-tight text-white">
                  {encerrado ? "Votação encerrada" : "Encerramento da votação em:"}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 min-[340px]:gap-2">
                {[
                  { v: dias, r: "dias" },
                  { v: horas, r: "horas" },
                  { v: min, r: "min" },
                ].map((t, i) => (
                  <div key={t.r} className="contents">
                    {i > 0 && <span className="text-lg font-bold text-white min-[340px]:text-xl">:</span>}
                    <span className="flex min-w-0 flex-1 flex-col items-center rounded-xl border border-violet-400/40 bg-[#0c0721] py-2">
                      <span className="text-2xl font-bold leading-none tabular-nums text-white min-[340px]:text-3xl">{t.v}</span>
                      <small className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-violet-300">{t.r}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dn-info-bloco grid grid-cols-1 divide-y divide-violet-400/30 rounded-2xl border border-violet-400/30 bg-[#120a2c] sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:py-4">
              <div className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-3 sm:py-0">
                <IconOlho className="h-8 w-8 shrink-0 fill-none stroke-amber-400 stroke-[1.5] sm:h-9 sm:w-9" />
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-tight text-white">{INFO_PAREDAO.titulo}</p>
                  <p className="mt-1 text-xs leading-snug text-violet-200/80">{INFO_PAREDAO.texto}</p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-3 sm:py-0">
                <IconGrupo className="h-8 w-8 shrink-0 fill-none stroke-amber-400 stroke-[1.5] sm:h-9 sm:w-9" />
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-tight text-white">{INFO_VOTO.titulo}</p>
                  <p className="mt-1 text-xs leading-snug text-violet-200/80">{INFO_VOTO.texto}</p>
                </div>
              </div>
            </div>
          </section>

          {/* TÍTULO DA LISTA */}
          <div className="reveal mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
            <IconCoroa className="h-5 w-6 shrink-0" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 min-[340px]:tracking-[0.25em]">Participantes</h2>
            <span className="hidden h-px min-w-4 flex-1 bg-gradient-to-r from-violet-400/60 to-transparent min-[340px]:block" />
            <span className="shrink-0 whitespace-nowrap rounded-full border border-violet-400/50 bg-[#120a2c] px-3 py-1 text-xs font-medium text-violet-100">
              1º Paredão <span aria-hidden="true">🔥</span>
            </span>
          </div>

          {/* CARDS DOS PARTICIPANTES */}
          <section
            aria-label="Participantes do paredão"
            className="dn-participantes mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {ordenados.map((p, i) => {
              const ativo = votado === p.id;
              return (
                /* WRAPPER com className FIXO: é ele que recebe "reveal" / "is-visible".
                   Assim, quando o card muda (ex.: depois de votar), o React não apaga o is-visible. */
                <div
                  key={p.id}
                  className="reveal mx-auto w-full max-w-[360px] sm:max-w-none"
                  style={{ "--reveal-delay": `${i * 0.12}s` } as CSSProperties}
                >
                  <article
                    ref={(el) => {
                      if (el) cardRefs.current.set(p.id, el);
                      else cardRefs.current.delete(p.id);
                    }}
                    className={`dn-borda w-full overflow-hidden rounded-2xl ${ativo ? "dn-borda-ativa" : ""}`}
                    style={{ animationDelay: `-${i * 0.9}s` }}
                  >
                    {/* QUADRO DA FOTO: a proporção vem de ASPECTO_FOTO (lá no topo do arquivo).
                        A imagem usa object-contain, então aparece INTEIRA (a logo não é mais cortada). */}
                    <div
                      className="dn-card-foto relative overflow-hidden"
                      style={{ aspectRatio: ASPECTO_FOTO }}
                    >
                      {p.foto ? (
                        <Image
                          src={p.foto}
                          alt={`Foto de ${p.nome}, participante do paredão da Damas da Night`}
                          fill
                          loading="eager"
                          sizes="(min-width: 1018px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="dn-foto-img object-contain object-center"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-7xl font-bold text-violet-400/40">
                          {p.nome[0]}
                        </div>
                      )}

                      {/* linha neon separando a foto do corpo do card */}
                      <div aria-hidden="true" className="dn-foto-linha pointer-events-none absolute inset-x-0 bottom-0 z-[2]" />

                      {p.id === lider && (
                        <span className="dn-selo absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-black/35 py-1 pl-2 pr-3 text-sm font-extrabold text-amber-200 shadow-[0_2px_12px_rgba(0,0,0,.45)] sm:left-3 sm:top-3 sm:text-base">
                          <IconCoroa className="h-4 w-5 drop-shadow-[0_0_5px_rgba(251,191,36,.7)] sm:h-5 sm:w-6" />
                          1º
                          <span className="sr-only"> lugar</span>
                        </span>
                      )}

                      {ativo && (
                        <span className="dn-selo absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-fuchsia-300/50 bg-fuchsia-600/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-fuchsia-50 shadow-[0_2px_12px_rgba(0,0,0,.45)] sm:right-3 sm:top-3 sm:text-xs">
                          Seu voto
                        </span>
                      )}

                      {/* painel de vidro fosco: nome + porcentagem sobre a foto */}
                      <div className="dn-painel absolute inset-x-2 bottom-3 z-10 flex items-center justify-between gap-3 rounded-xl px-3 py-2 sm:inset-x-3 sm:bottom-4 sm:px-4">
                        <h2 className="dn-card-nome min-w-0 truncate text-lg font-bold leading-tight sm:text-2xl">
                          {p.nome}
                        </h2>
                        <p className="dn-card-pct shrink-0 text-2xl font-extrabold leading-none tabular-nums text-fuchsia-100 sm:text-3xl">
                          {p.porcentagem.toFixed(2).replace(".", ",")}%
                        </p>
                      </div>
                    </div>

                    <div className="dn-card-corpo p-3 sm:p-4">
                      <div
                        className="dn-card-barra h-2 w-full overflow-hidden rounded-full bg-white/10 sm:h-2.5"
                        role="progressbar"
                        aria-valuenow={p.porcentagem}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Porcentagem de votos de ${p.nome}`}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400"
                          style={{ width: `${p.porcentagem}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => votar(p.id)}
                        disabled={encerrado || jaVotou || enviando || !deviceId}
                        aria-pressed={ativo}
                        className={`dn-card-btn mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 disabled:cursor-not-allowed sm:mt-4 sm:gap-3 sm:text-sm ${
                          ativo
                            ? "border-fuchsia-400 bg-fuchsia-500/30"
                            : "border-violet-400/70 bg-[#120a28] hover:bg-violet-500/20"
                        } ${jaVotou && !ativo ? "opacity-50" : ""}`}
                      >
                        {ativo ? <IconCheck /> : <IconCurtir />}
                        {ativo ? "Votado" : encerrado ? "Encerrado" : "Votar"}
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </section>

          {msg && (
            <p role="status" className="mt-4 text-center text-sm font-medium text-fuchsia-200">
              {msg}
            </p>
          )}

          {/* RODAPÉ */}
          <footer className="reveal mt-6 grid gap-3 border-t border-violet-500/50 pt-5 text-xs text-violet-100/90">
            <div className="flex items-center gap-3">
              <span className="text-violet-300">
                <IconEnvelope />
              </span>
              <p>Ao votar, o resultado será enviado ao grupo Damas da Night.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-violet-300">
                <IconPin />
              </span>
              <p>
                Sempre que um admin enviar #votação, o resultado oficial atualizado deste site será
                fixado no grupo.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-violet-950/40 p-3">
              <span className="text-violet-300">
                <IconOlho />
              </span>
              <p className="text-sm italic text-fuchsia-200">
                É paredão, bebê...
                <br />
                aqui até o robô fica de olho! 👁️💜
              </p>
            </div>
          </footer>
        </div>
        </div>
      </main>
    </>
  );
}