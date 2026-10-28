import { ExternalLink, FileText, Link2 } from "lucide-react";
import type { MaterialItem } from "@/lib/data/student";
import { formatShortDay } from "@/lib/format";

/**
 * Liste de ressources. Chaque lien passe par /etudiant/ressources/[id]/ouvrir, qui vérifie
 * l'accès puis redirige vers une URL signée (fichier) ou vers le lien externe.
 */
export default function MaterialList({
  materials,
  showCourse = false,
}: {
  materials: MaterialItem[];
  showCourse?: boolean;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {materials.map((material) => {
        const Icon = material.isFile ? FileText : Link2;
        return (
          <li key={material.id}>
            <a
              href={`/etudiant/ressources/${material.id}/ouvrir`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 transition-colors hover:border-iris/50 hover:bg-lilas-pale/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lilas-pale text-iris">
                <Icon size={17} strokeWidth={1.8} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold leading-snug">{material.title}</span>
                <span className="block truncate text-[12.5px] text-texte-doux">
                  {showCourse && material.courseTitle && `${material.courseTitle} · `}
                  {material.isFile ? "Document" : material.linkHost ?? "Lien"} · ajouté le {formatShortDay(material.createdAt)}
                </span>
              </span>
              <ExternalLink size={16} aria-hidden className="shrink-0 text-texte-doux transition-colors group-hover:text-iris" />
              <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
