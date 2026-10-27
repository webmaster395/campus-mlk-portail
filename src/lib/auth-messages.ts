// Messages d'authentification en français et garde-fous des liens de retour.
// Module sans dépendance : testé directement par node --test (tests/auth-messages.test.mjs).

export const SUPPORT_EMAIL = "campus@mlkgrandparis.com";

export const DEACTIVATED_MESSAGE = `Ce compte est désactivé. Contactez l'équipe de MLK Campus (${SUPPORT_EMAIL}).`;

/** Message affiché quand la connexion échoue (codes d'erreur de Supabase Auth). */
export function signInErrorMessage(code: string | undefined, message = ""): string {
  const text = message.toLowerCase();
  if (code === "user_banned" || text.includes("banned")) return DEACTIVATED_MESSAGE;
  // Supabase ne renvoie « e-mail non confirmé » qu'avec le bon mot de passe : on peut le dire
  if (code === "email_not_confirmed" || text.includes("email not confirmed")) {
    return "Votre adresse e-mail n'est pas encore confirmée. Ouvrez le lien reçu par e-mail (pensez aux courriers indésirables).";
  }
  if (code === "over_request_rate_limit" || text.includes("rate limit")) {
    return "Trop de tentatives en peu de temps. Réessayez dans quelques minutes.";
  }
  return "E-mail ou mot de passe incorrect.";
}

/** Message affiché quand le nouveau mot de passe est refusé. */
export function passwordErrorMessage(code: string | undefined, message = ""): string {
  const text = message.toLowerCase();
  if (code === "same_password" || text.includes("different from the old")) {
    return "C'est déjà votre mot de passe actuel. Choisissez-en un autre.";
  }
  if (code === "weak_password" || text.includes("weak")) {
    return "Ce mot de passe est trop simple. Choisissez-en un plus long ou plus varié.";
  }
  return "Le mot de passe n'a pas pu être enregistré. Réessayez dans un instant.";
}

/** Messages portés par l'adresse de /login (?erreur=… ou ?info=…). */
export const LOGIN_NOTICES: Record<string, { tone: "error" | "success"; text: string }> = {
  lien_invalide: {
    tone: "error",
    text: "Ce lien n'est plus valide. Connectez-vous, ou demandez un nouveau lien depuis « Mot de passe oublié ».",
  },
  desactive: { tone: "error", text: DEACTIVATED_MESSAGE },
  deconnecte: { tone: "success", text: "Vous êtes bien déconnecté. À bientôt !" },
};

/**
 * Chemin de retour sûr après un lien d'e-mail : uniquement une adresse de ce site,
 * jamais « //autre-site » ni une URL absolue (redirection ouverte).
 */
export function safeNextPath(value: string | null | undefined, fallback = "/etudiant"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
