"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_KEY = "portail-theme";

type Theme = "clair" | "sombre";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "sombre" : "clair");

/**
 * Bascule clair / sombre. Le choix est gardé dans le navigateur (localStorage) ; sans choix,
 * le thème du système est suivi. Le script de app/layout.tsx pose data-theme avant l'affichage.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "clair" as Theme);
  const next: Theme = theme === "sombre" ? "clair" : "sombre";

  function toggle() {
    document.documentElement.dataset.theme = next === "sombre" ? "dark" : "light";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Stockage indisponible (navigation privée) : le choix vaut pour cette page seulement
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Passer en mode ${next}`}
      title={`Mode ${next}`}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-graphite transition-colors hover:bg-black/[0.05]"
    >
      {theme === "sombre" ? <Sun size={20} strokeWidth={1.7} aria-hidden /> : <Moon size={20} strokeWidth={1.7} aria-hidden />}
    </button>
  );
}
