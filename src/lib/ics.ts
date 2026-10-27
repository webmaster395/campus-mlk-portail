// Fichier iCalendar (.ics) pour importer son calendrier dans Google Agenda, Outlook ou
// Apple Calendrier (RFC 5545). Module sans dépendance : testé par tests/ics.test.mjs.

export type IcsEvent =
  | {
      uid: string;
      title: string;
      start: string; // instant ISO
      end: string;
      location?: string | null;
      description?: string | null;
    }
  | {
      uid: string;
      title: string;
      allDay: true;
      startsOn: string; // AAAA-MM-JJ
      endsOn: string; // inclus
      description?: string | null;
    };

/** Texte échappé selon la RFC : barre oblique inverse, point-virgule, virgule, retour ligne. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Lignes repliées à 75 octets (UTF-8), suite précédée d'un espace. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // la suite commence par un espace
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/** 2026-11-02T08:00:00.000Z → 20261102T080000Z */
function utcStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** 2026-11-04 → 20261104 */
function dateStamp(key: string): string {
  return key.replace(/-/g, "");
}

function nextDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

export function buildIcs({
  name,
  events,
  now = new Date(),
}: {
  name: string;
  events: IcsEvent[];
  now?: Date;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MLK Campus//Portail des apprentis//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "X-WR-TIMEZONE:Europe/Paris",
  ];
  const stamp = utcStamp(now.toISOString());

  for (const event of events) {
    lines.push("BEGIN:VEVENT", `UID:${event.uid}`, `DTSTAMP:${stamp}`);
    if ("allDay" in event) {
      // DTEND d'un événement « journée entière » : le lendemain du dernier jour (exclu)
      lines.push(`DTSTART;VALUE=DATE:${dateStamp(event.startsOn)}`, `DTEND;VALUE=DATE:${dateStamp(nextDay(event.endsOn))}`);
      lines.push("TRANSP:TRANSPARENT");
    } else {
      lines.push(`DTSTART:${utcStamp(event.start)}`, `DTEND:${utcStamp(event.end)}`);
      if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    }
    lines.push(`SUMMARY:${escapeText(event.title)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
