"use client";

import { useState } from "react";
import { formatDayTitle } from "@/lib/calendar";
import type { CompanyPeriod, DashboardSession } from "@/lib/data/student";
import { formatTime } from "@/lib/format";
import DayDetailModal from "./DayDetailModal";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/**
 * Vue mois épurée : chaque case affiche uniquement le numéro du jour et une pastille
 * synthétique (« Campus · 9h – 17h » ou « Entreprise »), sans texte coupé.
 * Un clic sur un jour ouvre le détail complet de la journée.
 */
export default function MonthView({
  weeks,
  month,
  today,
  sessionsByDay,
  companyByDay,
  companyName,
}: {
  weeks: string[][];
  month: string; // AAAA-MM
  today: string;
  sessionsByDay: Record<string, DashboardSession[]>;
  companyByDay: Record<string, CompanyPeriod>;
  companyName: string | null;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  return (
    <>
      <div className="card pg3 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-black/[0.08] bg-porcelaine">
          {WEEKDAYS.map((day) => (
            <p
              key={day}
              className="m-0 py-3 text-center text-[11.5px] font-bold tracking-[0.08em] text-texte-doux uppercase"
            >
              {day}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {weeks.flat().map((day, index) => {
            const sessions = sessionsByDay[day] ?? [];
            const company = Boolean(companyByDay[day]);
            const outside = !day.startsWith(month);
            const isToday = day === today;
            const first = sessions[0];
            const last = sessions[sessions.length - 1];
            // Fond de la case : le type de journée se lit d'un coup d'œil (campus / entreprise)
            const tint = outside
              ? "bg-porcelaine/35 opacity-45"
              : sessions.length > 0
                ? "bg-lilas-pale/55 hover:bg-lilas-pale"
                : company
                  ? "bg-lime/20 hover:bg-lime/30"
                  : "bg-white hover:bg-porcelaine/75";
            const hasEval = sessions.some((s) => s.kind === "evaluation");

            const summary = [
              sessions.length && first && last
                ? `Campus ${formatTime(first.startsAt)} – ${formatTime(last.endsAt)}`
                : null,
              company ? "En entreprise" : null,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                aria-label={`${formatDayTitle(day)}${summary ? ` : ${summary}` : ""}`}
                className={`group flex min-h-[72px] cursor-pointer flex-col justify-between gap-1.5 border-black/[0.06] p-2 text-left transition-colors sm:min-h-[104px] sm:p-3 ${
                  index % 7 !== 6 ? "border-r" : ""
                } ${index >= 7 ? "border-t" : ""} ${tint}`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                      isToday
                        ? "bg-iris font-bold text-white"
                        : "text-graphite group-hover:bg-black/[0.05]"
                    }`}
                  >
                    {Number(day.slice(8))}
                  </span>

                  {hasEval && (
                    <span className="hidden rounded-full bg-attente/25 px-2 py-0.5 text-[10px] font-bold text-[#7a4b00] sm:inline">
                      Éval.
                    </span>
                  )}
                </div>

                {/* Grand écran : pastille synthétique propre (sans intitulés coupés) */}
                <div className="hidden w-full flex-col gap-1 sm:flex">
                  {sessions.length > 0 && first && last ? (
                    <div className="flex flex-col rounded-lg border border-iris/25 bg-white/80 px-2.5 py-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-iris">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-iris" aria-hidden />
                        Campus
                      </span>
                      <span className="text-[11px] font-medium tabular-nums text-texte">
                        {formatTime(first.startsAt)} – {formatTime(last.endsAt)}
                      </span>
                    </div>
                  ) : company ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-[#a8d922]/50 bg-white/80 px-2.5 py-1.5">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#658800]" aria-hidden />
                      <span className="truncate text-[11px] font-semibold text-graphite">
                        Entreprise
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Téléphone : simple point coloré */}
                <div className="flex items-center gap-1 sm:hidden" aria-hidden>
                  {sessions.length > 0 && <span className="h-2 w-2 rounded-full bg-iris" />}
                  {company && sessions.length === 0 && (
                    <span className="h-2 w-2 rounded-full bg-[#8cb814]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
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
