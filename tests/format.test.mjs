import assert from "node:assert/strict";
import test from "node:test";
import {
  daysBetween,
  formatLongDay,
  formatNumber,
  formatTime,
  formatTimeRange,
  parisDayKey,
  relativeDay,
} from "../src/lib/format.ts";

test("le jour est calculé à l'heure de Paris, pas en UTC", () => {
  // 23h30 UTC le 2 novembre = 0h30 le 3 novembre à Paris (heure d'hiver)
  assert.equal(parisDayKey("2026-11-02T23:30:00Z"), "2026-11-03");
  // 21h30 UTC le 2 juin = 23h30 le 2 juin à Paris (heure d'été)
  assert.equal(parisDayKey("2026-06-02T21:30:00Z"), "2026-06-02");
});

test("écart en jours calendaires et libellé relatif", () => {
  const now = new Date("2026-10-27T22:30:00Z"); // 23h30 à Paris, mardi
  assert.equal(daysBetween("2026-10-27T23:30:00Z", now), 1); // 0h30 mercredi à Paris
  assert.equal(relativeDay("2026-10-27T08:00:00Z", now), "Aujourd'hui");
  assert.equal(relativeDay("2026-10-28T08:00:00Z", now), "Demain");
  assert.equal(relativeDay("2026-11-02T08:00:00Z", now), "Dans 6 jours");
  assert.equal(relativeDay("2026-10-26T08:00:00Z", now), "Hier");
  assert.equal(relativeDay("2026-10-23T08:00:00Z", now), "Il y a 4 jours");
});

test("dates et heures en français", () => {
  assert.equal(formatLongDay("2026-11-03T08:00:00Z"), "Mardi 3 novembre");
  assert.equal(formatTime("2026-11-03T08:00:00Z"), "9h");
  assert.equal(formatTime("2026-11-03T11:30:00Z"), "12h30");
  assert.equal(formatTimeRange("2026-11-03T08:00:00Z", "2026-11-03T11:30:00Z"), "9h – 12h30");
});

test("nombres à la française", () => {
  assert.equal(formatNumber(15.5), "15,5");
  assert.equal(formatNumber(20), "20");
});
