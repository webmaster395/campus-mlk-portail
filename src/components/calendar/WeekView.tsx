import { Briefcase, MapPin, UserRound } from "lucide-react";
import { formatDayTitle, formatWeekdayShort } from "@/lib/calendar";
import type { CompanyPeriod, DashboardSession } from "@/lib/data/student";
import { formatTimeRange } from "@/lib/format";
import { kindStyle } from "./kinds";
import ScrollToToday from "./ScrollToToday";

/**
 * Vue semaine : une carte par jour (colonnes sur grand écran, liste sur téléphone). Le
 * week-end n'apparaît que s'il s'y passe quelque chose.
 */
export default function WeekView({
  days,
  today,
  sessionsByDay,
  companyByDay,
  companyName,
}: {
  days: string[];
  today: string;
  sessionsByDay: Map<string, DashboardSession[]>;
  companyByDay: Map<string, CompanyPeriod>;
  companyName: string | null;
}) {
  const busy = (day: string) => (sessionsByDay.get(day)?.length ?? 0) > 0 || companyByDay.has(day);
  const shown = days.filter((day, index) => index < 5 || busy(day));
  const nothing = !shown.some(busy);

  return (
    <>
      {/* Seulement si aujourd'hui est dans la semaine affichée, et pas le lundi (déjà en haut) */}
      {shown.includes(today) && today !== shown[0] && <ScrollToToday targetId={`jour-${today}`} />}
      {nothing && (
        <p className="card m-0 mb-4 px-5 py-4 text-[15px] text-texte-doux">
          Rien de prévu cette semaine : ni séance au campus, ni période en entreprise.
        </p>
      )}
      <div className={`pg3 grid gap-4 ${shown.length > 5 ? "lg:grid-cols-7" : "lg:grid-cols-5"}`}>
        {shown.map((day) => {
          const sessions = sessionsByDay.get(day) ?? [];
          const company = companyByDay.get(day);
          const isToday = day === today;
          return (
            <section
              key={day}
              id={`jour-${day}`}
              aria-label={formatDayTitle(day)}
              className={`card flex min-h-[132px] flex-col gap-3 p-4 ${isToday ? "!border-iris ring-2 ring-iris/25" : ""}`}
            >
              <header className="flex items-center justify-between gap-2 lg:flex-col lg:items-start">
                <p className="m-0 flex items-baseline gap-2">
                  <span className="text-[12px] font-semibold tracking-[0.08em] text-texte-doux uppercase">
                    {formatWeekdayShort(day)}
                  </span>
                  <span className={`nr text-[24px] leading-none ${isToday ? "text-iris" : ""}`}>
                    {Number(day.slice(8))}
                  </span>
                  <span className="text-[13px] text-texte-doux lg:hidden">{formatDayTitle(day).split(" ").slice(2).join(" ")}</span>
                </p>
                {isToday && (
                  <span className="rounded-full bg-iris px-2.5 py-0.5 text-[11.5px] font-bold text-white">
                    Aujourd&apos;hui
                  </span>
                )}
              </header>

              {company && (
                <div className="rounded-xl bg-lime/45 px-3 py-2.5 text-[13.5px] text-graphite">
                  <p className="m-0 flex items-center gap-2 font-semibold">
                    <Briefcase size={15} aria-hidden /> En entreprise
                  </p>
                  {companyName && (
                    <p className="mt-1 mb-0 text-[12.5px] leading-snug text-graphite/75">Chez {companyName}</p>
                  )}
                  {company.note && (
                    <p className="mt-1 mb-0 text-[12.5px] leading-snug text-graphite/75">{company.note}</p>
                  )}
                </div>
              )}

              {sessions.map((session) => {
                const kind = kindStyle(session.kind);
                return (
                  <article key={session.id} className={`rounded-lg border-l-4 bg-porcelaine px-3 py-2.5 ${kind.bar}`}>
                    <p className="m-0 text-[12.5px] font-bold tabular-nums text-graphite">
                      {formatTimeRange(session.startsAt, session.endsAt)}
                      {session.kind !== "cours" && (
                        <span className="ml-2 font-semibold text-texte-doux">· {kind.label}</span>
                      )}
                    </p>
                    <h3 className="mt-1 mb-0 text-[14px] font-semibold leading-snug">{session.title}</h3>
                    {(session.room || session.trainerName) && (
                      <p className="mt-1.5 mb-0 flex flex-col gap-0.5 text-[12.5px] text-texte-doux">
                        {session.room && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={13} aria-hidden /> {session.room}
                          </span>
                        )}
                        {session.trainerName && (
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound size={13} aria-hidden /> {session.trainerName}
                          </span>
                        )}
                      </p>
                    )}
                  </article>
                );
              })}

              {!company && sessions.length === 0 && (
                <p className="m-0 text-[13px] text-texte-doux">Pas de séance</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
