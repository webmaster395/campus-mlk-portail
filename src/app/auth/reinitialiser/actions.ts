"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { passwordErrorMessage } from "@/lib/auth-messages";

export type ResetState = { error: string | null };

/**
 * Enregistre le mot de passe : premier mot de passe après une invitation, ou nouveau mot
 * de passe après un oubli. Le jeton de l'e-mail n'est échangé qu'ici, au clic : les
 * messageries qui ouvrent les liens à l'avance ne peuvent pas le consommer à la place de
 * la personne. Sans jeton, il faut une session ouverte (retour par /auth/callback).
 */
export async function setPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const tokenHash = formData.get("token_hash") as string | null;
  const type = formData.get("type") === "invite" ? "invite" : "recovery";

  // Vérifier avant d'échanger le jeton, pour qu'une faute de frappe ne le consomme pas
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (password !== confirm) return { error: "Les deux mots de passe ne correspondent pas." };

  const supabase = await createClient();

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) redirect("/mot-de-passe-oublie?erreur=lien_expire");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/mot-de-passe-oublie?erreur=lien_expire");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const message = passwordErrorMessage(error.code, error.message);
    // Le jeton est consommé mais la session est ouverte : on peut réessayer sans lien
    if (tokenHash) redirect(`/auth/reinitialiser?erreur=${encodeURIComponent(message)}`);
    return { error: message };
  }

  redirect("/etudiant");
}
