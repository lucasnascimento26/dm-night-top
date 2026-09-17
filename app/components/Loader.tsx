export default function Loader({ isExiting = false }: { isExiting?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07030c] loader-exit ${
        isExiting ? "loader-exit-active" : ""
      }`}
    >
      {/* monograma */}
      <span
        className="font-script text-6xl text-fuchsia-300 loader-fade-in"
        style={{
          textShadow:
            "0 0 10px rgba(255,110,199,0.9), 0 0 28px rgba(216,111,255,0.6)",
        }}
      >
        DN
      </span>

      {/* subtítulo */}
      <p className="mt-4 text-[12px] tracking-[0.35em] text-purple-200/80 loader-fade-in loader-delay-1">
        DAMAS DA NIGHT
      </p>

      {/* linha fina */}
      <span className="mt-5 h-px w-16 bg-fuchsia-400/60 loader-fade-in loader-delay-2 loader-line" />
    </div>
  );
}