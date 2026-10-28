/**
 * Thèmes officiels des filières MLK Campus (reprises du site et de la charte du 10 juillet 2026).
 *
 * - Monteur audiovisuel      : Safran / Jaune-Orangé (#F4BF4C)
 * - Graphiste                : Lavande / Mauve (#BA7EEE)
 * - Commis de cuisine        : Bleu ciel (#91BCFF)
 * - Serveur en restauration  : Orange corail (#E87551)
 */

export type FormationTheme = {
  key: string;
  name: string;
  category: string;
  levelLabel: string;
  color: string;
  textDark: string;
  /** Teinte soutenue de la filière : fond du bandeau du logo, accents, texte (contraste ≥ 4,5:1 avec du blanc). */
  deep: string;
  /** Fond très pâle (pastilles, surfaces teintées). */
  pale: string;
  bgLight: string;
  borderSoft: string;
};

export const FORMATION_THEMES: Record<string, FormationTheme> = {
  "monteur-audiovisuel": {
    key: "monteur-audiovisuel",
    name: "Monteur audiovisuel",
    category: "Audiovisuel",
    levelLabel: "Niveau 5 (BAC+2)",
    color: "#F4BF4C",
    textDark: "#7a4b00",
    deep: "#a85d00",
    pale: "#fdf1d8",
    bgLight: "rgba(244, 191, 76, 0.18)",
    borderSoft: "rgba(244, 191, 76, 0.35)",
  },
  graphiste: {
    key: "graphiste",
    name: "Graphiste",
    category: "Arts graphiques",
    levelLabel: "Niveau 5 (BAC+2)",
    color: "#BA7EEE",
    textDark: "#5c2a96",
    deep: "#6b3aa8",
    pale: "#f2e9fb",
    bgLight: "rgba(186, 126, 238, 0.18)",
    borderSoft: "rgba(186, 126, 238, 0.35)",
  },
  "commis-de-cuisine": {
    key: "commis-de-cuisine",
    name: "Commis de cuisine",
    category: "Cuisine",
    levelLabel: "Niveau 3 (CAP)",
    color: "#91BCFF",
    textDark: "#1744ad",
    deep: "#1f4fb8",
    pale: "#e3eeff",
    bgLight: "rgba(145, 188, 255, 0.22)",
    borderSoft: "rgba(145, 188, 255, 0.40)",
  },
  "serveur-en-restauration": {
    key: "serveur-en-restauration",
    name: "Serveur en restauration",
    category: "Restauration",
    levelLabel: "Niveau 3 (CAP)",
    color: "#E87551",
    textDark: "#8a2b10",
    deep: "#b8421f",
    pale: "#fbe6df",
    bgLight: "rgba(232, 117, 81, 0.18)",
    borderSoft: "rgba(232, 117, 81, 0.35)",
  },
};

/**
 * Retrouve le thème d'une formation à partir de son titre ou de son identifiant/slug.
 * Renvoie par défaut le thème de Monteur audiovisuel si non trouvé.
 */
export function getFormationTheme(titleOrSlug?: string | null): FormationTheme {
  if (!titleOrSlug) return FORMATION_THEMES["monteur-audiovisuel"];
  const lower = titleOrSlug.toLowerCase();

  if (lower.includes("audio") || lower.includes("mont")) {
    return FORMATION_THEMES["monteur-audiovisuel"];
  }
  if (lower.includes("graph")) {
    return FORMATION_THEMES.graphiste;
  }
  if (lower.includes("cuisin") || lower.includes("commis")) {
    return FORMATION_THEMES["commis-de-cuisine"];
  }
  if (lower.includes("serve") || lower.includes("restau")) {
    return FORMATION_THEMES["serveur-en-restauration"];
  }

  return FORMATION_THEMES["monteur-audiovisuel"];
}

/**
 * Variables CSS qui recolorent l'espace selon la filière : l'accent interactif (iris), les
 * surfaces pâles et le bandeau du logo. Sans filière, la charte MLK Campus d'origine s'applique.
 * À poser sur l'élément racine de la coquille ; les utilitaires (bg-iris, text-iris, bg-band…)
 * lisent ces variables.
 */
export function formationCssVars(theme: FormationTheme | null): Record<string, string> {
  if (!theme) return {};
  return {
    "--color-iris": theme.deep,
    "--color-lilas-pale": theme.pale,
    "--color-band": theme.deep,
  };
}
