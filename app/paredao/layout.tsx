import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Damas da Night | Paredão",
  description:
    "O paredão da Damas da Night está on! Vote no participante e acompanhe o resultado. Só membros do grupo podem votar.",
  openGraph: {
    title: "Damas da Night | Paredão",
    description:
      "O paredão está on! Vote e acompanhe o resultado. Só membros do grupo podem votar.",
    type: "website",
    locale: "pt_BR",
    siteName: "Damas da Night",
  },
};

export default function ParedaoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}