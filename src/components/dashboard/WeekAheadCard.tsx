import { Briefcase, CalendarRange } from "lucide-react";
import { addDays, formatDayTitle, isWithin } from "@/lib/calendar";
import { getCompanyPeriods, getSessionsBetween } from "@/lib/data/student";
import { formatTimeRange, parisDayKey } from "@/lib/format";
import { kindStyle } from "@/components/calendar/kinds";
import DashboardCard from "./DashboardCard";

/** Les 7 prochains jours : séances au campus et jours en entreprise. */
export default async function WeekAheadCard({ now, className = "" }: { now: Date; className?: string }) {
  const today = parisDayKey(now);
  const last = addDays(today, 6);
  const [sessions, periods] = await Promise.all([getSessionsBetween(today, last), getCompanyPeriods(today, last)]);

  const days = Array.from({ length: 7 }, (_, index) => addDays(today, index));

  return (
    <DashboardCard icon={CalendarRange} title="Cette semaine" href="/etudiant/calendrier" linkLabel="Calendrier" className={className}>
      <ol className="m-0 flex list-none flex-col divide-y divide-black/[0.07] p-0">
        {days.map((day) => {
          const daySessions = sessions.filter((session) => parisDayKey(session.startsAt) === day);
          const company = periods.some((period) => isWithin(day, period.startsOn, period.endsOn));
          return (
            <li key={day} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-5">
              <span className={`shrink-0 text-[13.5px] font-semibold sm:w-[130px] ${day === today ? "text-iris" : ""}`}>
                {day === today ? "Aujourd'hui" : formatDayTitle(day)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                {company && (
                  <span className="inline-flex items-center gap-2 self-start rounded-lg bg-lime/45 px-2.5 py-1 text-[13px] font-semibold">
                    <Briefcase size={14} aria-hidden /> En entreprise
                  </span>
                )}
                {daySessions.map((session) => (
                  <span key={session.id} className={`rounded-lg border-l-4 bg-porcelaine px-3 py-1.5 text-[13.5px] ${kindStyle(session.kind).bar}`}>
                    <span className="font-semibold tabular-nums">{formatTimeRange(session.startsAt, session.endsAt)}</span>{" "}
                    {session.title}
                  </span>
                ))}
                {!company && daySessions.length === 0 && <span className="text-[13px] text-texte-doux">Rien de prévu</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </DashboardCard>
  );
}
