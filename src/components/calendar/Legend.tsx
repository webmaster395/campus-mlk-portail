import { KIND_STYLES } from "./kinds";

/** Légende des couleurs du calendrier. */
export default function Legend() {
  return (
    <ul className="m-0 mb-6 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[13px] text-texte" aria-label="Légende">
      {Object.values(KIND_STYLES).map((kind) => (
        <li key={kind.label} className="flex items-center gap-2">
          <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${kind.dot}`} />
          {kind.label}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span aria-hidden className="h-2.5 w-5 rounded-full bg-lime" />
        En entreprise
      </li>
    </ul>
  );
}
