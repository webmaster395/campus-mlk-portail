import type { Metadata } from "next";
import { Suspense } from "react";
import AnnouncementCard from "@/components/dashboard/AnnouncementCard";
import { CardSkeleton } from "@/components/dashboard/DashboardCard";
import GradesCard from "@/components/dashboard/GradesCard";
import NextDayCard from "@/components/dashboard/NextDayCard";
import TodoCard from "@/components/dashboard/TodoCard";
import PageHeader from "@/components/ui/PageHeader";
import PendingPromotion from "@/components/ui/PendingPromotion";
import { getViewer } from "@/lib/data/viewer";
import { formatLongDay } from "@/lib/format";

export const metadata: Metadata = { title: "Accueil" };

/*
  Tableau de bord : prochaine journée au campus, travail à rendre, dernière annonce et
  dernières notes. Chaque carte charge ses données sous son propre <Suspense> : elles
  s'affichent dès qu'elles sont prêtes, sans s'attendre les unes les autres.
*/
export default async function StudentHomePage() {
  const viewer = await getViewer();
  if (!viewer) return null;
  const now = new Date();

  const intro = viewer.formation
    ? `${viewer.formation.title}${viewer.companyName ? ` · en alternance chez ${viewer.companyName}` : ""}`
    : "Bienvenue sur le portail des apprentis de MLK Campus.";

  return (
    <>
      <PageHeader eyebrow={formatLongDay(now)} title={`Bonjour ${viewer.firstName || viewer.fullName}.`}>
        {intro}
      </PageHeader>

      {viewer.promotion ? (
        <div className="pg2 grid gap-5 lg:grid-cols-3">
          <Suspense fallback={<CardSkeleton dark className="lg:col-span-2" />}>
            <NextDayCard now={now} className="lg:col-span-2" />
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
            <TodoCard now={now} />
          </Suspense>
          <Suspense fallback={<CardSkeleton className="lg:col-span-2" />}>
            <AnnouncementCard now={now} seenAt={viewer.announcementsSeenAt} className="lg:col-span-2" />
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
            <GradesCard />
          </Suspense>
        </div>
      ) : (
        <div className="grid gap-5">
          <PendingPromotion />
          {/* Les annonces de tout le CFA restent visibles en attendant */}
          <Suspense fallback={<CardSkeleton />}>
            <AnnouncementCard now={now} seenAt={viewer.announcementsSeenAt} />
          </Suspense>
        </div>
      )}
    </>
  );
}
