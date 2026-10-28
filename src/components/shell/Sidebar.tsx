"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Logomark from "@/components/brand/Logomark";
import Logotype from "@/components/brand/Logotype";
import { SIDEBAR_COOKIE } from "@/lib/nav";
import NavLinks from "./NavLinks";

/**
 * Menu latéral sur ordinateur :
 * - Bandeau du logo de 80 px en haut, teinté selon la filière, logo agrandi
 * - Navigation sur fond clair, bordure droite discrète
 * - Largeur optimisée (216 px / 68 px)
 * - Mémorisation de l'état (replié/déplié) dans un cookie
 */
export default function Sidebar({
  unread,
  footer,
  initialCollapsed,
}: {
  unread: number;
  footer: React.ReactNode;
  initialCollapsed: boolean;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  }

  const label = collapsed ? "Déplier le menu" : "Replier le menu";

  return (
    <aside
      data-collapsed={collapsed}
      className={`group/sidebar sticky top-0 hidden h-screen shrink-0 flex-col border-r border-black/[0.08] bg-white transition-[width] duration-200 motion-reduce:transition-none md:flex ${
        collapsed ? "w-[60px]" : "w-[216px]"
      }`}
    >
      {/* Bandeau du logo (teinte de la filière), 80 px, aligné avec l'en-tête */}
      <div className="relative flex h-20 shrink-0 items-center justify-center bg-graphite px-2">
        <Link
          href="/etudiant"
          aria-label="Accueil du portail"
          className="flex items-center justify-center transition-opacity hover:opacity-90"
        >
          {collapsed ? (
            <Logomark variant="blanc" size={34} priority />
          ) : (
            <Logotype variant="blanc" height={50} priority />
          )}
        </Link>
      </div>

      {/* Bouton de repli/dépliage sous le cartouche */}
      <div className={`flex shrink-0 px-2 pt-2 pb-1 ${collapsed ? "justify-center" : "justify-end"}`}>
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-expanded={!collapsed}
          title={label}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-texte-doux transition-colors hover:bg-black/[0.05] hover:text-graphite"
        >
          {collapsed ? <ChevronRight size={16} aria-hidden /> : <ChevronLeft size={16} aria-hidden />}
        </button>
      </div>

      {/* Navigation principale */}
      <nav aria-label="Menu principal" className="flex-1 overflow-x-hidden overflow-y-auto px-2 pb-4">
        <NavLinks unread={unread} collapsed={collapsed} />
      </nav>

      {/* Profil et déconnexion en bas */}
      <div className="border-t border-black/[0.08] px-2 py-2">{footer}</div>
    </aside>
  );
}
