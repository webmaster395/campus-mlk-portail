import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import AssignmentCard from "@/components/assignment/AssignmentCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import PendingPromotion from "@/components/ui/PendingPromotion";
import { getAssignments, type AssignmentItem } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";

export const metadata: Metadata = { title: "Travail à rendre" };

const TABS = [
  { key: "a-faire", label: "À faire", empty: "Rien à faire pour le moment. Bravo !" },
  { key: "en-retard", label: "En retard", empty: "Aucun travail en retard." },
  { key: "rendus", label: "Rendus", empty: "Vous n'avez encore rien rendu." },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function tabOf(assignment: AssignmentItem): TabKey {
  if (assignment.status.key === "submitted") return "rendus";
  if (assignment.status.key === "late") return "en-retard";
  return "a-faire";
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Le travail à rendre, en trois onglets, avec le dépôt des rendus. */
export default async function AssignmentsPage({ searchParams }: PageProps<"/etudiant/travail">) {
  const viewer = await getViewer();
  if (!viewer) return null;

  const header = (
    <PageHeader eyebrow={viewer.promotion?.label ?? "Espace apprentis"} title="Travail à rendre">
      Vos devoirs, leurs échéances et vos rendus. Vous pouvez modifier un rendu jusqu&apos;à la date limite.
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

  const now = new Date();
  const assignments = await getAssignments(now);
  const requested = first((await searchParams).onglet);
  const tab: TabKey = TABS.some((t) => t.key === requested) ? (requested as TabKey) : "a-faire";
  const shown = assignments.filter((assignment) => tabOf(assignment) === tab);
  // Rendus : les plus récents d'abord ; ailleurs : l'échéance la plus proche d'abord
  if (tab === "rendus") shown.reverse();

  return (
    <>
      {header}
      {assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Aucun travail demandé pour le moment">
          Les devoirs de votre promotion apparaîtront ici, avec leur date limite.
        </EmptyState>
      ) : (
        <>
          <nav aria-label="Filtrer le travail" className="pg2 mb-6 flex flex-wrap gap-2">
            {TABS.map((option) => {
              const count = assignments.filter((a) => tabOf(a) === option.key).length;
              const active = option.key === tab;
              return (
                <Link
                  key={option.key}
                  href={`/etudiant/travail?onglet=${option.key}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                    active ? "border-graphite bg-graphite text-white" : "border-black/15 bg-white text-texte hover:border-iris hover:text-iris"
                  }`}
                >
                  {option.label}
                  <span
                    className={`rounded-full px-2 text-[12px] ${
                      active ? "bg-white/15" : option.key === "en-retard" && count > 0 ? "bg-alerte/15 text-[#a3203f]" : "bg-black/[0.06]"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </nav>

          {shown.length === 0 ? (
            <p className="card m-0 px-5 py-6 text-[15px] text-texte-doux">{TABS.find((t) => t.key === tab)?.empty}</p>
          ) : (
            <div className="pg3 flex flex-col gap-4">
              {shown.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} userId={viewer.id} now={now.toISOString()} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
