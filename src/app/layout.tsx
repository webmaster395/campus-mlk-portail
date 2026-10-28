import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { Suspense } from "react";
import ThemeSync from "@/components/shell/ThemeSync";
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
    <html lang="fr" className={fraunces.variable} suppressHydrationWarning>
      <head>
        {/* Thème clair / sombre posé avant l'affichage (pas d'éclair blanc) : choix gardé, sinon thème du système */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("portail-theme");var d=location.pathname.indexOf("/etudiant")===0&&(t?t==="sombre":matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <Suspense fallback={null}>
          <ThemeSync />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
