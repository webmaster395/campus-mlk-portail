import type { Metadata } from "next";
import CalendarToolbar, { type CalendarView } from "@/components/calendar/CalendarToolbar";
import Legend from "@/components/calendar/Legend";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import PageHeader from "@/components/ui/PageHeader";
import PendingPromotion from "@/components/ui/PendingPromotion";
import {
  addDays,
  addMonths,
  formatMonthTitle,
  formatWeekRange,
  isDayKey,
  isWithin,
  monthGrid,
  weekDays,
} from "@/lib/calendar";
import { getCompanyPeriods, getSessionsBetween, type CompanyPeriod, type DashboardSession } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";
import { parisDayKey } from "@/lib/format";

export const metadata: Metadata = { title: "Calendrier" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/*
  Calendrier : séances au campus et périodes en entreprise, en vue semaine ou mois.
  L'adresse porte la vue et le jour affiché (?vue=mois&date=2026-11-02) : on peut la
  partager, et les boutons précédent / suivant sont de simples liens.
*/
export default async function CalendarPage({ searchParams }: PageProps<"/etudiant/calendrier">) {
  const viewer = await getViewer();
  if (!viewer) return null;

  const header = (
    <PageHeader eyebrow={viewer.promotion?.label ?? "Espace apprentis"} title="Calendrier">
      Vos journées au campus et vos périodes en entreprise.
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
  const view: CalendarView = first(params.vue) === "mois" ? "mois" : "semaine";
  const today = parisDayKey(new Date());
  const requested = first(params.date);
  const anchor = isDayKey(requested) ? requested : today;

  const week = weekDays(anchor);
  const weeks = monthGrid(anchor);
  const from = view === "semaine" ? week[0] : weeks[0][0];
  const to = view === "semaine" ? week[6] : weeks.at(-1)![6];

  const [sessions, periods] = await Promise.all([getSessionsBetween(from, to), getCompanyPeriods(from, to)]);

  const sessionsByDay = new Map<string, DashboardSession[]>();
  for (const session of sessions) {
    const day = parisDayKey(session.startsAt);
    sessionsByDay.set(day, [...(sessionsByDay.get(day) ?? []), session]);
  }
  const companyByDay = new Map<string, CompanyPeriod>();
  for (let day = from; day <= to; day = addDays(day, 1)) {
    const period = periods.find((p) => isWithin(day, p.startsOn, p.endsOn));
    if (period) companyByDay.set(day, period);
  }

  return (
    <>
      {header}
      <CalendarToolbar
        view={view}
        title={view === "semaine" ? formatWeekRange(week[0], week[6]) : formatMonthTitle(anchor)}
        previous={view === "semaine" ? addDays(anchor, -7) : addMonths(anchor, -1)}
        next={view === "semaine" ? addDays(anchor, 7) : addMonths(anchor, 1)}
        anchor={anchor}
        today={today}
      />
      <Legend />
      {view === "semaine" ? (
        <WeekView
          days={week}
          today={today}
          sessionsByDay={sessionsByDay}
          companyByDay={companyByDay}
          companyName={viewer.companyName}
        />
      ) : (
        <MonthView
          weeks={weeks}
          month={anchor.slice(0, 7)}
          today={today}
          sessionsByDay={sessionsByDay}
          companyByDay={companyByDay}
        />
      )}
    </>
  );
}
