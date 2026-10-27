// Calcul des jours du calendrier sur des « clés de jour » AAAA-MM-JJ (jours calendaires à
// Paris, voir parisDayKey dans format.ts). Arithmétique faite en UTC pour éviter les pièges
// des changements d'heure. Module sans dépendance : testé par tests/calendar.test.mjs.

const DAY_MS = 86_400_000;

function toUtc(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Vrai pour une date AAAA-MM-JJ qui existe (refuse 2026-02-30, « demain »…). */
export function isDayKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return fromUtc(toUtc(value)) === value;
}

export function addDays(key: string, days: number): string {
  return fromUtc(toUtc(key) + days * DAY_MS);
}

/** 0 = lundi … 6 = dimanche */
export function weekdayIndex(key: string): number {
  return (new Date(toUtc(key)).getUTCDay() + 6) % 7;
}

/** Le lundi de la semaine du jour donné. */
export function weekStart(key: string): string {
  return addDays(key, -weekdayIndex(key));
}

/** Les 7 jours (lundi → dimanche) de la semaine du jour donné. */
export function weekDays(key: string): string[] {
  const monday = weekStart(key);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

/** Le premier jour du mois du jour donné. */
export function monthStart(key: string): string {
  return `${key.slice(0, 8)}01`;
}

/** Décale d'un nombre de mois, en restant sur le 1er du mois. */
export function addMonths(key: string, months: number): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, 1));
  return fromUtc(date.getTime());
}

/** Les semaines (lundi → dimanche) qui couvrent entièrement le mois du jour donné. */
export function monthGrid(key: string): string[][] {
  const first = monthStart(key);
  const last = addDays(addMonths(first, 1), -1);
  const weeks: string[][] = [];
  for (let monday = weekStart(first); monday <= last; monday = addDays(monday, 7)) {
    weeks.push(weekDays(monday));
  }
  return weeks;
}

/** Vrai si le jour est dans la plage [startsOn, endsOn] (bornes incluses). */
export function isWithin(key: string, startsOn: string, endsOn: string): boolean {
  return key >= startsOn && key <= endsOn;
}

// Formats : une clé de jour est formatée à midi UTC, qui tombe le même jour à Paris
const atNoon = (key: string) => new Date(`${key}T12:00:00Z`);
const dayMonth = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
const dayMonthYear = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
const weekdayShort = new Intl.DateTimeFormat("fr-FR", { weekday: "short", timeZone: "UTC" });
const weekdayLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
// « 1er » pour le premier du mois, comme on l'écrit en français
const withFirst = (text: string) => text.replace(/^1 /, "1er ");

/** « Du 2 au 8 novembre 2026 », « Du 26 octobre au 1er novembre 2026 » */
export function formatWeekRange(startKey: string, endKey: string): string {
  const sameMonth = startKey.slice(0, 7) === endKey.slice(0, 7);
  const sameYear = startKey.slice(0, 4) === endKey.slice(0, 4);
  const start = sameMonth
    ? withFirst(String(Number(startKey.slice(8))))
    : withFirst(sameYear ? dayMonth.format(atNoon(startKey)) : dayMonthYear.format(atNoon(startKey)));
  return `Du ${start} au ${withFirst(dayMonthYear.format(atNoon(endKey)))}`;
}

/** « Novembre 2026 » */
export function formatMonthTitle(key: string): string {
  return capitalize(monthYear.format(atNoon(key)));
}

/** « lun. » */
export function formatWeekdayShort(key: string): string {
  return weekdayShort.format(atNoon(key));
}

/** « Lundi 2 novembre » */
export function formatDayTitle(key: string): string {
  return capitalize(withFirst(weekdayLong.format(atNoon(key)).replace(/ 1 /, " 1er ")));
}
