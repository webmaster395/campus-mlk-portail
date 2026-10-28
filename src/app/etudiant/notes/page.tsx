import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import PendingPromotion from "@/components/ui/PendingPromotion";
import StatusBadge from "@/components/ui/StatusBadge";
import { getGradeReport } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";
import { formatNumber, formatShortDay } from "@/lib/format";
import { competencyResult, evaluationKindLabel, weightedAverage } from "@/lib/pedagogy";

export const metadata: Metadata = { title: "Notes" };

/** Les résultats aux évaluations publiées, par module, avec une moyenne indicative. */
export default async function GradesPage() {
  const viewer = await getViewer();
  if (!viewer) return null;

  const header = (
    <PageHeader eyebrow={viewer.promotion?.label ?? "Espace apprentis"} title="Notes">
      Vos résultats aux évaluations publiées par vos formateurs, module par module.
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

  const report = await getGradeReport();
  const all = report.flatMap((course) => course.evaluations);
  const graded = all.filter((evaluation) => evaluation.graded);
  const overall = weightedAverage(graded);
  const competencies = graded.filter((evaluation) => evaluation.result);
  const acquired = competencies.filter((evaluation) => evaluation.result === "acquis").length;

  return (
    <>
      {header}
      {all.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Aucune évaluation publiée pour le moment">
          Vos notes apparaîtront ici dès que vos formateurs auront publié les résultats.
        </EmptyState>
      ) : (
        <>
          <div className="pg2 mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-graphite p-5 text-white">
              <p className="m-0 text-[13px] text-white/65">Moyenne indicative</p>
              <p className="nr mt-2 mb-0 text-[38px] leading-none">
                {overall === null ? "—" : formatNumber(overall)}
                {overall !== null && <span className="text-[18px] text-white/60">/20</span>}
              </p>
            </div>
            <div className="card p-5">
              <p className="m-0 text-[13px] text-texte-doux">Évaluations notées</p>
              <p className="nr mt-2 mb-0 text-[38px] leading-none">
                {graded.length}
                <span className="text-[18px] text-texte-doux">/{all.length}</span>
              </p>
            </div>
            <div className="card p-5">
              <p className="m-0 text-[13px] text-texte-doux">Compétences acquises</p>
              <p className="nr mt-2 mb-0 text-[38px] leading-none">
                {acquired}
                <span className="text-[18px] text-texte-doux">/{competencies.length}</span>
              </p>
            </div>
          </div>

          <div className="pg3 flex flex-col gap-5">
            {report.map((course) => {
              const average = weightedAverage(course.evaluations.filter((evaluation) => evaluation.graded));
              return (
                <section key={course.courseId} className="card overflow-hidden" aria-labelledby={`notes-${course.courseId}`}>
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] px-5 py-4 sm:px-6">
                    <h2 id={`notes-${course.courseId}`} className="m-0 text-[17px] font-semibold">
                      <Link href={`/etudiant/cours/${course.courseId}`} className="hover:text-iris">
                        {course.courseTitle}
                      </Link>
                    </h2>
                    {average !== null && (
                      <span className="rounded-full bg-lilas-pale px-3 py-1 text-[13px] font-semibold text-[#6a3fb0]">
                        Moyenne {formatNumber(average)}/20
                      </span>
                    )}
                  </header>
                  <ul className="m-0 list-none divide-y divide-black/[0.07] p-0">
                    {course.evaluations.map((evaluation) => {
                      const result = competencyResult(evaluation.result);
                      const kind = evaluationKindLabel(evaluation.kind);
                      return (
                        <li key={evaluation.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                          <div className="min-w-0">
                            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold">
                              {evaluation.title}
                              {kind && (
                                <span className="rounded-full bg-lilas-pale px-2.5 py-0.5 text-[11.5px] font-bold text-iris">
                                  {kind}
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 mb-0 text-[13px] text-texte-doux">
                              {formatShortDay(`${evaluation.heldOn}T12:00:00Z`)} · coefficient {formatNumber(evaluation.coefficient)}
                            </p>
                            {evaluation.comment && (
                              <p className="mt-2 mb-0 rounded-lg bg-porcelaine px-3 py-2 text-[14px] leading-relaxed text-texte">
                                {evaluation.comment}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                            {evaluation.score !== null ? (
                              <span className="nr text-[26px] leading-none">
                                {formatNumber(evaluation.score)}
                                <span className="text-[15px] text-texte-doux">/{formatNumber(evaluation.maxScore)}</span>
                              </span>
                            ) : (
                              !evaluation.graded && <span className="text-[13.5px] text-texte-doux">Pas encore noté</span>
                            )}
                            {result && <StatusBadge tone={result.tone}>{result.label}</StatusBadge>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <p className="mt-6 mb-0 text-[13px] leading-relaxed text-texte-doux">
            Moyenne indicative : notes chiffrées publiées, ramenées sur 20 et pondérées par les
            coefficients. Elle ne remplace pas le relevé officiel du CFA.
          </p>
        </>
      )}
    </>
  );
}
