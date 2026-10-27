"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logotype from "@/components/brand/Logotype";
import NavLinks from "./NavLinks";

/**
 * Menu du téléphone : un bouton de l'en-tête ouvre un tiroir reprenant le menu de
 * l'ordinateur (masqué à partir de md). Échap ou un clic à côté le referment, le focus
 * entre dans le tiroir puis revient au bouton, et la page ne défile plus derrière.
 */
export default function MobileNav({
  unread,
  footer,
}: {
  unread: number;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // Refermer dès que la page change (y compris le bouton « retour » du téléphone),
  // pendant le rendu pour ne pas afficher le tiroir un instant sur la nouvelle page
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const opener = trigger.current;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label={
          unread > 0
            ? `Ouvrir le menu, ${unread} annonce${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`
            : "Ouvrir le menu"
        }
        className="-ml-2 flex h-11 w-11 cursor-pointer touch-manipulation items-center justify-center rounded-xl border-none bg-transparent text-graphite transition-colors hover:bg-black/[0.05]"
      >
        <span className="relative">
          <Menu size={24} strokeWidth={1.7} aria-hidden />
          {unread > 0 && (
            <span aria-hidden className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-iris" />
          )}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex h-[100dvh]">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="scrim absolute inset-0 cursor-pointer border-none bg-graphite/45"
          />
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="drawer-in relative flex h-full w-[296px] max-w-[86vw] flex-col overflow-y-auto overscroll-contain bg-graphite shadow-[0_0_40px_rgba(0,0,0,0.3)] outline-none"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-7">
              <Logotype variant="blanc" height={32} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-white/80 transition-colors hover:bg-white/10"
              >
                <X size={22} strokeWidth={1.8} aria-hidden />
              </button>
            </div>
            <nav aria-label="Menu principal" className="flex-1 px-3 pb-6">
              <NavLinks unread={unread} />
            </nav>
            <div className="border-t border-white/10 px-3 py-3">{footer}</div>
          </div>
        </div>
      )}
    </div>
  );
}
