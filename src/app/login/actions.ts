"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInErrorMessage } from "@/lib/auth-messages";

export type SignInState = { error: string | null; email: string };

/** Connexion par e-mail et mot de passe ; la session est posée en cookie par Supabase. */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Renseignez votre e-mail et votre mot de passe.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: signInErrorMessage(error.code, error.message), email };

  redirect("/etudiant");
}
