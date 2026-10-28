import type { Metadata } from "next";
import { Suspense } from "react";
import { Briefcase, CalendarDays, GraduationCap } from "lucide-react";
import AnnouncementCard from "@/components/dashboard/AnnouncementCard";
import { CardSkeleton } from "@/components/dashboard/DashboardCard";
import GradesCard from "@/components/dashboard/GradesCard";
import NextDayCard from "@/components/dashboard/NextDayCard";
import TodoCard from "@/components/dashboard/TodoCard";
import WeekAheadCard from "@/components/dashboard/WeekAheadCard";
import PendingPromotion from "@/components/ui/PendingPromotion";
import { getViewer } from "@/lib/data/viewer";
import { getFormationTheme } from "@/lib/formations";
import { formatLongDay } from "@/lib/format";

export const metadata: Metadata = { title: "Accueil" };

/**
 * Tableau de bord étudiant (inspiré de Ministry School + charte Campus MLK) :
 * - Bandeau d'identité compact en haut
 * - À gauche (colonne principale) : la prochaine journée au campus en frise chronologique + rythme de la semaine
 * - À droite (colonne latérale) : Messages, Travail à rendre, puis Dernières notes
 */
export default async function StudentHomePage() {
  const viewer = await getViewer();
  if (!viewer) return null;
  const now = new Date();
  const theme = viewer.formation ? getFormationTheme(viewer.formation.title) : null;

  return (
    <>
      {/* En-tête compact pour faire remonter les cartes dès le haut de l'écran */}
      <header className="pg1 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white px-5 py-3.5 shadow-[0_2px_10px_rgba(31,31,31,0.03)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-porcelaine text-graphite">
            <GraduationCap size={18} strokeWidth={1.8} aria-hidden />
          </span>
          <h1 className="nr m-0 text-[19px] leading-snug text-graphite sm:text-[21px]">
            {viewer.formation ? viewer.formation.title : "Tableau de bord"}
          </h1>
          {theme ? (
            <span
              className="rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold"
              style={{
                backgroundColor: theme.bgLight,
                borderColor: theme.borderSoft,
                color: theme.textDark,
              }}
            >
              {theme.category} · {theme.levelLabel}
            </span>
          ) : viewer.formation?.level ? (
            <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[11.5px] font-bold text-graphite">
              Niveau {viewer.formation.level}
            </span>
          ) : null}
          {viewer.companyName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/40 px-3 py-1 text-[12px] font-semibold text-graphite">
              <Briefcase size={13} aria-hidden />
              Alternance · {viewer.companyName}
            </span>
          )}
        </div>

        <div className="inline-flex items-center gap-2 text-[13px] font-medium text-texte-doux">
          <CalendarDays size={15} className="text-texte-doux" aria-hidden />
          <span>{formatLongDay(now)}</span>
        </div>
      </header>

      {viewer.promotion ? (
        <div className="pg2 grid gap-6 lg:grid-cols-3 lg:items-start">
          {/* Colonne principale (gauche, en haut) : la prochaine journée au campus + rythme de la semaine */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Suspense fallback={<CardSkeleton />}>
              <NextDayCard now={now} />
            </Suspense>
            <Suspense fallback={<CardSkeleton />}>
              <WeekAheadCard now={now} />
            </Suspense>
          </div>

          {/* Colonne latérale (droite) : Messages, Travail à rendre, Dernières notes */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Suspense fallback={<CardSkeleton />}>
              <AnnouncementCard
                now={now}
                seenAt={viewer.announcementsSeenAt}
                unreadCount={viewer.unreadAnnouncements}
              />
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
            <AnnouncementCard
              now={now}
              seenAt={viewer.announcementsSeenAt}
              unreadCount={viewer.unreadAnnouncements}
            />
          </Suspense>
        </div>
      )}
    </>
  );
}
