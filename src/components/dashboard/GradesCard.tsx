import Link from "next/link";
import { ChevronRight, GraduationCap } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getLatestGrades } from "@/lib/data/student";
import { formatNumber, formatShortDay } from "@/lib/format";
import { competencyResult, weightedAverage } from "@/lib/pedagogy";
import DashboardCard, { CardEmpty } from "./DashboardCard";

/** Les dernières notes publiées : note chiffrée, résultat par compétence et moyenne indicative. */
export default async function GradesCard({ className = "" }: { className?: string }) {
  const grades = await getLatestGrades(3);
  const average = weightedAverage(grades);

  const badge =
    average !== null ? (
      <span
        title="Moyenne pondérée sur les dernières notes affichées"
        className="inline-flex items-center rounded-full bg-lilas-pale px-2.5 py-0.5 text-[11.5px] font-bold tabular-nums text-iris"
      >
        Moy. {formatNumber(average)}/20
      </span>
    ) : null;

  return (
    <DashboardCard
      icon={GraduationCap}
      title="Dernières notes"
      badge={badge}
      href="/etudiant/notes"
      className={className}
    >
      {grades.length === 0 ? (
        <CardEmpty>Aucune note publiée pour le moment.</CardEmpty>
      ) : (
        <ul className="m-0 flex list-none flex-col divide-y divide-black/[0.07] p-0">
          {grades.map((grade) => {
            const result = competencyResult(grade.result);
            return (
              <li key={grade.id}>
                <Link
                  href="/etudiant/notes"
                  className="group -mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors first:pt-1 last:pb-1 hover:bg-porcelaine/80"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold leading-snug text-graphite transition-colors group-hover:text-iris">
                      {grade.evaluationTitle}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-texte-doux">
                      {grade.courseTitle && `${grade.courseTitle} · `}
                      {formatShortDay(`${grade.heldOn}T12:00:00Z`)}
                    </span>
                    {result && (
                      <span className="mt-1.5 inline-block">
                        <StatusBadge tone={result.tone}>{result.label}</StatusBadge>
                      </span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-center gap-2">
                    {grade.score !== null && (
                      <span className="rounded-xl border border-black/[0.07] bg-porcelaine px-2.5 py-1.5 text-right">
                        <span className="nr block text-[20px] leading-none text-graphite">
                          {formatNumber(grade.score)}
                          <span className="text-[12.5px] text-texte-doux">
                            /{formatNumber(grade.maxScore)}
                          </span>
                        </span>
                      </span>
                    )}
                    <ChevronRight
                      size={16}
                      aria-hidden
                      className="text-texte-doux transition-transform group-hover:translate-x-0.5 group-hover:text-iris"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
