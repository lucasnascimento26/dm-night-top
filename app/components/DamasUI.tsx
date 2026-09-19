"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { HeartOutline, PencilIcon, ImageIcon, MusicIcon, SendIcon } from "./DamasIcons";

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
  active,
  fileName,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  fileName?: string | null;
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
        className={`flex h-14 w-14 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${
          active
            ? "border-fuchsia-300 text-fuchsia-200 shadow-[0_0_18px_rgba(255,110,199,0.75)]"
            : "border-fuchsia-400/50 text-fuchsia-300 shadow-[0_0_10px_rgba(255,110,199,0.35)] group-hover:shadow-[0_0_18px_rgba(255,110,199,0.65)]"
        }`}
      >
        {icon}
      </span>
      <span className="text-[11px] leading-tight text-center max-w-[80px] truncate">
        {fileName ? fileName : label}
      </span>
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

const MAX_PHOTO_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_MUSIC_SIZE = 20 * 1024 * 1024; // 20MB

// ------------------------------------------------------------------
// Telefone: sem prefixo fixo. A pessoa digita do jeito que quiser —
// com "55" na frente ou só DDD+número.
//
// Aceita DDD (2 dígitos válidos) + número de 8 OU 9 dígitos:
//   - 9 dígitos = celular no padrão atual (sempre começa com 9)
//   - 8 dígitos = formato antigo, pré-2016, ainda usado por muita
//     gente que nunca atualizou o WhatsApp. Aceitamos por realidade
//     de uso, mesmo não sendo mais o padrão oficial da Anatel.
// ------------------------------------------------------------------

const DDDS_VALIDOS = new Set([
  "11","12","13","14","15","16","17","18","19",
  "21","22","24","27","28",
  "31","32","33","34","35","37","38",
  "41","42","43","44","45","46",
  "47","48","49",
  "51","53","54","55",
  "61","62","63","64","65","66","67","68","69",
  "71","73","74","75","77","79",
  "81","82","83","84","85","86","87","88","89",
  "91","92","93","94","95","96","97","98","99",
]);

// Remove um "55" de código de país, se a pessoa tiver digitado e
// sobrar mais dígito do que cabe em DDD + número (máx. 11).
function removerCodigoPaisSeSobrar(digits: string): string {
  if (digits.length > 11 && digits.startsWith("55")) {
    return digits.slice(2);
  }
  return digits;
}

// Formata visualmente enquanto a pessoa digita, no padrão nacional BR.
//
// Feito à mão (sem depender de AsYouType/libphonenumber-js) porque a lib
// tenta casar com um número "real" válido e, para números de 8 dígitos
// (formato antigo que aceitamos), às vezes aplicava um agrupamento errado
// (ex.: "67865-465" em vez de "6786-5465").
//
// Regra usada aqui: se o primeiro dígito depois do DDD for "9", tratamos
// como celular (9 dígitos, agrupa 5-4). Caso contrário, tratamos como
// fixo/antigo (8 dígitos, agrupa 4-4).
function formatarTelefoneVisual(valor: string) {
  const digitsBrutos = valor.replace(/\D/g, "").slice(0, 13);
  const digits = removerCodigoPaisSeSobrar(digitsBrutos);

  if (digits.length === 0) return "";

  const ddd = digits.slice(0, 2);
  const resto = digits.slice(2);

  let saida = `(${ddd}`;
  if (digits.length <= 2) return saida;
  saida += ") ";

  const isProvavelCelular = resto[0] === "9";

  if (isProvavelCelular) {
    if (resto.length <= 5) return saida + resto;
    return saida + resto.slice(0, 5) + "-" + resto.slice(5, 9);
  } else {
    if (resto.length <= 4) return saida + resto;
    return saida + resto.slice(0, 4) + "-" + resto.slice(4, 8);
  }
}

// Valida e devolve os dígitos nacionais (DDD + número, sem "55").
// Aceita número de 8 ou 9 dígitos após o DDD. Retorna null se inválido.
function extrairDigitosNacionais(valor: string): string | null {
  const digitsBrutos = valor.replace(/\D/g, "");
  const digits = removerCodigoPaisSeSobrar(digitsBrutos);

  // precisa ser DDD (2) + número (8 ou 9) = 10 ou 11 dígitos
  if (digits.length !== 10 && digits.length !== 11) return null;

  const ddd = digits.slice(0, 2);
  if (!DDDS_VALIDOS.has(ddd)) return null;

  const numero = digits.slice(2);

  // celular de 9 dígitos precisa começar com "9"
  if (numero.length === 9 && numero[0] !== "9") return null;

  return digits;
}

export function MessageForm() {
  const [mensagem, setMensagem] = useState("");
  const [telefone, setTelefone] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [musica, setMusica] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "enviando" | "sucesso" | "erro">("idle");
  const [erro, setErro] = useState("");

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const musicaInputRef = useRef<HTMLInputElement>(null);

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTelefone(formatarTelefoneVisual(e.target.value));
  }

  function handleTelefoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      const digitosAtuais = telefone.replace(/\D/g, "");
      if (digitosAtuais.length > 0) {
        e.preventDefault();
        const novosDigitos = digitosAtuais.slice(0, -1);
        setTelefone(formatarTelefoneVisual(novosDigitos));
      }
    }
  }

  function handleTelefonePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const textoColado = e.clipboardData.getData("text");
    setTelefone(formatarTelefoneVisual(textoColado));
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_PHOTO_SIZE) {
      setErro("A foto precisa ter até 15MB.");
      e.target.value = "";
      return;
    }
    setErro("");
    setFoto(file);
  }

  function handleMusicaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_MUSIC_SIZE) {
      setErro("O áudio precisa ter até 20MB.");
      e.target.value = "";
      return;
    }
    setErro("");
    setMusica(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "enviando") return;

    const trimmed = mensagem.trim();
    if (!trimmed) {
      setErro("Escreva uma mensagem antes de enviar.");
      return;
    }

    const digitos = extrairDigitosNacionais(telefone);

    if (!digitos) {
      setErro(
        telefone.trim().length === 0
          ? "Informe o WhatsApp de quem vai receber, com DDD."
          : "Número incompleto ou inválido. Confira o DDD e o número."
      );
      return;
    }

    setErro("");
    setStatus("enviando");

    try {
      let photoUrl: string | undefined;
      let musicUrl: string | undefined;

      if (foto) {
        const blob = await upload(`recados/foto-${Date.now()}-${foto.name}`, foto, {
          access: "public",
          handleUploadUrl: "/api/recados/upload",
        });
        photoUrl = blob.url;
      }

      if (musica) {
        const blob = await upload(`recados/musica-${Date.now()}-${musica.name}`, musica, {
          access: "public",
          handleUploadUrl: "/api/recados/upload",
        });
        musicUrl = blob.url;
      }

      const res = await fetch("/api/recados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          photoUrl,
          musicUrl,
          numeroDestinatario: digitos, // 10 (formato antigo) ou 11 dígitos (atual), sem "55"
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Falha ao enviar");
      }

      setStatus("sucesso");
      setMensagem("");
      setTelefone("");
      setFoto(null);
      setMusica(null);
      if (fotoInputRef.current) fotoInputRef.current.value = "";
      if (musicaInputRef.current) musicaInputRef.current.value = "";
    } catch (err) {
      console.error("[recado] falhou:", err);
      setStatus("erro");
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar seu recado. Tente novamente."
      );
    }
  }

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

      {status === "sucesso" ? (
        <div className="text-center py-6">
          <p className="text-lg text-fuchsia-200 font-script text-2xl mb-4">
            Seu recadinho foi enviado! 💌
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-sm text-purple-200 underline underline-offset-4"
          >
            Enviar outro recado
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder={"Digite aqui o seu recadinho...\n(sem se identificar)"}
              className="neon-textarea w-full resize-none rounded-2xl border border-fuchsia-500/50 bg-black/40 py-3 pl-9 pr-3 text-base text-purple-50 placeholder-purple-300/50 outline-none transition-shadow focus-visible:border-fuchsia-300 focus-visible:shadow-[0_0_18px_rgba(255,110,199,0.5)] focus-visible:ring-2 focus-visible:ring-fuchsia-300/60"
            />
          </div>

          <label htmlFor="telefone" className="block text-[15px] text-purple-100/90 mt-5 mb-2">
            WhatsApp de quem vai receber (com DDD)
          </label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="numeric"
            required
            value={telefone}
            onChange={handleTelefoneChange}
            onKeyDown={handleTelefoneKeyDown}
            onPaste={handleTelefonePaste}
            placeholder="(85) 99999-8888"
            maxLength={19}
            className="neon-textarea w-full rounded-2xl border border-fuchsia-500/50 bg-black/40 py-3 px-4 text-base text-purple-50 placeholder-purple-300/50 outline-none transition-shadow focus-visible:border-fuchsia-300 focus-visible:shadow-[0_0_18px_rgba(255,110,199,0.5)] focus-visible:ring-2 focus-visible:ring-fuchsia-300/60"
          />

          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFotoChange}
          />
          <input
            ref={musicaInputRef}
            type="file"
            accept="audio/*,.opus,.ogg,.m4a,.aac,.flac,.mp3,.wav"
            className="hidden"
            onChange={handleMusicaChange}
          />

          <div className="mt-6 flex justify-center gap-10 px-1">
            <IconButton
              icon={<ImageIcon className="w-6 h-6" />}
              label="Anexar foto"
              active={!!foto}
              fileName={foto?.name}
              onClick={() => fotoInputRef.current?.click()}
            />
            <IconButton
              icon={<MusicIcon className="w-6 h-6" />}
              label="Anexar música"
              active={!!musica}
              fileName={musica?.name}
              onClick={() => musicaInputRef.current?.click()}
            />
          </div>

          {erro && (
            <p className="mt-4 text-center text-sm text-red-300">{erro}</p>
          )}

          <button
            type="submit"
            disabled={status === "enviando"}
            aria-label="Enviar recadinho anônimo"
            className="send-button mt-7 flex w-full items-center justify-center gap-3 rounded-full py-4 font-script text-2xl text-white transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60"
            style={{
              boxShadow:
                "0 0 24px rgba(255,79,216,0.55), 0 0 45px rgba(138,43,226,0.35)",
            }}
          >
            {status === "enviando" ? "Enviando..." : "Enviar"}
            <SendIcon className="w-6 h-6" aria-hidden="true" />
          </button>
        </form>
      )}
    </section>
  );
}