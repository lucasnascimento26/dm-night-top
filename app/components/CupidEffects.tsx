"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

function NeonHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 21s-6.5-4.35-9.3-8.1C.8 10.3 1.2 6.6 4.2 4.9c2.4-1.4 5.2-.5 6.8 1.6C12.6 4.4 15.4 3.5 17.8 4.9c3 1.7 3.4 5.4 1.5 8-2.8 3.75-9.3 8.1-9.3 8.1z" />
    </svg>
  );
}

// Cupidinho fofo (bebê com arco e flecha), estilo cartoon suave,
// em tons rosa/lilás/dourado pra combinar com o neon do site.
function CupidBaby({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      {/* asas */}
      <path
        d="M30 40c-14-6-22 2-24 14 10 2 20-2 26-10z"
        fill="#f3e8ff"
        opacity="0.9"
      />
      <path
        d="M70 40c14-6 22 2 24 14-10 2-20-2-26-10z"
        fill="#f3e8ff"
        opacity="0.9"
      />
      {/* corpo */}
      <ellipse cx="50" cy="72" rx="16" ry="14" fill="#ffd7c2" />
      {/* cabeça */}
      <circle cx="50" cy="46" r="20" fill="#ffd7c2" />
      {/* cabelo */}
      <path
        d="M31 42c-1-14 9-24 19-24s20 10 19 24c-4-6-10-9-19-9s-15 3-19 9z"
        fill="#e8b84b"
      />
      {/* bochechas */}
      <circle cx="40" cy="50" r="3.2" fill="#ff9ecb" opacity="0.8" />
      <circle cx="60" cy="50" r="3.2" fill="#ff9ecb" opacity="0.8" />
      {/* olhinhos fechados (feliz) */}
      <path d="M37 45c2 2 5 2 7 0" stroke="#5b3a29" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 45c2 2 5 2 7 0" stroke="#5b3a29" strokeWidth="2" strokeLinecap="round" />
      {/* arco */}
      <path
        d="M22 34c-6 10-6 26 0 36"
        stroke="#e0a3ff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* flecha com ponta de coração */}
      <path d="M22 52h40" stroke="#ff5fb8" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M60 52c1.8-2.4 5.4-2 5.4 0.9 0 2.4-5.4 5.1-5.4 5.1s-5.4-2.7-5.4-5.1c0-2.9 3.6-3.3 5.4-0.9z"
        fill="#ff2fd0"
      />
    </svg>
  );
}

function LoveEnvelope({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="1.5" y="2.5" width="29" height="19" rx="2.5" />
      <path d="M2.5 4.5l13.5 10 13.5-10" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M16 12.2c-1.2-1.6-3.6-1.3-3.6.6 0 1.6 3.6 3.4 3.6 3.4s3.6-1.8 3.6-3.4c0-1.9-2.4-2.2-3.6-.6z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

type FloatItem = {
  Icon: typeof NeonHeart;
  className: string;
  style: React.CSSProperties;
};

// ---------- Variante "card": mantida no arquivo, não usada em page.tsx ----------
const CARD_ITEMS: FloatItem[] = [
  { Icon: NeonHeart, className: "gsap-cupid-heart w-6 h-6 text-fuchsia-400/35", style: { top: "8%", left: "6%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-5 h-5 text-pink-400/30", style: { top: "22%", left: "85%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-5 h-5 text-purple-400/30", style: { top: "48%", left: "4%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-6 h-6 text-fuchsia-300/28", style: { top: "68%", left: "88%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-4 h-4 text-pink-300/30", style: { top: "85%", left: "10%" } },

  { Icon: CupidBaby, className: "gsap-cupid-arrow w-9 h-9 opacity-25 -rotate-6", style: { top: "15%", left: "68%" } },
  { Icon: CupidBaby, className: "gsap-cupid-arrow w-8 h-8 opacity-20 rotate-[10deg]", style: { top: "60%", left: "-2%" } },
  { Icon: CupidBaby, className: "gsap-cupid-arrow w-9 h-9 opacity-25 -rotate-3", style: { top: "90%", left: "58%" } },

  { Icon: LoveEnvelope, className: "gsap-cupid-envelope w-7 h-6 text-fuchsia-300/28", style: { top: "35%", left: "90%" } },
  { Icon: LoveEnvelope, className: "gsap-cupid-envelope w-8 h-6 text-pink-300/25", style: { top: "78%", left: "3%" } },
  { Icon: LoveEnvelope, className: "gsap-cupid-envelope w-6 h-5 text-purple-300/28", style: { top: "5%", left: "45%" } },
];

// ---------- Variante "page": fundo externo (área escura fora do cartão) ----------
const PAGE_ITEMS: FloatItem[] = [
  { Icon: NeonHeart, className: "gsap-cupid-heart w-8 h-8 text-fuchsia-400/25", style: { top: "6%", left: "8%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-6 h-6 text-pink-400/22", style: { top: "18%", left: "88%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-9 h-9 text-purple-400/22", style: { top: "38%", left: "4%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-7 h-7 text-fuchsia-300/22", style: { top: "55%", left: "92%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-8 h-8 text-pink-300/22", style: { top: "78%", left: "6%" } },
  { Icon: NeonHeart, className: "gsap-cupid-heart w-6 h-6 text-fuchsia-400/18", style: { top: "88%", left: "90%" } },

  { Icon: CupidBaby, className: "gsap-cupid-arrow w-14 h-14 opacity-20 -rotate-6", style: { top: "12%", left: "70%" } },
  { Icon: CupidBaby, className: "gsap-cupid-arrow w-12 h-12 opacity-[0.18] rotate-[8deg]", style: { top: "45%", left: "0%" } },
  { Icon: CupidBaby, className: "gsap-cupid-arrow w-14 h-14 opacity-20 -rotate-3", style: { top: "68%", left: "78%" } },
  { Icon: CupidBaby, className: "gsap-cupid-arrow w-11 h-11 opacity-[0.15] rotate-[6deg]", style: { top: "92%", left: "2%" } },

  { Icon: LoveEnvelope, className: "gsap-cupid-envelope w-9 h-7 text-fuchsia-300/22", style: { top: "28%", left: "94%" } },
  { Icon: LoveEnvelope, className: "gsap-cupid-envelope w-10 h-7 text-pink-300/20", style: { top: "62%", left: "2%" } },
  { Icon: LoveEnvelope, className: "gsap-cupid-envelope w-7 h-6 text-purple-300/22", style: { top: "3%", left: "40%" } },
  { Icon: LoveEnvelope, className: "gsap-cupid-envelope w-8 h-6 text-pink-400/20", style: { top: "80%", left: "44%" } },
];

function animate(root: HTMLDivElement, variant: "card" | "page") {
  const isSoft = variant === "page";
  const glowIntensity = isSoft ? 0.4 : 0.55;

  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>(".gsap-cupid-heart", root).forEach((el, i) => {
      gsap.to(el, {
        y: (isSoft ? -8 : -14) - Math.random() * (isSoft ? 6 : 10),
        x: (Math.random() - 0.5) * (isSoft ? 6 : 10),
        rotation: (Math.random() - 0.5) * (isSoft ? 8 : 14),
        duration: (isSoft ? 6 : 4) + Math.random() * 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.3,
      });

      gsap.to(el, {
        filter: `drop-shadow(0 0 ${6 * glowIntensity}px rgba(255,110,199,${0.9 * glowIntensity})) drop-shadow(0 0 ${14 * glowIntensity}px rgba(255,47,208,${0.7 * glowIntensity}))`,
        duration: 2.6 + Math.random(),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.2,
      });
    });

    gsap.utils.toArray<HTMLElement>(".gsap-cupid-arrow", root).forEach((el, i) => {
      gsap.to(el, {
        y: (isSoft ? -6 : -10) - Math.random() * 6,
        x: (Math.random() - 0.5) * (isSoft ? 6 : 10),
        rotation: (Math.random() - 0.5) * 6,
        duration: (isSoft ? 5 : 3.5) + Math.random() * 1.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
      });
    });

    gsap.utils.toArray<HTMLElement>(".gsap-cupid-envelope", root).forEach((el, i) => {
      gsap.to(el, {
        y: isSoft ? -5 : -9,
        rotation: (Math.random() - 0.5) * (isSoft ? 4 : 8),
        duration: (isSoft ? 5.5 : 4) + Math.random() * 1.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.35,
      });

      gsap.to(el, {
        filter: `drop-shadow(0 0 ${6 * glowIntensity}px rgba(255,110,199,${0.8 * glowIntensity})) drop-shadow(0 0 ${12 * glowIntensity}px rgba(255,47,208,${0.5 * glowIntensity}))`,
        duration: 2.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.3,
      });
    });
  }, root);

  return ctx;
}

export default function CupidEffectsLayer({
  variant = "card",
}: {
  variant?: "card" | "page";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const items = variant === "page" ? PAGE_ITEMS : CARD_ITEMS;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const root = rootRef.current;
    if (!root || prefersReducedMotion) return;

    const ctx = animate(root, variant);
    return () => ctx.revert();
  }, [variant]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {items.map(({ Icon, className, style }, i) => (
        <div key={i} className="absolute" style={style}>
          <Icon className={className} />
        </div>
      ))}
    </div>
  );
}