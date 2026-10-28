"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { THEME_KEY } from "./ThemeToggle";

/**
 * Le mode sombre ne concerne que l'espace connecté (/etudiant) : connexion et inscription
 * restent toujours claires. Le script de app/layout.tsx règle le premier affichage ; ce
 * composant suit les navigations sans rechargement (déconnexion, connexion).
 */
export default function ThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    let dark = false;
    if (pathname.startsWith("/etudiant")) {
      try {
        const saved = localStorage.getItem(THEME_KEY);
        dark = saved ? saved === "sombre" : matchMedia("(prefers-color-scheme: dark)").matches;
      } catch {
        dark = false;
      }
    }
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [pathname]);

  return null;
}
