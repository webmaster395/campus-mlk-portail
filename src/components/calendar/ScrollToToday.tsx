"use client";

import { useEffect } from "react";

/**
 * Sur téléphone, la semaine est une liste : on amène la journée du jour à l'écran plutôt
 * que de laisser les jours passés en premier. Sans effet sur grand écran (colonnes).
 */
export default function ScrollToToday({ targetId }: { targetId: string }) {
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Marge pour l'en-tête collant (64 px) et un peu d'air
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  }, [targetId]);

  return null;
}
