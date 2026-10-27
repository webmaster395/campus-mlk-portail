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

/** Types de séance tels qu'affichés (les cours n'ont pas de pastille). */
export function sessionKind(kind: string): { label: string; tone: Tone } | null {
  if (kind === "evaluation") return { label: "Évaluation", tone: "warning" };
  if (kind === "evenement") return { label: "Événement", tone: "info" };
  return null;
}
