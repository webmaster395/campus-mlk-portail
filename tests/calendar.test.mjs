import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  addMonths,
  formatDayTitle,
  formatMonthTitle,
  formatWeekRange,
  isDayKey,
  isWithin,
  monthGrid,
  weekDays,
  weekStart,
  weekdayIndex,
} from "../src/lib/calendar.ts";

test("validation des dates d'adresse (?date=…)", () => {
  assert.equal(isDayKey("2026-11-02"), true);
  assert.equal(isDayKey("2026-02-30"), false);
  assert.equal(isDayKey("demain"), false);
  assert.equal(isDayKey(null), false);
});

test("semaines du lundi au dimanche, y compris au changement d'heure", () => {
  assert.equal(weekdayIndex("2026-11-02"), 0); // lundi
  assert.equal(weekdayIndex("2026-11-08"), 6); // dimanche
  assert.equal(weekStart("2026-10-29"), "2026-10-26");
  // Passage à l'heure d'hiver le dimanche 25 octobre 2026 : pas de jour perdu
  assert.deepEqual(weekDays("2026-10-21"), [
    "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25",
  ]);
  assert.equal(addDays("2026-10-25", 1), "2026-10-26");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("grille du mois : semaines complètes qui couvrent tout le mois", () => {
  const grid = monthGrid("2026-11-15");
  assert.equal(grid[0][0], "2026-10-26"); // le 1er novembre 2026 est un dimanche
  assert.equal(grid.at(-1)[6], "2026-12-06");
  assert.equal(grid.length, 6);
  assert.ok(grid.every((week) => week.length === 7));
  assert.equal(addMonths("2026-12-15", 1), "2027-01-01");
  assert.equal(addMonths("2026-01-31", -1), "2025-12-01");
});

test("période en entreprise : bornes incluses", () => {
  assert.equal(isWithin("2026-11-04", "2026-11-04", "2026-11-06"), true);
  assert.equal(isWithin("2026-11-06", "2026-11-04", "2026-11-06"), true);
  assert.equal(isWithin("2026-11-07", "2026-11-04", "2026-11-06"), false);
});

test("titres en français", () => {
  assert.equal(formatWeekRange("2026-11-02", "2026-11-08"), "Du 2 au 8 novembre 2026");
  assert.equal(formatWeekRange("2026-10-26", "2026-11-01"), "Du 26 octobre au 1er novembre 2026");
  assert.equal(formatWeekRange("2026-12-28", "2027-01-03"), "Du 28 décembre 2026 au 3 janvier 2027");
  assert.equal(formatMonthTitle("2026-11-15"), "Novembre 2026");
  assert.equal(formatDayTitle("2026-11-02"), "Lundi 2 novembre");
  assert.equal(formatDayTitle("2026-12-01"), "Mardi 1er décembre");
});
