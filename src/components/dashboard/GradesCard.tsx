import { GraduationCap } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getLatestGrades } from "@/lib/data/student";
import { formatNumber, formatShortDay } from "@/lib/format";
import { competencyResult } from "@/lib/pedagogy";
import DashboardCard, { CardEmpty } from "./DashboardCard";

/** Les dernières notes publiées : note chiffrée et/ou résultat par compétence. */
export default async function GradesCard({ className = "" }: { className?: string }) {
  const grades = await getLatestGrades(3);

  return (
    <DashboardCard icon={GraduationCap} title="Dernières notes" href="/etudiant/notes" className={className}>
      {grades.length === 0 ? (
        <CardEmpty>Aucune note publiée pour le moment.</CardEmpty>
      ) : (
        <ul className="m-0 flex list-none flex-col divide-y divide-black/[0.07] p-0">
          {grades.map((grade) => {
            const result = competencyResult(grade.result);
            return (
              <li key={grade.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-snug">{grade.evaluationTitle}</span>
                  <span className="block text-[13px] text-texte-doux">
                    {grade.courseTitle && `${grade.courseTitle} · `}
                    {formatShortDay(`${grade.heldOn}T12:00:00Z`)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {grade.score !== null && (
                    <span className="nr text-[22px] leading-none">
                      {formatNumber(grade.score)}
                      <span className="text-[14px] text-texte-doux">/{formatNumber(grade.maxScore)}</span>
                    </span>
                  )}
                  {result && <StatusBadge tone={result.tone}>{result.label}</StatusBadge>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
