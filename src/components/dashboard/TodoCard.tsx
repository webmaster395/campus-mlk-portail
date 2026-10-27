import { ClipboardList } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getTodoAssignments } from "@/lib/data/student";
import { formatShortDay, formatTime } from "@/lib/format";
import DashboardCard, { CardEmpty } from "./DashboardCard";

const SHOWN = 3;

/** Le travail pas encore rendu : en retard d'abord, puis par échéance. */
export default async function TodoCard({ now, className = "" }: { now: Date; className?: string }) {
  const todo = await getTodoAssignments(now);
  const more = todo.length - SHOWN;

  return (
    <DashboardCard icon={ClipboardList} title="Travail à rendre" href="/etudiant/travail" className={className}>
      {todo.length === 0 ? (
        <CardEmpty>Tout est rendu. Bravo&nbsp;!</CardEmpty>
      ) : (
        <>
          <ul className="m-0 flex list-none flex-col divide-y divide-black/[0.07] p-0">
            {todo.slice(0, SHOWN).map((assignment) => (
              <li key={assignment.id} className="flex flex-col gap-1.5 py-3 first:pt-0">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-[15px] font-semibold leading-snug">{assignment.title}</span>
                  <StatusBadge tone={assignment.status.tone}>{assignment.status.label}</StatusBadge>
                </span>
                <span className="text-[13px] text-texte-doux">
                  {assignment.courseTitle && `${assignment.courseTitle} · `}
                  {assignment.status.key === "late" ? "attendu le" : "pour le"}{" "}
                  {formatShortDay(assignment.dueAt)} à {formatTime(assignment.dueAt)}
                </span>
              </li>
            ))}
          </ul>
          {more > 0 && (
            <p className="mt-3 mb-0 text-[13px] text-texte-doux">
              Et {more > 1 ? `${more} autres travaux` : "1 autre travail"} à rendre.
            </p>
          )}
        </>
      )}
    </DashboardCard>
  );
}
