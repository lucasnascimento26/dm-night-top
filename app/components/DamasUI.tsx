import { HeartOutline, PencilIcon, SmileyIcon, ImageIcon, StarIcon, MicIcon, SendIcon } from "./DamasIcons";

/* -------------------------------------------------------------------- */
/*  Blocos pequenos reutilizáveis                                        */
/* -------------------------------------------------------------------- */

export function OrnamentDivider() {
  return (
    <div
      className="flex items-center justify-center gap-3 text-fuchsia-400/70 my-3"
      aria-hidden="true"
    >
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-fuchsia-400/60" />
      <HeartOutline className="w-3.5 h-3.5 text-pink-400" />
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-fuchsia-400/60" />
    </div>
  );
}

function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center gap-2 text-purple-100/90 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
    >
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-fuchsia-400/50 text-fuchsia-300 shadow-[0_0_10px_rgba(255,110,199,0.35)] transition-transform duration-200 group-hover:scale-110 group-active:scale-95 group-hover:shadow-[0_0_18px_rgba(255,110,199,0.65)]"
      >
        {icon}
      </span>
      <span className="text-[11px] leading-tight text-center max-w-[64px]">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------- */
/*  Sparkles de fundo                                                    */
/* -------------------------------------------------------------------- */

export const SPARKLES = [
  { top: "4%", left: "8%", size: 5 },
  { top: "10%", left: "88%", size: 4 },
  { top: "22%", left: "18%", size: 3 },
  { top: "18%", left: "78%", size: 5 },
  { top: "34%", left: "92%", size: 3 },
  { top: "40%", left: "4%", size: 4 },
  { top: "55%", left: "85%", size: 3 },
  { top: "62%", left: "10%", size: 5 },
  { top: "78%", left: "90%", size: 4 },
  { top: "88%", left: "6%", size: 3 },
  { top: "50%", left: "50%", size: 3 },
];

export function SparklesLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-fuchsia-200"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            boxShadow: "0 0 8px 2px rgba(255,200,240,0.9)",
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Formulário de recado                                                 */
/* -------------------------------------------------------------------- */

export function MessageForm() {
  return (
    <section
      className="relative z-10 mt-7 rounded-[2rem] neon-card-border px-6 py-7"
      aria-labelledby="recado-heading"
    >
      <HeartOutline
        className="absolute -top-3 -right-3 w-8 h-7 text-fuchsia-300"
        aria-hidden="true"
      />

      <div className="text-center mb-5">
        <img
          src="/images/marca-em-estilo-neon-rosa.webp"
          alt="Damas da Night"
          className="mx-auto h-auto w-[180px]"
        />
      </div>

      <h2 id="recado-heading" className="sr-only">
        Formulário para enviar um recado anônimo
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          // lógica de envio aqui
        }}
      >
        <label htmlFor="mensagem" className="block text-[15px] text-purple-100/90 mb-2">
          Escreva sua mensagem
        </label>

        <div className="relative">
          <PencilIcon
            className="absolute left-3 top-3 w-4 h-4 text-purple-300/80"
            aria-hidden="true"
          />
          <textarea
            id="mensagem"
            name="mensagem"
            rows={4}
            required
            placeholder={"Digite aqui o seu recadinho...\n(sem se identificar)"}
            className="neon-textarea w-full resize-none rounded-2xl border border-fuchsia-500/50 bg-black/40 py-3 pl-9 pr-3 text-base text-purple-50 placeholder-purple-300/50 outline-none transition-shadow focus-visible:border-fuchsia-300 focus-visible:shadow-[0_0_18px_rgba(255,110,199,0.5)] focus-visible:ring-2 focus-visible:ring-fuchsia-300/60"
          />
        </div>

        <div className="mt-6 flex justify-between px-1">
          <IconButton icon={<SmileyIcon className="w-6 h-6" />} label="Emojis" />
          <IconButton icon={<ImageIcon className="w-6 h-6" />} label="Anexar imagem" />
          <IconButton icon={<StarIcon className="w-6 h-6" />} label="Anexar figura" />
          <IconButton icon={<MicIcon className="w-6 h-6" />} label="Anexar áudio" />
        </div>

        <button
          type="submit"
          aria-label="Enviar recadinho anônimo"
          className="send-button mt-7 flex w-full items-center justify-center gap-3 rounded-full py-4 font-script text-2xl text-white transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            boxShadow:
              "0 0 24px rgba(255,79,216,0.55), 0 0 45px rgba(138,43,226,0.35)",
          }}
        >
          Enviar
          <SendIcon className="w-6 h-6" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}