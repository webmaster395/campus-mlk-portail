import assert from "node:assert/strict";
import test from "node:test";
import { buildIcs, escapeText, foldLine } from "../src/lib/ics.ts";

test("les caractères spéciaux sont échappés", () => {
  assert.equal(escapeText("Salle 1.02, bâtiment A; étage\n2"), "Salle 1.02\\, bâtiment A\\; étage\\n2");
  assert.equal(escapeText("C:\\dossier"), "C:\\\\dossier");
});

test("les lignes longues sont repliées à 75 octets", () => {
  const folded = foldLine(`SUMMARY:${"é".repeat(60)}`);
  for (const line of folded.split("\r\n")) {
    assert.ok(new TextEncoder().encode(line).length <= 75);
  }
  assert.equal(folded.replace(/\r\n /g, ""), `SUMMARY:${"é".repeat(60)}`);
});

test("séance horodatée et période en entreprise sur la journée", () => {
  const ics = buildIcs({
    name: "MLK Campus",
    now: new Date("2026-10-27T12:00:00Z"),
    events: [
      {
        uid: "s1@portail-mlk",
        title: "Interfaces web",
        start: "2026-11-02T08:00:00Z",
        end: "2026-11-02T11:30:00Z",
        location: "Salle 1.02",
      },
      { uid: "e1@portail-mlk", title: "En entreprise", allDay: true, startsOn: "2026-11-04", endsOn: "2026-11-06" },
    ],
  });
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.match(ics, /DTSTART:20261102T080000Z\r\nDTEND:20261102T113000Z/);
  assert.match(ics, /LOCATION:Salle 1\.02/);
  // Fin exclusive : le lendemain du dernier jour en entreprise
  assert.match(ics, /DTSTART;VALUE=DATE:20261104\r\nDTEND;VALUE=DATE:20261107/);
  assert.equal(ics.match(/BEGIN:VEVENT/g).length, 2);
});
