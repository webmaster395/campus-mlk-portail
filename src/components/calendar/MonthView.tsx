import Link from "next/link";
import { formatDayTitle } from "@/lib/calendar";
import type { CompanyPeriod, DashboardSession } from "@/lib/data/student";
import { formatTime } from "@/lib/format";
import { calendarHref } from "./CalendarToolbar";
import { kindStyle } from "./kinds";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/**
 * Vue mois : une case par jour, teintée les jours en entreprise. Sur grand écran, les
 * premières séances sont écrites ; sur téléphone, une pastille par séance. Chaque case
 * ouvre la semaine correspondante.
 */
export default function MonthView({
  weeks,
  month,
  today,
  sessionsByDay,
  companyByDay,
}: {
  weeks: string[][];
  month: string; // AAAA-MM
  today: string;
  sessionsByDay: Map<string, DashboardSession[]>;
  companyByDay: Map<string, CompanyPeriod>;
}) {
  return (
    <div className="card pg3 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-black/10 bg-porcelaine">
        {WEEKDAYS.map((day) => (
          <p key={day} className="m-0 py-2.5 text-center text-[12px] font-semibold tracking-[0.06em] text-texte-doux uppercase">
            {day}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((day, index) => {
          const sessions = sessionsByDay.get(day) ?? [];
          const company = companyByDay.has(day);
          const outside = !day.startsWith(month);
          const isToday = day === today;
          const summary = [
            sessions.length ? `${sessions.length} séance${sessions.length > 1 ? "s" : ""}` : null,
            company ? "en entreprise" : null,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <Link
              key={day}
              href={calendarHref("semaine", day)}
              aria-label={`${formatDayTitle(day)}${summary ? ` : ${summary}` : ""}`}
              className={`group flex min-h-[64px] flex-col gap-1 border-black/[0.07] p-1.5 transition-colors hover:bg-lilas-pale/60 sm:min-h-[104px] sm:p-2 ${
                index % 7 !== 6 ? "border-r" : ""
              } ${index >= 7 ? "border-t" : ""} ${company ? "bg-lime/25" : ""} ${outside ? "opacity-45" : ""}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center self-start rounded-full text-[13px] font-semibold ${
                  isToday ? "bg-iris text-white" : "text-graphite"
                }`}
              >
                {Number(day.slice(8))}
              </span>

              {company && (
                <span className="hidden text-[11px] font-semibold text-graphite/70 sm:block">Entreprise</span>
              )}

              {/* Grand écran : les deux premières séances écrites */}
              <span className="hidden flex-col gap-1 sm:flex">
                {sessions.slice(0, 2).map((session) => (
                  <span
                    key={session.id}
                    className={`truncate rounded border-l-[3px] bg-white px-1.5 py-0.5 text-[11.5px] leading-tight ${kindStyle(session.kind).bar}`}
                  >
                    <span className="font-semibold tabular-nums">{formatTime(session.startsAt)}</span> {session.title}
                  </span>
                ))}
                {sessions.length > 2 && (
                  <span className="text-[11px] text-texte-doux">+{sessions.length - 2}</span>
                )}
              </span>

              {/* Téléphone : une pastille par séance */}
              <span className="flex flex-wrap gap-1 sm:hidden" aria-hidden>
                {sessions.map((session) => (
                  <span key={session.id} className={`h-1.5 w-1.5 rounded-full ${kindStyle(session.kind).dot}`} />
                ))}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
