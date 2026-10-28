"use client";

import { useState } from "react";
import { Briefcase, GraduationCap } from "lucide-react";
import { formatDayTitle, formatWeekdayShort } from "@/lib/calendar";
import type { CompanyPeriod, DashboardSession } from "@/lib/data/student";
import { formatTime, formatTimeRange } from "@/lib/format";
import DayDetailModal from "./DayDetailModal";
import { kindStyle } from "./kinds";
import ScrollToToday from "./ScrollToToday";

/**
 * Vue semaine épurée : une carte par jour avec uniquement l'essentiel (horaire + intitulé).
 * Un clic sur un jour ou un créneau ouvre la fiche complète (salle, formateur, descriptif).
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
  sessionsByDay: Record<string, DashboardSession[]>;
  companyByDay: Record<string, CompanyPeriod>;
  companyName: string | null;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const busy = (day: string) => (sessionsByDay[day]?.length ?? 0) > 0 || Boolean(companyByDay[day]);
  const shown = days.filter((day, index) => index < 5 || busy(day));
  const nothing = !shown.some(busy);

  return (
    <>
      {shown.includes(today) && today !== shown[0] && <ScrollToToday targetId={`jour-${today}`} />}
      {nothing && (
        <p className="card m-0 mb-4 px-5 py-4 text-[15px] text-texte-doux">
          Rien de prévu cette semaine : ni séance au campus, ni période en entreprise.
        </p>
      )}

      <div className={`pg3 grid gap-4 ${shown.length > 5 ? "lg:grid-cols-7" : "lg:grid-cols-5"}`}>
        {shown.map((day) => {
          const sessions = sessionsByDay[day] ?? [];
          const company = companyByDay[day];
          const isToday = day === today;
          const first = sessions[0];
          const last = sessions[sessions.length - 1];

          return (
            <section
              key={day}
              id={`jour-${day}`}
              aria-label={formatDayTitle(day)}
              onClick={() => (sessions.length > 0 || company) && setSelectedDay(day)}
              className={`card flex min-h-[168px] flex-col justify-between gap-3 p-4 transition-all ${
                sessions.length > 0 || company ? "cursor-pointer hover:border-black/20 hover:shadow-sm" : ""
              } ${isToday ? "!border-iris ring-2 ring-iris/20" : ""}`}
            >
              {/* En-tête du jour */}
              <header className="flex items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
                <p className="m-0 flex items-baseline gap-2">
                  <span className="text-[11.5px] font-bold tracking-[0.08em] text-texte-doux uppercase">
                    {formatWeekdayShort(day).replace(".", "")}
                  </span>
                  <span className={`nr text-[23px] leading-none ${isToday ? "text-iris" : "text-graphite"}`}>
                    {Number(day.slice(8))}
                  </span>
                </p>

                {isToday ? (
                  <span className="rounded-full bg-iris px-2.5 py-0.5 text-[11px] font-bold text-white">
                    Aujourd&apos;hui
                  </span>
                ) : first && last ? (
                  <span className="rounded-full bg-porcelaine px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-texte-doux ring-1 ring-black/[0.06]">
                    {formatTime(first.startsAt)} – {formatTime(last.endsAt)}
                  </span>
                ) : null}
              </header>

              {/* Contenu épuré de la journée */}
              <div className="flex flex-1 flex-col gap-2">
                {sessions.length > 0 && (
                  <>
                    <div className="mb-0.5 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.04em] text-iris uppercase">
                      <GraduationCap size={13} aria-hidden />
                      <span>Campus</span>
                      {isToday && first && last && (
                        <span className="font-semibold tabular-nums text-texte-doux normal-case">
                          · {formatTime(first.startsAt)} – {formatTime(last.endsAt)}
                        </span>
                      )}
                    </div>

                    {sessions.map((session) => {
                      const kind = kindStyle(session.kind);
                      return (
                        <article
                          key={session.id}
                          className={`rounded-xl border border-black/[0.05] border-l-[3px] bg-porcelaine/70 px-3 py-2.5 transition-colors hover:bg-porcelaine ${kind.bar}`}
                        >
                          <p className="m-0 text-[11.5px] font-bold tabular-nums text-texte-doux">
                            {formatTimeRange(session.startsAt, session.endsAt)}
                            {session.kind !== "cours" && (
                              <span className="ml-1.5 font-semibold text-iris">· {kind.label}</span>
                            )}
                          </p>
                          <h3 className="mt-1 mb-0 line-clamp-2 text-[13.5px] font-semibold leading-snug text-graphite">
                            {session.title}
                          </h3>
                        </article>
                      );
                    })}
                  </>
                )}

                {company && sessions.length === 0 && (
                  <>
                    <div className="mb-0.5 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.04em] text-[#4d6800] uppercase">
                      <Briefcase size={13} aria-hidden />
                      <span>Entreprise</span>
                    </div>
                    <article className="rounded-xl border border-black/[0.05] border-l-[3px] border-l-[#a8d922] bg-lime/15 px-3 py-2.5">
                      <p className="m-0 text-[11.5px] font-bold text-texte-doux">Journée en alternance</p>
                      <h3 className="mt-1 mb-0 line-clamp-2 text-[13.5px] font-semibold leading-snug text-graphite">
                        {companyName ? companyName : "En entreprise"}
                      </h3>
                    </article>
                  </>
                )}

                {!company && sessions.length === 0 && (
                  <p className="my-auto text-center text-[12.5px] text-texte-doux">Aucun cours prévu</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          sessions={sessionsByDay[selectedDay] ?? []}
          company={companyByDay[selectedDay]}
          companyName={companyName}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}
