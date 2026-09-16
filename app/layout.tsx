import type { Metadata } from "next";
import { Great_Vibes, Montserrat } from "next/font/google";
import "./globals.css";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Damas da Night — Recadinho do Coração",
  description:
    "Mande sua mensagem anônima: um desabafo, uma indireta, um elogio ou apenas um pensamento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${greatVibes.variable} ${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}