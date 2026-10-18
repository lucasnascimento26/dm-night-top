"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";

// Data de encerramento da votação. Ajuste quando quiser.
const FIM_DA_VOTACAO = new Date("2026-10-18T06:00:00-03:00").getTime();

// Textos das informações.
const INFO_PAREDAO = {
  titulo: "O que acontece no paredão?",
  texto: "O mais votado responde a todas as perguntas no dia do evento.",
};
const INFO_VOTO = {
  titulo: "Quem pode votar?",
  texto: "Só membros do grupo Damas da Night podem votar.",
};

type Participante = {
  nome: string;
  porcentagem: number;
  // Coloque as fotos em public/images/participantes/ e preencha aqui.
  // Ex.: "/images/participantes/jessica-participante-damas-da-night.webp"
  foto: string | null;
};

const participantes: Participante[] = [
  { nome: "Jéssica", porcentagem: 32.48, foto: null },
  { nome: "Rafael", porcentagem: 28.76, foto: null },
  { nome: "Camila", porcentagem: 22.31, foto: null },
  { nome: "Thiago", porcentagem: 16.93, foto: null },
];

const lider = participantes.reduce((a, b) => (b.porcentagem > a.porcentagem ? b : a)).nome;

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
/* Acima de 774px: o palco desktop (hero com o fundo back-desktop.png) SUBSTITUI o fundo mobile */
@media (min-width: 774px) {
  .dn-fundo-mobile { display: none !important; }
}
/* A partir de 1018px: 4 participantes lado a lado e o bloco de infos empilhado dentro da sua metade.
   Feito em CSS com !important porque as classes sm:* do Tailwind venciam as min-[1018px]:*. */
@media (min-width: 1018px) {
  .dn-participantes { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 1.25rem !important; }
  .dn-info-bloco { grid-template-columns: minmax(0, 1fr) !important; padding-top: 0 !important; padding-bottom: 0 !important; }
  .dn-info-bloco > * { padding: .75rem 1rem !important; }
  .dn-info-bloco > * + * {
    border-left-width: 0 !important;
    border-inline-start-width: 0 !important;
    border-top-width: 1px !important;
  }

  /* CARDS MAIORES (1018px+): menos margem lateral, foto mais alta, textos e botão maiores */
  .dn-conteudo { padding-left: 1rem !important; padding-right: 1rem !important; }
  .dn-card-foto { aspect-ratio: 4 / 4.2 !important; }
  .dn-card-corpo { padding: 1.25rem !important; padding-top: 1rem !important; }
  .dn-card-nome { font-size: 1.75rem !important; }
  .dn-card-pct { font-size: 2.25rem !important; margin-top: .6rem !important; }
  .dn-card-barra { height: .75rem !important; }
  .dn-card-btn { min-height: 3.25rem !important; font-size: .95rem !important; margin-top: 1.1rem !important; }
}
@media (prefers-reduced-motion: reduce) {
  .dn-borda { animation:none !important; background-position: 0 0, 40% center; }
  .dn-twinkle { animation:none !important; opacity:.7; }
  .dn-shine { animation:none !important; background-position: 40% center; }
}
`;

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
   O palco tem a mesma proporção do print (1897x934) e usa o back-desktop.png como fundo,
   então anel e pódio ficam sempre no mesmo lugar. Tudo é posicionado em % do palco:
   - robô: dentro do anel, com os pés em cima do pódio
   - logo: começa na altura do pódio (coroa encostando nos pés do robô)
   - frase: logo abaixo da logo
   RESPONSIVIDADE: o palco é um "container" (containerType: inline-size). A logo grande e a frase
   escalam só em % / cqw (sem larguras mínimas fixas), então nunca se sobrepõem em telas menores
   (ex.: 774px–1100px). Para ajustar o encaixe, mexa nos valores top-[...] / h-[...] abaixo. */
function HeroDesktop() {
  return (
    <>
    <section
      className="relative hidden w-full overflow-hidden min-[774px]:block"
      style={{
        aspectRatio: "1897 / 934",
        backgroundImage: "url('/images/back-desktop.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        containerType: "inline-size",
      }}
    >
      <h1 className="sr-only">Paredão Damas</h1>

      {/* logo pequena (canto superior) */}
      <Image
        src="/images/logo-damas-da-night-neon.png"
        alt="Logo Damas da Night em letras rosa neon"
        width={220}
        height={80}
        className="absolute left-[3%] top-[3%] z-10 w-[13%] min-w-32"
      />

      {/* estrelinhas ao redor do anel */}
      <div className="pointer-events-none absolute left-[30%] top-[5%] h-[58%] w-[40%]">
        <Brilhos />
      </div>

      {/* robô: dentro do anel, pés no pódio */}
      <div className="absolute left-1/2 top-[9.8%] h-[53.5%] -translate-x-1/2">
        <Image
          src="/images/mascote-robo-damas-da-night.png"
          alt="Mascote robô roxo com um olho da Damas da Night fazendo coração com as mãos"
          width={380}
          height={420}
          className="h-full w-auto"
        />
      </div>

      {/* logo grande: coroa nos pés do robô, no pódio (escala só em % do palco) */}
      <div className="absolute left-1/2 top-[49%] w-[28%] -translate-x-1/2">
        <Image
          src="/images/logo-damas-da-night-olho.png"
          alt="Logo da Damas da Night com um olho roxo no centro"
          width={520}
          height={300}
          className="h-auto w-full"
        />
      </div>

      {/* degradê na base: funde o fundo com o roxo escuro do resto da página */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-b from-transparent to-[#06030f]" />
    </section>

    {/* frase: FORA do palco (no espaço entre o hero e a barra de informações), só acima de 774px.
        Usa vw porque o palco ocupa 100% da largura da tela. */}
    <p
      className="relative z-10 mx-auto hidden items-center justify-center font-bold italic tracking-wide min-[774px]:flex"
      style={{
        width: "clamp(300px, 42vw, 600px)",
        fontSize: "clamp(15px, 2vw, 30px)",
        gap: "clamp(8px, 1.2vw, 20px)",
        marginTop: "-3.5vw", // espaço acima (mais negativo = mais perto da logo)
        marginBottom: "2vw", // espaço abaixo (até a barra de informações)
      }}
    >
      <LinhaNeon lado="esq" />
      <span className="whitespace-nowrap">O PAREDÃO TÁ ON!</span>
      <LinhaNeon lado="dir" />
    </p>
    </>
  );
}

/* ---------- Contagem regressiva ---------- */
function useContagem() {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRestante(Math.max(0, FIM_DA_VOTACAO - Date.now()));
    tick();
    // A tela só mostra dias/horas/minutos, então 1 atualização por 30s basta.
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const total = restante ?? 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dias: pad(Math.floor(total / 86_400_000)),
    horas: pad(Math.floor((total % 86_400_000) / 3_600_000)),
    min: pad(Math.floor((total % 3_600_000) / 60_000)),
  };
}

/* ---------- Página ---------- */
export default function ParedaoPage() {
  const { dias, horas, min } = useContagem();
  const [votado, setVotado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startExit = setTimeout(() => setIsExiting(true), 3200);
    const removeLoader = setTimeout(() => setLoading(false), 3200 + 800);

    return () => {
      clearTimeout(startExit);
      clearTimeout(removeLoader);
    };
  }, []);

  // Garante o título da aba, mesmo que o layout da pasta não seja aplicado.
  useEffect(() => {
    document.title = "Damas da Night — Paredão";
  }, []);

  if (loading) return <Loader isExiting={isExiting} />;

  return (
    <main className="content-fade-in relative min-h-screen overflow-hidden bg-[#06030f] font-sans text-white">
      <style>{css}</style>

      {/* DESKTOP (acima de 774px): palco com o fundo back-desktop.png */}
      <HeroDesktop />

      {/* coluna limitada a 767px: no celular tem o fundo mobile; no desktop é só o conteúdo abaixo do palco.
          A partir de 1018px a coluna passa a 1320px (antes 1100px) para os cards ficarem maiores. */}
      <div className="relative mx-auto min-h-screen w-full max-w-[767px] overflow-hidden bg-[#06030f] min-[1018px]:max-w-[1320px]">
      {/* fundo mobile (imagem): só aparece abaixo de 774px */}
      <div
        aria-hidden="true"
        className="dn-fundo-mobile pointer-events-none absolute inset-0 bg-[#06030f] bg-[length:100%_auto] bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/images/backparedao-mobile.png')" }}
      />

      <div className="dn-conteudo relative mx-auto px-3 pb-8 sm:px-6 min-[774px]:pt-4">
        {/* TOPO MOBILE (abaixo de 774px) */}
        <header className="relative min-[774px]:hidden">
          <h1 className="sr-only">Paredão Damas</h1>

          {/* logo pequena (canto superior) */}
          <Image
            src="/images/logo-damas-da-night-neon.png"
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
                  src="/images/mascote-robo-damas-da-night.png"
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
              src="/images/logo-damas-da-night-olho.png"
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
        <section className="mt-3 space-y-3 rounded-3xl border border-violet-500/50 bg-gradient-to-b from-[#1c0d40] to-[#0b0618] p-3 min-[1018px]:grid min-[1018px]:grid-cols-2 min-[1018px]:gap-3 min-[1018px]:space-y-0">
          <div className="rounded-2xl border border-violet-400/40 bg-[#120a2c] p-3">
            <div className="flex items-center gap-3">
              <RelogioOuro />
              <p className="text-sm font-medium leading-tight text-white">Encerramento da votação em:</p>
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
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
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
          {participantes.map((p, i) => {
            const ativo = votado === p.nome;
            return (
              <article
                key={p.nome}
                className={`dn-borda overflow-hidden rounded-2xl ${ativo ? "dn-borda-ativa" : ""}`}
                style={{ animationDelay: `-${i * 0.9}s` }}
              >
                <div className="dn-card-foto relative aspect-[16/10] bg-[radial-gradient(circle_at_50%_70%,rgba(168,85,247,0.35),transparent_65%)] sm:aspect-[4/3.3]">
                  {p.foto ? (
                    <Image
                      src={p.foto}
                      alt={`Foto de ${p.nome}, participante do paredão da Damas da Night`}
                      fill
                      sizes="(min-width: 1018px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-7xl font-bold text-violet-400/40">
                      {p.nome[0]}
                    </div>
                  )}

                  {p.nome === lider && (
                    <span className="absolute left-2 top-2 z-10 flex items-center gap-1.5 text-base font-extrabold text-amber-200 drop-shadow-[0_1px_4px_rgba(0,0,0,.9)] sm:left-3 sm:top-3 sm:text-lg">
                      <IconCoroa className="h-5 w-6 drop-shadow-[0_0_5px_rgba(251,191,36,.7)] sm:h-6 sm:w-7" />
                      1º
                      <span className="sr-only"> lugar</span>
                    </span>
                  )}
                </div>

                <div className="dn-card-corpo p-3 pt-2.5 sm:p-4 sm:pt-3">
                  <h2 className="dn-card-nome text-lg font-bold leading-tight sm:text-2xl">{p.nome}</h2>
                  <p className="dn-card-pct mt-1.5 text-2xl font-bold tabular-nums sm:mt-2 sm:text-3xl">
                    {p.porcentagem.toFixed(2).replace(".", ",")}%
                  </p>
                  <div
                    className="dn-card-barra mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10 sm:mt-2 sm:h-2.5"
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
                    onClick={() => setVotado(p.nome)}
                    aria-pressed={ativo}
                    className={`dn-card-btn mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 sm:mt-4 sm:gap-3 sm:text-sm ${
                      ativo
                        ? "border-fuchsia-400 bg-fuchsia-500/30"
                        : "border-violet-400/70 bg-[#120a28] hover:bg-violet-500/20"
                    }`}
                  >
                    {ativo ? <IconCheck /> : <IconCurtir />}
                    {ativo ? "Votado" : "Votar"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* RODAPÉ */}
        <footer className="mt-6 grid gap-3 border-t border-violet-500/50 pt-5 text-xs text-violet-100/90">
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
  );
}