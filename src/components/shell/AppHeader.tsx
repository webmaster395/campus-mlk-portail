"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { sectionTitle } from "@/lib/nav";

/**
 * En-tête de l'espace, inspiré de Ministry School :
 * - À gauche : « Bonjour Prénom » sur l'accueil, nom de la section sur les autres pages
 * - À droite : pilule « Promotion 2026–2027 » bien visible, raccourci vers les annonces
 * (La déconnexion est dans le menu latéral en bas avec le profil, comme à l'origine).
 */
export default function AppHeader({
  firstName,
  promotionLabel,
  unread,
  mobileNav,
}: {
  firstName: string;
  promotionLabel: string | null;
  unread: number;
  mobileNav: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = pathname === "/etudiant" ? (firstName ? `Bonjour ${firstName}` : "Bonjour") : sectionTitle(pathname);

  // Affiche « Promotion 2026–2027 » de manière bien visible et valorisée
  const badgeText = promotionLabel
    ? promotionLabel.toLowerCase().includes("2026")
      ? "Promotion 2026–2027"
      : promotionLabel
    : "Promotion 2026–2027";

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.08] bg-porcelaine/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-8 md:h-20">
        {mobileNav}
        <p className="nr m-0 flex-1 truncate text-[19px] leading-tight sm:text-[21px]">{title}</p>

        {/* Pilule Promotion bien visible */}
        <span className="hidden rounded-full border border-iris/30 bg-lilas-pale px-3.5 py-1 text-[11.5px] font-semibold tracking-[0.08em] text-iris uppercase sm:inline">
          {badgeText}
        </span>

        <ThemeToggle />

        {/* Raccourci vers les annonces */}
        <Link
          href="/etudiant/messages"
          className="relative flex h-11 w-11 items-center justify-center rounded-xl text-graphite transition-colors hover:bg-black/[0.05]"
          aria-label={
            unread > 0
              ? `Messages : ${unread} annonce${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`
              : "Messages"
          }
        >
          <Megaphone size={20} strokeWidth={1.7} aria-hidden />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute top-1.5 right-1 min-w-[18px] rounded-full bg-iris px-1 text-center text-[10.5px] leading-[18px] font-bold text-white"
            >
              {unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
