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
  metadataBase: new URL("https://www.damasdanight.top"),
  title: "Damas da Night | Recadinho do Coração",
  description:
    "Site oficial da Damas da Night. Mande sua mensagem anônima: um desabafo, um recado, uma indireta, um elogio ou apenas um pensamento.",
  openGraph: {
    title: "Damas da Night | Recadinho do Coração",
    description:
      "Mande sua mensagem anônima: um desabafo, um recado, uma indireta, um elogio ou apenas um pensamento.",
    type: "website",
    locale: "pt_BR",
    siteName: "Damas da Night",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${greatVibes.variable} ${montserrat.variable} font-[family-name:var(--font-montserrat)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}