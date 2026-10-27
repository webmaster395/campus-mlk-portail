"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Confirme une adresse e-mail (confirmation ou changement d'adresse) au clic sur le bouton
 * de /auth/confirm. Le jeton n'est consommé qu'ici, jamais à l'ouverture du lien.
 */
export async function confirmEmail(formData: FormData) {
  const tokenHash = formData.get("token_hash") as string | null;
  const type: EmailOtpType = formData.get("type") === "email_change" ? "email_change" : "email";
  if (!tokenHash) redirect("/login?erreur=lien_invalide");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    // Jeton déjà utilisé : si une session existe, l'adresse est bien confirmée
    const { data } = await supabase.auth.getClaims();
    redirect(data?.claims?.sub ? "/etudiant" : "/login?erreur=lien_invalide");
  }

  redirect("/etudiant");
}
