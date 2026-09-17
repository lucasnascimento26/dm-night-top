/* -------------------------------------------------------------------- */
/*  Ícones (100% SVG, sem imagens externas)                              */
/* -------------------------------------------------------------------- */

export function HeartOutline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 28" className={className} fill="none">
      <path
        d="M16 26 C16 26 2 17.2 2 8.6 C2 3.8 5.9 1 9.8 1 C13 1 15.2 3 16 4.8 C16.8 3 19 1 22.2 1 C26.1 1 30 3.8 30 8.6 C30 17.2 16 26 16 26 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="rgba(255,110,199,0.06)"
      />
    </svg>
  );
}

export function EnvelopeHeart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 90" className={className} fill="none">
      <path
        d="M50 88 C50 88 4 60 4 30 C4 13 16 2 30 2 C40 2 47.5 8 50 15 C52.5 8 60 2 70 2 C84 2 96 13 96 30 C96 60 50 88 50 88 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="rgba(216,111,255,0.05)"
      />
      <rect x="26" y="30" width="48" height="32" rx="2" stroke="currentColor" strokeWidth="2.5" fill="#0a0410" />
      <path d="M26 31 L50 50 L74 31" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path
        d="M50 50 C50 50 44 45.5 44 41.5 C44 39 46 37.3 48 37.3 C49.3 37.3 50 38.3 50 39 C50 38.3 50.7 37.3 52 37.3 C54 37.3 56 39 56 41.5 C56 45.5 50 50 50 50 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Diamond({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor">
      <path d="M8 0 L11 5 L8 16 L5 5 Z" />
      <path d="M0 5 H16 L8 8 Z" opacity="0.6" />
    </svg>
  );
}

export function PencilIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20 L4.8 16 L16 4.8 C16.8 4 18 4 18.8 4.8 L19.2 5.2 C20 6 20 7.2 19.2 8 L8 19.2 Z" />
      <path d="M13.5 6.5 L17.5 10.5" />
    </svg>
  );
}

export function SmileyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="16" cy="16" r="13" />
      <path d="M9 12 L9.01 12" strokeWidth="3" strokeLinecap="round" />
      <path d="M23 12 L23.01 12" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 19 C11 23 21 23 23 19" strokeLinecap="round" />
      <path d="M4 6 C6 3 9 3 10 5" strokeWidth="1.4" opacity="0.7" />
    </svg>
  );
}

export function ImageIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="26" height="22" rx="2" />
      <circle cx="11" cy="13" r="2.6" />
      <path d="M3 22 L11 15 L17 20 L22 15 L29 22" />
    </svg>
  );
}

export function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M16 2 L20 12 L31 12.5 L22.5 19.5 L25.5 30 L16 24 L6.5 30 L9.5 19.5 L1 12.5 L12 12 Z" />
    </svg>
  );
}

export function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="12" y="2" width="8" height="16" rx="4" />
      <path d="M7 15 C7 21 11 25 16 25 C21 25 25 21 25 15" />
      <line x1="16" y1="25" x2="16" y2="30" />
      <line x1="11" y1="30" x2="21" y2="30" />
    </svg>
  );
}

export function MusicIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 24 L12 6 L26 3 L26 21" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="25" r="4" />
      <circle cx="22" cy="22" r="4" />
    </svg>
  );
}

export function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 16 L29 3 L20 29 L15 18 L3 16 Z" strokeLinejoin="round" fill="rgba(255,255,255,0.08)" />
      <line x1="15" y1="18" x2="29" y2="3" />
    </svg>
  );
}

export function CornerOrnament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 70" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 2 C2 30 6 50 34 50" opacity="0.7" />
      <path d="M2 2 C24 2 44 8 44 30" opacity="0.5" />
      <circle cx="34" cy="50" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="44" cy="30" r="1.8" fill="currentColor" stroke="none" />
      <path d="M2 14 C10 14 14 18 14 24" opacity="0.35" />
    </svg>
  );
}