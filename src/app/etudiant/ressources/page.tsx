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

export const metadata: Metadata = { title: "Ressources" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Toutes les ressources visibles, regroupées par module, filtrables par module. */
export default async function ResourcesPage({ searchParams }: PageProps<"/etudiant/ressources">) {
  const viewer = await getViewer();
  if (!viewer) return null;

  const header = (
    <PageHeader eyebrow={viewer.formation?.title ?? "Espace apprentis"} title="Ressources">
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

          <div className="pg3 flex flex-col gap-8">
            {shown.map(([id, group]) => (
              <section key={id} aria-labelledby={`module-${id}`}>
                <h2 id={`module-${id}`} className="mt-0 mb-3 flex items-baseline justify-between gap-3 text-[17px] font-semibold">
                  {group.title}
                  <Link href={`/etudiant/cours/${id}`} className="navl text-[13px] font-medium">
                    Voir le module
                  </Link>
                </h2>
                <MaterialList materials={group.items} />
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
