// Règles d'affichage du travail à rendre et des notes. Module sans dépendance :
// testé par tests/pedagogy.test.mjs.

export type Tone = "success" | "danger" | "warning" | "info" | "neutral";

export type AssignmentStatus = {
  key: "submitted" | "late" | "soon" | "todo";
  label: string;
  tone: Tone;
};

/** Un devoir est « bientôt dû » dans les 3 jours qui précèdent son échéance. */
export const SOON_MS = 3 * 24 * 60 * 60 * 1000;

export function assignmentStatus(
  dueAt: string,
  submittedAt: string | null,
  now: Date = new Date(),
): AssignmentStatus {
  if (submittedAt) return { key: "submitted", label: "Rendu", tone: "success" };
  const remaining = new Date(dueAt).getTime() - now.getTime();
  if (remaining < 0) return { key: "late", label: "En retard", tone: "danger" };
  if (remaining <= SOON_MS) return { key: "soon", label: "Bientôt dû", tone: "warning" };
  return { key: "todo", label: "À rendre", tone: "neutral" };
}

/** Ordre de la liste « à faire » : en retard d'abord, puis par échéance la plus proche. */
export function compareTodo(
  a: { dueAt: string; status: AssignmentStatus },
  b: { dueAt: string; status: AssignmentStatus },
): number {
  const lateA = a.status.key === "late" ? 0 : 1;
  const lateB = b.status.key === "late" ? 0 : 1;
  if (lateA !== lateB) return lateA - lateB;
  return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
}

const EVALUATION_KINDS: Record<string, string> = {
  partiel: "Partiel",
  devoir_sur_table: "Devoir sur table",
  devoir_maison: "Devoir maison",
  ecf: "ECF",
  oral: "Oral",
  projet: "Projet",
};

/** Libellé du type d'évaluation (null pour « autre », qu'on n'affiche pas). */
export function evaluationKindLabel(kind: string): string | null {
  return EVALUATION_KINDS[kind] ?? null;
}

export type CompetencyResult = "acquis" | "en_cours" | "non_acquis";

const RESULT_LABELS: Record<CompetencyResult, { label: string; tone: Tone }> = {
  acquis: { label: "Acquis", tone: "success" },
  en_cours: { label: "En cours d'acquisition", tone: "warning" },
  non_acquis: { label: "Non acquis", tone: "danger" },
};

/** Libellé et couleur d'un résultat par compétence (null si inconnu). */
export function competencyResult(value: string | null): { label: string; tone: Tone } | null {
  return value && value in RESULT_LABELS ? RESULT_LABELS[value as CompetencyResult] : null;
}

/**
 * Moyenne indicative sur 20 : chaque note ramenée sur 20 et pondérée par le coefficient de
 * son évaluation. Les évaluations sans note chiffrée (compétences seules) sont ignorées.
 * Null s'il n'y a aucune note chiffrée.
 */
export function weightedAverage(
  items: { score: number | null; maxScore: number; coefficient: number }[],
): number | null {
  let total = 0;
  let weights = 0;
  for (const item of items) {
    if (item.score === null || item.maxScore <= 0 || item.coefficient <= 0) continue;
    total += (item.score / item.maxScore) * 20 * item.coefficient;
    weights += item.coefficient;
  }
  return weights ? Math.round((total / weights) * 100) / 100 : null;
}

/** Types de séance tels qu'affichés (les cours n'ont pas de pastille). */
export function sessionKind(kind: string): { label: string; tone: Tone } | null {
  if (kind === "evaluation") return { label: "Évaluation", tone: "warning" };
  if (kind === "evenement") return { label: "Événement", tone: "info" };
  return null;
}
