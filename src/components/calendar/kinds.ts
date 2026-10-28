// Couleurs des types de séance dans le calendrier (barre latérale et pastilles du mois).
export const KIND_STYLES: Record<string, { label: string; bar: string; dot: string }> = {
  cours: { label: "Cours", bar: "border-l-iris", dot: "bg-iris" },
  evaluation: { label: "Évaluation", bar: "border-l-attente", dot: "bg-attente" },
  evenement: { label: "Événement", bar: "border-l-info", dot: "bg-info" },
};

export function kindStyle(kind: string) {
  return KIND_STYLES[kind] ?? KIND_STYLES.cours;
}
