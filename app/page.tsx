"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { HeartOutline, EnvelopeHeart, Diamond, CornerOrnament } from "./components/DamasIcons";
import { OrnamentDivider, SparklesLayer, MessageForm } from "./components/DamasUI";
import CupidEffectsLayer from "./components/CupidEffects";

export default function DamasDaNightPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".gsap-fade", {
        opacity: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.08,
      }).from(
        ".gsap-icon-btn",
        { opacity: 0, y: 14, scale: 0.8, duration: 0.5, stagger: 0.08 },
        "-=0.3"
      );

      if (!prefersReducedMotion) {
        gsap.to(".gsap-neon", {
          textShadow:
            "0 0 8px rgba(255,110,199,0.9), 0 0 22px rgba(255,47,208,0.7), 0 0 46px rgba(255,47,208,0.45)",
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.3, from: "random" },
        });

        gsap.to(".gsap-heart-pulse", {
          scale: 1.08,
          duration: 1.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: "50% 50%",
        });

        gsap.to(".gsap-send-btn", {
          boxShadow:
            "0 0 40px rgba(255,79,216,0.85), 0 0 70px rgba(138,43,226,0.5)",
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        gsap.utils.toArray<HTMLElement>(".gsap-sparkle").forEach((el) => {
          gsap.to(el, {
            opacity: 0.15,
            scale: 0.4,
            duration: 0.9 + Math.random() * 0.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: Number(el.dataset.delay ?? 0),
          });
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    // Fundo geral da página (fora do "cartão"), usando back.png.
    // Precisa estar em public/images/back.png
    <main
      className="relative min-h-screen w-full overflow-hidden bg-[#07030c] flex justify-center items-start sm:items-center py-0 sm:py-10 px-0 sm:px-4 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: "url('/images/back.png')" }}
    >
      {/* overlay escuro sutil por cima do back.png, pra manter contraste
          e legibilidade do cartão no centro */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      {/* efeitos decorativos no fundo externo da página (fora do cartão) */}
      <CupidEffectsLayer variant="page" />

      {/* ---------------- Cartão (moldura fixa tipo mobile) ---------------- */}
      <div className="relative isolate w-full max-w-[420px] min-h-screen sm:min-h-[860px] overflow-hidden sm:rounded-[2.5rem] sm:shadow-[0_0_60px_rgba(0,0,0,0.6)] text-white">
        {/* camada de fundo — "contain" + "left top" faz a imagem escalar
            proporcionalmente (sem cortar e sem distorcer), ancorada na
            lateral esquerda e subindo para o topo do cartão, em qualquer
            tamanho de tela.
            IMPORTANTE: o arquivo precisa estar em public/images/misteriosa-roxa.png */}
        <div
          className="absolute inset-0 -z-10 bg-no-repeat"
          style={{
            backgroundImage: "url('/images/misteriosa-roxa.png')",
            backgroundSize: "contain",
            backgroundPosition: "left top",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />
        {/* overlay em gradiente: mais escuro à direita (onde fica o conteúdo) */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black/25 via-black/55 to-black/70"
          aria-hidden="true"
        />

        <div
          ref={containerRef}
          className="relative z-10 w-full px-2 py-4"
        >
          <SparklesLayer />

          {/* ornamentos de canto */}
          <CornerOrnament className="absolute -top-1 -left-1 w-16 h-16 text-fuchsia-500/50 gsap-fade" />
          <CornerOrnament className="absolute -top-1 -right-1 w-16 h-16 text-fuchsia-500/50 scale-x-[-1] gsap-fade" />

          {/* ---------------- Header ---------------- */}
          <header className="relative z-10 text-center pt-8">
            <Image
              src="/images/marca-em-estilo-neon-rosa.png"
              alt="Damas da Night"
              width={360}
              height={210}
              priority
              className="gsap-fade mx-auto h-auto w-[260px]"
            />

            <OrnamentDivider />

            <p className="gsap-fade text-[13px] tracking-[0.25em] text-pink-200/90">
              AMIZADE &middot; RESPEITO &middot; DIVERSÃO
            </p>

            <div className="gsap-fade mt-2 flex items-center justify-center gap-3 text-fuchsia-500/60">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-fuchsia-500/60" />
              <Diamond className="w-2.5 h-2.5 text-fuchsia-300" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-fuchsia-500/60" />
            </div>
          </header>

          {/* ---------------- Recadinho do Coração ---------------- */}
          <section className="relative z-10 text-center px-2 mt-6">
            <div className="flex items-center justify-center gap-3">
              <EnvelopeHeart className="gsap-fade gsap-heart-pulse w-24 h-20 text-fuchsia-400" />
              <h2 className="gsap-fade gsap-neon font-script text-[2.6rem] leading-[0.95] text-fuchsia-300 text-left">
                Recadinho
                <span className="flex items-center gap-1 text-4xl">
                  do Coração
                  <HeartOutline className="w-5 h-4 text-pink-400" />
                </span>
              </h2>
            </div>

            <OrnamentDivider />

            <p className="gsap-fade mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-purple-100/90">
              Aqui você pode mandar sua mensagem de forma anônima. Pode ser um
              desabafo, um recado, uma indireta, um elogio ou apenas um
              pensamento...
            </p>

            <div className="gsap-fade mt-6 flex justify-center">
              <Image
                src="/images/mensagem-corada.png"
                alt="O importante é falar o que sente!"
                width={480}
                height={140}
                className="h-auto w-full max-w-[340px]"
              />
            </div>

            <p className="gsap-fade mt-6 flex items-center justify-center gap-2 text-[12px] tracking-wide text-pink-300">
              <HeartOutline className="w-3.5 h-3 text-pink-400" />
              NA DAMAS DA NIGHT ATÉ O SILÊNCIO TEM VOZ...
              <HeartOutline className="w-3.5 h-3 text-pink-400" />
            </p>
          </section>

          {/* ---------------- Formulário ---------------- */}
          <MessageForm />

          {/* ---------------- Footer ---------------- */}
          <footer className="relative z-10 text-center mt-6 pb-2">
            <OrnamentDivider />
            <p className="gsap-fade flex items-center justify-center gap-2 text-[12px] text-pink-200">
              <HeartOutline className="w-3.5 h-3 text-pink-400" />
              Respeito é regra, anonimato é opção!
              <HeartOutline className="w-3.5 h-3 text-pink-400" />
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}