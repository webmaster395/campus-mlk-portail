import assert from "node:assert/strict";
import test from "node:test";
import { assignmentStatus, compareTodo, competencyResult, sessionKind } from "../src/lib/pedagogy.ts";

const now = new Date("2026-10-27T12:00:00Z");

test("statut d'un devoir selon l'échéance et le rendu", () => {
  assert.equal(assignmentStatus("2026-10-20T22:59:00Z", "2026-10-19T10:00:00Z", now).key, "submitted");
  assert.equal(assignmentStatus("2026-10-23T22:59:00Z", null, now).key, "late");
  assert.equal(assignmentStatus("2026-10-29T22:59:00Z", null, now).key, "soon"); // dans 2 j 11 h
  assert.equal(assignmentStatus("2026-10-30T22:59:00Z", null, now).key, "todo"); // dans 3 j 11 h
  assert.equal(assignmentStatus("2026-11-14T22:59:00Z", null, now).key, "todo");
});

test("un rendu compte même après l'échéance", () => {
  assert.equal(assignmentStatus("2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z", now).label, "Rendu");
});

test("liste à faire : en retard d'abord, puis échéance la plus proche", () => {
  const item = (dueAt) => ({ dueAt, status: assignmentStatus(dueAt, null, now) });
  const sorted = [item("2026-11-14T22:59:00Z"), item("2026-10-23T22:59:00Z"), item("2026-10-30T22:59:00Z")]
    .sort(compareTodo)
    .map((entry) => entry.dueAt);
  assert.deepEqual(sorted, ["2026-10-23T22:59:00Z", "2026-10-30T22:59:00Z", "2026-11-14T22:59:00Z"]);
});

test("résultats par compétence et types de séance", () => {
  assert.equal(competencyResult("acquis")?.label, "Acquis");
  assert.equal(competencyResult("non_acquis")?.tone, "danger");
  assert.equal(competencyResult(null), null);
  assert.equal(competencyResult("inconnu"), null);
  assert.equal(sessionKind("evaluation")?.label, "Évaluation");
  assert.equal(sessionKind("cours"), null);
});
