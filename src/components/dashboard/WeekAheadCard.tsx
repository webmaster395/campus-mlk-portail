import Link from "next/link";
import { Briefcase, CalendarRange, GraduationCap } from "lucide-react";
import {
  addDays,
  formatWeekdayShort,
  formatWeekRange,
  isWithin,
  weekdayIndex,
  weekStart,
} from "@/lib/calendar";
import { getCompanyPeriods, getSessionsBetween } from "@/lib/data/student";
import { formatTime, parisDayKey } from "@/lib/format";
import DashboardCard from "./DashboardCard";

/** Bandeau horizontal des 5 jours ouvrés (lundi → vendredi) : rythme Campus vs Entreprise. */
export default async function WeekAheadCard({ now, className = "" }: { now: Date; className?: string }) {
  const today = parisDayKey(now);
  // Si nous sommes samedi (5) ou dimanche (6), on affiche la semaine à venir dès le lundi suivant
  const anchorDay = weekdayIndex(today) >= 5 ? addDays(today, 2) : today;
  const monday = weekStart(anchorDay);
  const friday = addDays(monday, 4);

  const [sessions, periods] = await Promise.all([
    getSessionsBetween(monday, friday),
    getCompanyPeriods(monday, friday),
  ]);

  const workDays = Array.from({ length: 5 }, (_, index) => addDays(monday, index));

  const legendBadge = (
    <span className="ml-auto hidden items-center gap-3 text-[12px] font-medium text-texte-doux sm:inline-flex">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-iris" aria-hidden />
        Campus
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-lime ring-1 ring-black/15" aria-hidden />
        Entreprise
      </span>
    </span>
  );

  return (
    <DashboardCard
      icon={CalendarRange}
      title="Rythme de la semaine"
      badge={legendBadge}
      href={`/etudiant/calendrier?vue=semaine&date=${monday}`}
      linkLabel="Calendrier"
      className={className}
    >
      <p className="-mt-2 mb-3.5 text-[12.5px] font-medium text-texte-doux">
        {formatWeekRange(monday, friday)}
      </p>

      <ol className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-5">
        {workDays.map((day) => {
          const daySessions = sessions.filter((session) => parisDayKey(session.startsAt) === day);
          const isCompany = periods.some((period) => isWithin(day, period.startsOn, period.endsOn));
          const isCampus = daySessions.length > 0;
          const isToday = day === today;
          const dayNum = Number(day.slice(8));
          const weekdayLabel = formatWeekdayShort(day).replace(".", "");

          const firstSession = daySessions[0];
          const lastSession = daySessions[daySessions.length - 1];

          let cardTone = "border-black/[0.07] bg-porcelaine/55 hover:border-black/15";
          if (isCampus) {
            cardTone = "border-iris/20 bg-lilas-pale/40 hover:border-iris/45";
          } else if (isCompany) {
            cardTone = "border-[#a8d922]/50 bg-lime/20 hover:border-[#8cb814]";
          }

          return (
            <li key={day} className="flex">
              <Link
                href={`/etudiant/calendrier?vue=semaine&date=${day}`}
                className={`group flex w-full flex-col justify-between gap-3 rounded-xl border p-3.5 transition-all ${cardTone} ${
                  isToday ? "ring-2 ring-iris ring-offset-2 ring-offset-white" : ""
                }`}
              >
                {/* En-tête du jour : Lun 26 + pastille Aujourd'hui */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[11px] font-bold tracking-[0.06em] text-texte-doux uppercase">
                      {weekdayLabel}
                    </span>
                    <span className="nr text-[19px] leading-none text-graphite">{dayNum}</span>
                  </div>
                  {isToday && (
                    <span className="rounded-full bg-iris px-2 py-0.5 text-[10px] font-bold text-white">
                      Auj.
                    </span>
                  )}
                </div>

                {/* Corps épuré : Campus (horaires seuls) / Entreprise / Libre */}
                <div className="flex flex-col gap-0.5">
                  {isCampus && firstSession && lastSession ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-iris">
                        <GraduationCap size={14} aria-hidden />
                        Campus
                      </span>
                      <span className="text-[12.5px] font-semibold tabular-nums text-graphite">
                        {formatTime(firstSession.startsAt)} – {formatTime(lastSession.endsAt)}
                      </span>
                    </>
                  ) : isCompany ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#4d6800]">
                        <Briefcase size={13} aria-hidden />
                        Entreprise
                      </span>
                      <span className="text-[12px] font-medium text-texte-doux">
                        Alternance
                      </span>
                    </>
                  ) : (
                    <span className="text-[12px] text-texte-doux">Aucun cours</span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </DashboardCard>
  );
}
