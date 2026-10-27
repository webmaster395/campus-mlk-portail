"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone } from "lucide-react";
import Logomark from "@/components/brand/Logomark";
import { sectionTitle } from "@/lib/nav";

/**
 * En-tête de l'espace : bouton du menu et logomark sur téléphone, nom de la section,
 * promotion et raccourci vers les annonces non lues.
 */
export default function AppHeader({
  promotionLabel,
  unread,
  mobileNav,
}: {
  promotionLabel: string | null;
  unread: number;
  mobileNav: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.08] bg-porcelaine/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-3 px-4 sm:px-8">
        {mobileNav}
        <Link href="/etudiant" aria-label="Accueil du portail" className="flex md:hidden">
          <Logomark size={26} />
        </Link>
        <p className="m-0 flex-1 truncate text-[15px] font-semibold">{sectionTitle(pathname)}</p>

        {promotionLabel && (
          <span className="hidden rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-texte sm:inline">
            {promotionLabel}
          </span>
        )}
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
