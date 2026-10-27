import type { Metadata } from "next";
import { Hourglass } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getViewer } from "@/lib/data/viewer";

export const metadata: Metadata = { title: "Accueil" };

/* Accueil provisoire : le tableau de bord complet arrive à l'étape 4.1. */
export default async function StudentHomePage() {
  const viewer = await getViewer();
  if (!viewer) return null;

  return (
    <>
      <PageHeader
        eyebrow={viewer.promotion?.label ?? "Espace apprentis"}
        title={`Bonjour ${viewer.firstName || viewer.fullName}.`}
      >
        {viewer.formation
          ? `${viewer.formation.title}${viewer.companyName ? ` · en alternance chez ${viewer.companyName}` : ""}`
          : "Bienvenue sur le portail des apprentis de MLK Campus."}
      </PageHeader>

      {viewer.promotion ? (
        <div className="card pg2 max-w-[560px] p-6">
          <p className="m-0 text-sm text-texte-doux">Votre tableau de bord arrive bientôt</p>
          <p className="mt-1 mb-0 text-[15px] leading-relaxed">
            Prochaine séance, travail à rendre, dernières notes et annonces seront réunis ici.
            {viewer.unreadAnnouncements > 0 &&
              ` Vous avez ${viewer.unreadAnnouncements} annonce${viewer.unreadAnnouncements > 1 ? "s" : ""} non lue${viewer.unreadAnnouncements > 1 ? "s" : ""}.`}
          </p>
        </div>
      ) : (
        <EmptyState icon={Hourglass} title="Votre compte est en attente de rattachement">
          L&apos;équipe de MLK Campus doit encore vous rattacher à votre promotion. Vos cours,
          votre calendrier et vos ressources apparaîtront ici dès que ce sera fait.
        </EmptyState>
      )}
    </>
  );
}
