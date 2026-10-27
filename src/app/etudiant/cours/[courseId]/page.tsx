import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Check, ClipboardList, FolderOpen, MapPin, UserRound } from "lucide-react";
import MaterialList from "@/components/course/MaterialList";
import { CardEmpty } from "@/components/dashboard/DashboardCard";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { getCourse, type DashboardSession } from "@/lib/data/student";
import { formatShortDay, formatTimeRange } from "@/lib/format";
import { sessionKind } from "@/lib/pedagogy";
import { isUuid } from "@/lib/validate";

export const metadata: Metadata = { title: "Module" };

/** Fiche d'un module : objectifs, séances, ressources et travail à rendre. */
export default async function CoursePage({ params }: PageProps<"/etudiant/cours/[courseId]">) {
  const { courseId } = await params;
  if (!isUuid(courseId)) notFound();

  // Rendu à la requête avant de lire l'heure (Cache Components refuse new Date() en pré-rendu)
  await connection();
  const now = new Date();
  // La RLS ne renvoie le module que s'il appartient à la formation de la personne
  const course = await getCourse(courseId, now);
  if (!course) notFound();

  const nowIso = now.toISOString();
  const upcoming = course.sessions.filter((s) => s.endsAt >= nowIso);
  const past = course.sessions.filter((s) => s.endsAt < nowIso).reverse();

  return (
    <>
      <Link href="/etudiant/cours" className="navl mb-6 inline-flex items-center gap-1.5">
        <ArrowLeft size={15} aria-hidden /> Tous les modules
      </Link>
      <PageHeader eyebrow={course.competencyBlock ?? "Module"} title={course.title}>
        {course.description}
      </PageHeader>

      <div className="pg2 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          {course.objectives.length > 0 && (
            <section className="card p-6">
              <h2 className="mt-0 mb-4 text-[16px] font-semibold">Objectifs</h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {course.objectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-3 text-[15px] leading-relaxed">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-graphite">
                      <Check size={13} strokeWidth={2.5} aria-hidden />
                    </span>
                    {objective}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-6">
            <h2 className="mt-0 mb-4 text-[16px] font-semibold">Séances</h2>
            {course.sessions.length === 0 ? (
              <CardEmpty>Aucune séance planifiée pour ce module.</CardEmpty>
            ) : (
              <>
                <SessionList sessions={upcoming} emptyLabel="Plus de séance à venir pour ce module." />
                {past.length > 0 && (
                  <details className="group mt-5">
                    <summary className="cursor-pointer text-[13.5px] font-semibold text-texte hover:text-iris">
                      Séances passées ({past.length})
                    </summary>
                    <div className="mt-3 opacity-70">
                      <SessionList sessions={past} emptyLabel="" />
                    </div>
                  </details>
                )}
              </>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="card p-6">
            <h2 className="mt-0 mb-4 flex items-center gap-2 text-[16px] font-semibold">
              <FolderOpen size={17} aria-hidden className="text-iris" /> Ressources
            </h2>
            {course.materials.length === 0 ? (
              <CardEmpty>Pas encore de ressource pour ce module.</CardEmpty>
            ) : (
              <MaterialList materials={course.materials} />
            )}
          </section>

          <section className="card p-6">
            <h2 className="mt-0 mb-4 flex items-center gap-2 text-[16px] font-semibold">
              <ClipboardList size={17} aria-hidden className="text-iris" /> Travail à rendre
            </h2>
            {course.assignments.length === 0 ? (
              <CardEmpty>Aucun travail demandé dans ce module.</CardEmpty>
            ) : (
              <ul className="m-0 flex list-none flex-col divide-y divide-black/[0.07] p-0">
                {course.assignments.map((assignment) => (
                  <li key={assignment.id} className="py-3 first:pt-0 last:pb-0">
                    <Link href={`/etudiant/travail#devoir-${assignment.id}`} className="group flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-[14.5px] font-semibold leading-snug group-hover:text-iris">
                          {assignment.title}
                        </span>
                        <span className="block text-[12.5px] text-texte-doux">pour le {formatShortDay(assignment.dueAt)}</span>
                      </span>
                      <StatusBadge tone={assignment.status.tone}>{assignment.status.label}</StatusBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function SessionList({ sessions, emptyLabel }: { sessions: DashboardSession[]; emptyLabel: string }) {
  if (sessions.length === 0) return emptyLabel ? <p className="m-0 text-[14px] text-texte-doux">{emptyLabel}</p> : null;
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {sessions.map((session) => {
        const kind = sessionKind(session.kind);
        return (
          <li key={session.id} className="flex flex-col gap-1 rounded-xl bg-porcelaine px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="shrink-0 text-[13.5px] font-semibold sm:w-[150px]">
              {formatShortDay(session.startsAt)}
              <span className="block text-[12.5px] font-normal tabular-nums text-texte-doux">
                {formatTimeRange(session.startsAt, session.endsAt)}
              </span>
            </span>
            <span className="min-w-0 flex-1 text-[13px] text-texte-doux">
              <span className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-graphite">
                {session.title}
                {kind && <StatusBadge tone={kind.tone}>{kind.label}</StatusBadge>}
              </span>
              <span className="mt-1 flex flex-wrap gap-x-4">
                {session.room && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} aria-hidden /> {session.room}
                  </span>
                )}
                {session.trainerName && (
                  <span className="inline-flex items-center gap-1">
                    <UserRound size={13} aria-hidden /> {session.trainerName}
                  </span>
                )}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
