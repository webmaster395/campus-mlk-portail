import Link from "next/link";
import { ChevronRight, ClipboardList, FileText, FileUp } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getTodoAssignments } from "@/lib/data/student";
import { formatShortDay, formatTime } from "@/lib/format";
import DashboardCard, { CardEmpty } from "./DashboardCard";

const SHOWN = 3;

/** Le travail pas encore rendu : en retard d'abord, puis par échéance, façon liste interactive. */
export default async function TodoCard({ now, className = "" }: { now: Date; className?: string }) {
  const todo = await getTodoAssignments(now);
  const more = todo.length - SHOWN;

  const badge =
    todo.length > 0 ? (
      <span
        aria-label={`${todo.length} ${todo.length > 1 ? "travaux à rendre" : "travail à rendre"}`}
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-porcelaine px-1.5 text-[11px] font-bold text-graphite ring-1 ring-black/10"
      >
        {todo.length}
      </span>
    ) : null;

  const footer =
    todo.length > 0 ? (
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/etudiant/travail"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-graphite transition-colors hover:text-iris"
        >
          Voir tout <span aria-hidden>→</span>
        </Link>
        {more > 0 && (
          <span className="text-[12px] text-texte-doux">
            +{more} {more > 1 ? "autres" : "autre"}
          </span>
        )}
      </div>
    ) : undefined;

  return (
    <DashboardCard
      icon={ClipboardList}
      title="Travail à rendre"
      badge={badge}
      href="/etudiant/travail"
      footer={footer}
      className={className}
    >
      {todo.length === 0 ? (
        <CardEmpty>Tout est rendu. Bravo&nbsp;!</CardEmpty>
      ) : (
        <ul className="m-0 flex list-none flex-col divide-y divide-black/[0.07] p-0">
          {todo.slice(0, SHOWN).map((assignment) => {
            const tab = assignment.status.key === "late" ? "en-retard" : "a-faire";
            const TaskIcon = assignment.requiresFile ? FileUp : FileText;

            return (
              <li key={assignment.id}>
                <Link
                  href={`/etudiant/travail?onglet=${tab}`}
                  className="group -mx-2 flex items-start gap-3 rounded-xl px-2 py-3 transition-colors first:pt-1 last:pb-1 hover:bg-porcelaine/80"
                >
                  {/* Cercle de check-list inspiré de Ministry School */}
                  <span
                    aria-hidden
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      assignment.status.key === "late"
                        ? "border-corail/60 bg-corail/10 group-hover:border-corail"
                        : "border-black/20 bg-white group-hover:border-iris"
                    }`}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-start justify-between gap-2">
                      <span className="text-[14.5px] font-semibold leading-snug text-graphite transition-colors group-hover:text-iris">
                        {assignment.title}
                      </span>
                      <StatusBadge tone={assignment.status.tone}>{assignment.status.label}</StatusBadge>
                    </span>

                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-texte-doux">
                      <TaskIcon size={13} className="shrink-0 text-iris" aria-hidden />
                      <span>
                        {assignment.courseTitle && `${assignment.courseTitle} · `}
                        {assignment.status.key === "late" ? "attendu le" : "pour le"}{" "}
                        {formatShortDay(assignment.dueAt)} à {formatTime(assignment.dueAt)}
                      </span>
                    </span>
                  </span>

                  <ChevronRight
                    size={16}
                    aria-hidden
                    className="mt-1.5 shrink-0 text-texte-doux transition-transform group-hover:translate-x-0.5 group-hover:text-iris"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
