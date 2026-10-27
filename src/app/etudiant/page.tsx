import type { Metadata } from "next";
import { getViewer } from "@/lib/data/viewer";

export const metadata: Metadata = { title: "Accueil" };

/* Page provisoire de l'étape 2 : le tableau de bord complet arrive à l'étape 4.1. */
export default async function StudentHomePage() {
  const viewer = await getViewer();
  if (!viewer) return null;

  return (
    <section className="pg flex flex-col gap-6">
      <p className="eyebrow m-0">{viewer.promotion?.label ?? "Espace apprentis"}</p>
      <h1 className="nr m-0 text-[40px] leading-[1.05] sm:text-[52px]">
        Bonjour {viewer.firstName || viewer.fullName}.
      </h1>
      <div className="card max-w-[560px] p-6">
        <p className="m-0 text-sm text-texte-doux">Votre formation</p>
        <p className="mt-1 mb-0 text-lg font-semibold">
          {viewer.formation?.title ?? "Aucune formation pour le moment"}
        </p>
        {!viewer.promotion && (
          <p className="mt-3 mb-0 text-sm leading-relaxed text-texte">
            Votre compte n&apos;est pas encore rattaché à une promotion. L&apos;équipe de MLK
            Campus s&apos;en occupe.
          </p>
        )}
        {viewer.unreadAnnouncements > 0 && (
          <p className="mt-3 mb-0 text-sm text-texte">
            {viewer.unreadAnnouncements} nouvelle{viewer.unreadAnnouncements > 1 ? "s" : ""}{" "}
            annonce{viewer.unreadAnnouncements > 1 ? "s" : ""}.
          </p>
        )}
      </div>
    </section>
  );
}
