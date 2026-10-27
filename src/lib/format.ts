// Formats de dates, heures et nombres, toujours en français et à l'heure de Paris
// (le serveur, lui, tourne en UTC). Module sans dépendance : testé par tests/format.test.mjs.

export const TIME_ZONE = "Europe/Paris";

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });
const longDayFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const shortDayFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

type DateInput = Date | string;
const toDate = (value: DateInput) => (typeof value === "string" ? new Date(value) : value);

/** Jour calendaire à Paris, au format AAAA-MM-JJ (sert à regrouper et comparer des jours). */
export function parisDayKey(value: DateInput): string {
  return dayKeyFormat.format(toDate(value));
}

/** Nombre de jours calendaires (à Paris) entre aujourd'hui et la date visée. */
export function daysBetween(target: DateInput, now: DateInput = new Date()): number {
  const toUtc = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(parisDayKey(target)) - toUtc(parisDayKey(now))) / 86_400_000);
}

/** « Aujourd'hui », « Demain », « Dans 6 jours », « Hier », « Il y a 3 jours ». */
export function relativeDay(target: DateInput, now: DateInput = new Date()): string {
  const days = daysBetween(target, now);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  if (days === -1) return "Hier";
  return days > 1 ? `Dans ${days} jours` : `Il y a ${-days} jours`;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** « Mardi 3 novembre » */
export function formatLongDay(value: DateInput): string {
  return capitalize(longDayFormat.format(toDate(value)));
}

/** « mar. 3 nov. » */
export function formatShortDay(value: DateInput): string {
  return shortDayFormat.format(toDate(value));
}

/** « 9h », « 12h30 » */
export function formatTime(value: DateInput): string {
  const [hours, minutes] = timeFormat.format(toDate(value)).split(":");
  return `${Number(hours)}h${minutes === "00" ? "" : minutes}`;
}

/** « 9h – 12h30 » */
export function formatTimeRange(start: DateInput, end: DateInput): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** « 15,5 » */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}
