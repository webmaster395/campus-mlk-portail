import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import MaterialList from "@/components/course/MaterialList";
import EmptyState from "@/components/ui/EmptyState";
import Notice from "@/components/ui/Notice";
import PageHeader from "@/components/ui/PageHeader";
import PendingPromotion from "@/components/ui/PendingPromotion";
import { getMaterials, type MaterialItem } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";

export const metadata: Metadata = { title: "Mes ressources" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Toutes les ressources visibles, regroupées par module, filtrables par module. */
export default async function ResourcesPage({ searchParams }: PageProps<"/etudiant/ressources">) {
  const viewer = await getViewer();
  if (!viewer) return null;

  const header = (
    <PageHeader eyebrow={viewer.formation?.title ?? "Espace apprentis"} title="Mes ressources">
      Supports de cours, documents et liens utiles partagés par vos formateurs.
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

  const params = await searchParams;
  const selected = first(params.module);
  const notFound = first(params.erreur) === "introuvable";
  const materials = await getMaterials();

  // Modules qui ont au moins une ressource, dans l'ordre d'apparition
  const groups = new Map<string, { title: string; items: MaterialItem[] }>();
  for (const material of materials) {
    const group = groups.get(material.courseId) ?? { title: material.courseTitle ?? "Autres", items: [] };
    group.items.push(material);
    groups.set(material.courseId, group);
  }
  const shown = [...groups.entries()].filter(([id]) => !selected || id === selected);
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
      active ? "border-graphite bg-graphite text-white" : "border-black/15 bg-white text-texte hover:border-iris hover:text-iris"
    }`;

  return (
    <>
      {header}
      {notFound && (
        <div className="mb-5">
          <Notice tone="error">Cette ressource n&apos;est pas disponible (retirée, ou pas encore publiée).</Notice>
        </div>
      )}

      {materials.length === 0 ? (
        <EmptyState icon={FolderOpen} title="Aucune ressource pour le moment">
          Vos formateurs déposeront ici les supports de cours et les liens utiles.
        </EmptyState>
      ) : (
        <>
          <nav aria-label="Filtrer par module" className="pg2 mb-6 flex flex-wrap gap-2">
            <Link href="/etudiant/ressources" className={chip(!selected)} aria-current={!selected ? "page" : undefined}>
              Tous les modules
            </Link>
            {[...groups.entries()].map(([id, group]) => (
              <Link
                key={id}
                href={`/etudiant/ressources?module=${id}`}
                className={chip(selected === id)}
                aria-current={selected === id ? "page" : undefined}
              >
                {group.title}
              </Link>
            ))}
          </nav>

          <div className="pg3 flex flex-col gap-6">
            {shown.map(([id, group]) => (
              <section key={id} aria-labelledby={`module-${id}`} className="card p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <h2 id={`module-${id}`} className="nr m-0 flex items-center gap-3 text-[22px] leading-tight">
                    {group.title}
                    <span className="rounded-full bg-lime px-2.5 py-0.5 font-sans text-[12px] font-bold text-graphite">
                      {group.items.length}
                    </span>
                  </h2>
                  <Link href={`/etudiant/cours/${id}`} className="navl text-[13px] font-medium">
                    Voir le module
                  </Link>
                </div>
                <MaterialList materials={group.items} />
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
