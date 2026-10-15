"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Data de encerramento da votação. Ajuste quando quiser.
const FIM_DA_VOTACAO = new Date("2026-10-18T06:00:00-03:00").getTime();

type Participante = {
  nome: string;
  idade: number;
  perfil: string;
  porcentagem: number;
  // Coloque as fotos em public/images/participantes/ e preencha aqui.
  // Ex.: "/images/participantes/jessica-participante-damas-da-night.webp"
  foto: string | null;
};

const participantes: Participante[] = [
  { nome: "Jéssica", idade: 25, perfil: "Aventureira", porcentagem: 32.48, foto: null },
  { nome: "Rafael", idade: 20, perfil: "Resenhista", porcentagem: 28.76, foto: null },
  { nome: "Camila", idade: 27, perfil: "Animada", porcentagem: 22.31, foto: null },
  { nome: "Thiago", idade: 33, perfil: "Tranquilo", porcentagem: 16.93, foto: null },
];

const icon = "h-7 w-7 fill-none stroke-current stroke-[1.6]";

function IconOlho({ className = icon }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function IconGrupo() {
  return (
    <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="4.5" cy="9.5" r="2" />
      <circle cx="19.5" cy="9.5" r="2" />
    </svg>
  );
}

function IconRelogio() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12 fill-none stroke-current stroke-[1.6]" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l3.5 2" />
    </svg>
  );
}

function IconCurtir() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.7]" aria-hidden="true">
      <path d="M7 11v9H4v-9h3Zm0 0 4-7c1.5 0 2.2 1 2 2.3L12.6 9H19a1.8 1.8 0 0 1 1.8 2.2l-1.4 6.6A2 2 0 0 1 17.4 19H7" />
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-none stroke-current stroke-[1.6]" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 7 8.5-7" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-current" aria-hidden="true">
      <path d="m14 2 8 8-2 1-3-.5-3.5 3.5.5 4-1.5 1.5-4-4-5 5-1-1 5-5-4-4L6 9.5l4 .5 3.5-3.5L13 3l1-1Z" />
    </svg>
  );
}

function useContagem() {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRestante(Math.max(0, FIM_DA_VOTACAO - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
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

export default function ParedaoPage() {
  const { dias, horas, min } = useContagem();
  const [votado, setVotado] = useState<string | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06030f] font-sans text-white">
      {/* brilhos de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(168,85,247,0.45),transparent_55%),radial-gradient(ellipse_at_10%_10%,rgba(217,70,239,0.3),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <h1 className="sr-only">Paredão Damas</h1>

        {/* TOPO */}
        <header className="relative grid items-end gap-4 pt-6 md:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col items-center md:items-start">
            <Image
              src="/images/logo-damas-da-night-neon.png"
              alt="Logo Damas da Night em letras rosa neon"
              width={220}
              height={80}
              className="self-start drop-shadow-[0_0_18px_rgba(236,72,153,0.7)]"
              priority
            />
            <Image
              src="/images/logo-damas-da-night-olho.png"
              alt="Logo da Damas da Night com um olho roxo no centro"
              width={520}
              height={300}
              className="-mt-2 h-auto w-full max-w-[520px] drop-shadow-[0_0_30px_rgba(192,38,211,0.7)]"
              priority
            />
            <p className="-mt-3 flex w-full max-w-[520px] items-center gap-3 text-sm font-bold italic tracking-wide sm:text-base">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-fuchsia-400 shadow-[0_0_8px_#e879f9]" />
              O PAREDÃO TÁ ON!
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-fuchsia-400 shadow-[0_0_8px_#e879f9]" />
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <Image
              src="/images/mascote-robo-damas-da-night.png"
              alt="Mascote robô roxo com um olho da Damas da Night fazendo coração com as mãos"
              width={380}
              height={420}
              className="h-auto w-56 drop-shadow-[0_0_35px_rgba(168,85,247,0.8)] sm:w-72 md:w-[340px]"
              priority
            />
          </div>
        </header>

        {/* BARRA DE INFORMAÇÕES */}
        <section className="mt-2 grid gap-4 rounded-xl border border-violet-500/40 bg-[#0b0618]/90 p-4 shadow-[0_0_25px_rgba(139,92,246,0.25)] md:grid-cols-[1fr_1fr_auto] md:items-center md:gap-0 md:p-5">
          <div className="flex items-center gap-4 md:border-r md:border-violet-500/30 md:pr-6">
            <IconOlho className="h-11 w-11 shrink-0 fill-none stroke-violet-300 stroke-[1.4]" />
            <div>
              <p className="text-lg font-semibold">Votação oficial</p>
              <p className="text-sm text-violet-300">Vote no seu participante favorito</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:border-r md:border-violet-500/30 md:px-6">
            <span className="text-violet-300">
              <IconGrupo />
            </span>
            <div>
              <p className="text-lg font-semibold">Você participa</p>
              <p className="text-sm text-violet-300">Apenas os participantes do grupo</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:pl-6">
            <span className="text-violet-300">
              <IconRelogio />
            </span>
            <div>
              <p className="text-sm">Encerramento da votação em:</p>
              <div className="flex items-end gap-3 text-4xl font-bold leading-none tabular-nums text-violet-200">
                <span className="flex flex-col items-center">
                  {dias}
                  <small className="mt-1 text-xs font-normal text-white">dias</small>
                </span>
                <span className="pb-4 text-2xl">:</span>
                <span className="flex flex-col items-center">
                  {horas}
                  <small className="mt-1 text-xs font-normal text-white">horas</small>
                </span>
                <span className="pb-4 text-2xl">:</span>
                <span className="flex flex-col items-center">
                  {min}
                  <small className="mt-1 text-xs font-normal text-white">min</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CARDS DOS PARTICIPANTES */}
        <section
          aria-label="Participantes do paredão"
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {participantes.map((p) => (
            <article
              key={p.nome}
              className="overflow-hidden rounded-xl border border-violet-500/50 bg-[#0b0618] shadow-[0_0_20px_rgba(139,92,246,0.2)]"
            >
              <div className="relative aspect-[4/3.3] bg-[radial-gradient(circle_at_50%_70%,rgba(168,85,247,0.35),transparent_65%)]">
                {p.foto ? (
                  <Image
                    src={p.foto}
                    alt={`Foto de ${p.nome}, participante do paredão da Damas da Night`}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-7xl font-bold text-violet-400/40">
                    {p.nome[0]}
                  </div>
                )}
                <Image
                  src="/images/logo-damas-da-night-neon.png"
                  alt=""
                  width={70}
                  height={26}
                  className="absolute right-3 top-3 opacity-90"
                />
              </div>

              <div className="p-4 pt-3">
                <h2 className="text-2xl font-bold">{p.nome}</h2>
                <p className="mt-1 text-xs uppercase text-violet-300">
                  {p.idade} anos <span className="mx-1.5">•</span> {p.perfil}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {p.porcentagem.toFixed(2).replace(".", ",")}%
                </p>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400"
                    style={{ width: `${p.porcentagem}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setVotado(p.nome)}
                  aria-pressed={votado === p.nome}
                  className={`mt-4 flex w-full items-center justify-center gap-3 rounded-full border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 ${
                    votado === p.nome
                      ? "border-fuchsia-400 bg-fuchsia-500/30 shadow-[0_0_18px_rgba(217,70,239,0.6)]"
                      : "border-violet-400/70 bg-[#120a28] hover:bg-violet-500/20"
                  }`}
                >
                  <IconCurtir />
                  {votado === p.nome ? "Votado" : "Votar"}
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* RODAPÉ */}
        <footer className="mt-6 grid gap-4 border-t border-violet-500/50 pt-5 text-xs text-violet-100/90 md:grid-cols-3 md:gap-0">
          <div className="flex items-center gap-3 md:border-r md:border-violet-500/30 md:pr-6">
            <span className="text-violet-300">
              <IconEnvelope />
            </span>
            <p>Ao votar, o resultado será enviado ao grupo Damas da Night.</p>
          </div>
          <div className="flex items-center gap-3 md:border-r md:border-violet-500/30 md:px-6">
            <span className="text-violet-300">
              <IconPin />
            </span>
            <p>
              Sempre que um admin enviar #votação, o resultado oficial atualizado deste site será
              fixado no grupo.
            </p>
          </div>
          <div className="flex items-center gap-3 md:pl-6">
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
    </main>
  );
}