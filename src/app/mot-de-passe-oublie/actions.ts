"use server";

import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";

export type ResetRequestState = { error: string | null; sentTo: string | null };

/**
 * Envoie le lien de réinitialisation. Même réponse qu'il existe un compte ou non :
 * on ne révèle pas qui est inscrit.
 */
export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Cette adresse e-mail n'est pas valide. Vérifiez votre saisie.", sentTo: null };
  }

  const supabase = await createClient();
  // Lien PKCE : /auth/callback échange le code puis ouvre le choix du nouveau mot de passe
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/auth/reinitialiser`,
  });

  if (error && (error.code === "over_email_send_rate_limit" || /rate limit/i.test(error.message))) {
    return { error: "Trop de demandes en peu de temps. Réessayez dans quelques minutes.", sentTo: null };
  }
  return { error: null, sentTo: email };
}
