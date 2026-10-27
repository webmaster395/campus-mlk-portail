"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signUpErrorMessage } from "@/lib/auth-messages";
import { siteUrl } from "@/lib/site";

export type SignUpState = {
  error: string | null;
  sentTo: string | null;
  values: { firstName: string; lastName: string; email: string };
};

/**
 * Création de compte libre. Le compte naît sans promotion : c'est le CFA qui le rattache
 * à sa classe (la promotion ouvre l'accès aux données, elle n'est jamais choisie par
 * l'inscrit). Si Supabase exige la confirmation de l'adresse, un e-mail part ; sinon la
 * session est ouverte tout de suite.
 */
export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const values = {
    firstName: String(formData.get("first_name") ?? "").trim(),
    lastName: String(formData.get("last_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  };
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const fail = (error: string): SignUpState => ({ error, sentTo: null, values });

  if (!values.firstName || !values.lastName) return fail("Renseignez votre prénom et votre nom.");
  if (values.firstName.length > 80 || values.lastName.length > 80) return fail("Prénom ou nom trop long.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return fail("Cette adresse e-mail n'est pas valide. Vérifiez votre saisie.");
  }
  if (password.length < 8) return fail("Le mot de passe doit contenir au moins 8 caractères.");
  if (password !== confirm) return fail("Les deux mots de passe ne correspondent pas.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: {
      data: { first_name: values.firstName, last_name: values.lastName },
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/etudiant`,
    },
  });
  if (error) return fail(signUpErrorMessage(error.code, error.message));

  // Confirmation d'e-mail désactivée dans Supabase : la personne est déjà connectée
  if (data.session) redirect("/etudiant");

  // Même réponse si l'adresse a déjà un compte : on ne révèle pas qui est inscrit
  return { error: null, sentTo: values.email, values };
}
