import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarView = "semaine" | "mois";

export function calendarHref(view: CalendarView, date: string) {
  return `/etudiant/calendrier?vue=${view}&date=${date}`;
}

/** Navigation du calendrier : période précédente / suivante, aujourd'hui, vue, export. */
export default function CalendarToolbar({
  view,
  title,
  previous,
  next,
  anchor,
  today,
}: {
  view: CalendarView;
  title: string;
  previous: string;
  next: string;
  anchor: string;
  today: string;
}) {
  const unit = view === "semaine" ? "Semaine" : "Mois";
  const iconButton =
    "flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white text-graphite transition-colors hover:border-iris hover:text-iris";

  return (
    <div className="pg2 mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={calendarHref(view, previous)} className={iconButton} aria-label={`${unit} précédent${view === "semaine" ? "e" : ""}`}>
          <ChevronLeft size={20} aria-hidden />
        </Link>
        <Link href={calendarHref(view, today)} className="btnO !px-4 !py-2.5 text-[13.5px]">
          Aujourd&apos;hui
        </Link>
        <Link href={calendarHref(view, next)} className={iconButton} aria-label={`${unit} suivant${view === "semaine" ? "e" : ""}`}>
          <ChevronRight size={20} aria-hidden />
        </Link>
        <h2 className="m-0 ml-1 w-full text-[18px] font-semibold sm:w-auto" aria-live="polite">
          {title}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Affichage" className="flex rounded-full border border-black/15 bg-white p-1">
          {(["semaine", "mois"] as const).map((option) => (
            <Link
              key={option}
              href={calendarHref(option, anchor)}
              aria-current={view === option ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                view === option ? "bg-graphite text-white" : "text-texte hover:text-iris"
              }`}
            >
              {option === "semaine" ? "Semaine" : "Mois"}
            </Link>
          ))}
        </nav>
        {/* Route handler : lien classique (pas de navigation client), le fichier se télécharge */}
        <a href="/etudiant/calendrier/ics" download className="btnO !px-4 !py-2.5 text-[13.5px]">
          <CalendarPlus size={16} aria-hidden /> Ajouter à mon agenda
        </a>
      </div>
    </div>
  );
}
