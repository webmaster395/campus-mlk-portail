import type { Metadata } from "next";
import { Suspense } from "react";
import AnnouncementCard from "@/components/dashboard/AnnouncementCard";
import { CardSkeleton } from "@/components/dashboard/DashboardCard";
import GradesCard from "@/components/dashboard/GradesCard";
import NextDayCard from "@/components/dashboard/NextDayCard";
import TodoCard from "@/components/dashboard/TodoCard";
import WeekAheadCard from "@/components/dashboard/WeekAheadCard";
import PageHeader from "@/components/ui/PageHeader";
import PendingPromotion from "@/components/ui/PendingPromotion";
import { getViewer } from "@/lib/data/viewer";
import { formatLongDay } from "@/lib/format";

export const metadata: Metadata = { title: "Accueil" };

/**
 * Tableau de bord (inspiré de Ministry School) :
 * - À gauche, en haut : la prochaine journée au campus
 * - À droite : Messages, Travail à rendre, puis Dernières notes
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
      <PageHeader eyebrow="Aujourd'hui" title={formatLongDay(now)}>
        {intro}
      </PageHeader>

      {viewer.promotion ? (
        <div className="pg2 grid gap-6 lg:grid-cols-3 lg:items-start">
          {/* Colonne principale (gauche, en haut) : la prochaine journée au campus */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Suspense fallback={<CardSkeleton dark />}>
              <NextDayCard now={now} />
            </Suspense>
            <Suspense fallback={<CardSkeleton />}>
              <WeekAheadCard now={now} />
            </Suspense>
          </div>

          {/* Colonne latérale (droite) : Messages, Travail à rendre, Dernières notes */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Suspense fallback={<CardSkeleton />}>
              <AnnouncementCard now={now} seenAt={viewer.announcementsSeenAt} />
            </Suspense>
            <Suspense fallback={<CardSkeleton />}>
              <TodoCard now={now} />
            </Suspense>
            <Suspense fallback={<CardSkeleton />}>
              <GradesCard />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <PendingPromotion />
          <Suspense fallback={<CardSkeleton />}>
            <AnnouncementCard now={now} seenAt={viewer.announcementsSeenAt} />
          </Suspense>
        </div>
      )}
    </>
  );
}
