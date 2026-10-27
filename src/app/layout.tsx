import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

/*
  Titres : New Spirit (Adobe Fonts). En attendant le kit Typekit de la cliente,
  Fraunces (Google Fonts) sert d'équivalent visuel, comme sur le site vitrine.
*/
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-titles",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Portail · MLK Campus",
    template: "%s · Portail MLK Campus",
  },
  description: "Espace connecté des apprentis de MLK Campus, CFA à Créteil.",
  // Espace privé : rien à indexer
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={fraunces.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
