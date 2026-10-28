import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, ClipboardList, FolderOpen } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import PendingPromotion from "@/components/ui/PendingPromotion";
import { getCourses } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";
import { formatShortDay } from "@/lib/format";

export const metadata: Metadata = { title: "Mes cours" };

/** Les modules de la formation, avec la progression des séances. */
export default async function CoursesPage() {
  const viewer = await getViewer();
  if (!viewer) return null;

  const header = (
    <PageHeader eyebrow={viewer.formation?.title ?? "Espace apprentis"} title="Mes cours">
      Les modules de votre formation : objectifs, séances, ressources et travail à rendre.
    </PageHeader>
  );
  if (!viewer.promotion) {
    return (
      <>
        {header}
        <PendingPromotion />
      </>
    );
  }

  const courses = await getCourses(new Date());

  return (
    <>
      {header}
      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Aucun module pour le moment">
          Les modules de votre formation apparaîtront ici dès qu&apos;ils seront publiés.
        </EmptyState>
      ) : (
        <ul className="pg2 m-0 grid list-none gap-5 p-0 md:grid-cols-2">
          {courses.map((course) => {
            const progress = course.sessionsTotal ? Math.round((course.sessionsDone / course.sessionsTotal) * 100) : 0;
            return (
              <li key={course.id}>
                <Link href={`/etudiant/cours/${course.id}`} className="card lift flex h-full flex-col p-6">
                  {course.competencyBlock && <p className="eyebrow m-0">{course.competencyBlock}</p>}
                  <h2 className="nr mt-2 mb-0 text-[24px] leading-tight">{course.title}</h2>
                  {course.description && (
                    <p className="mt-2 mb-0 line-clamp-2 text-[14.5px] leading-relaxed text-texte">{course.description}</p>
                  )}

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[12.5px] text-texte-doux">
                      <span>
                        {course.sessionsDone}/{course.sessionsTotal} séance{course.sessionsTotal > 1 ? "s" : ""} passée
                        {course.sessionsDone > 1 ? "s" : ""}
                      </span>
                      <span className="font-semibold text-graphite">{progress} %</span>
                    </div>
                    <div
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/[0.07]"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-label={`Progression du module ${course.title}`}
                    >
                      <div className="h-full rounded-full bg-iris" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <p className="mt-5 mb-0 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-texte">
                    <span className="inline-flex items-center gap-1.5">
                      <FolderOpen size={14} aria-hidden /> {course.materialsCount} ressource{course.materialsCount > 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ClipboardList size={14} aria-hidden /> {course.assignmentsCount}{" "}
                      {course.assignmentsCount > 1 ? "travaux" : "travail"}
                    </span>
                    {course.nextSessionAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} aria-hidden /> Prochaine séance le {formatShortDay(course.nextSessionAt)}
                      </span>
                    )}
                  </p>

                  <span className="mt-auto pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-graphite px-4 py-2 text-[13px] font-semibold text-lime">
                      Ouvrir le module <ArrowRight size={14} aria-hidden />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
