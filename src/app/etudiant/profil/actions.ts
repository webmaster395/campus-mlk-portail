"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { passwordErrorMessage } from "@/lib/auth-messages";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Enregistre la nouvelle photo, déjà déposée par le navigateur dans le dossier de la
 * personne (bucket privé « avatars », RLS), et supprime l'ancienne.
 */
export async function setAvatar(path: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Votre session a expiré. Reconnectez-vous." };
  if (!path.startsWith(`${user.id}/`) || path.includes("..")) return { ok: false, error: "Photo refusée." };

  const { data: profile } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).single();
  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id);
  if (error) {
    await supabase.storage.from("avatars").remove([path]);
    return { ok: false, error: "La photo n'a pas pu être enregistrée." };
  }
  if (profile?.avatar_path && profile.avatar_path !== path) {
    await supabase.storage.from("avatars").remove([profile.avatar_path]);
  }
  revalidatePath("/etudiant", "layout");
  return { ok: true };
}

/** Retire la photo de profil (les initiales reprennent sa place). */
export async function removeAvatar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).single();
  if (!profile?.avatar_path) return;
  await supabase.from("profiles").update({ avatar_path: null }).eq("id", user.id);
  await supabase.storage.from("avatars").remove([profile.avatar_path]);
  revalidatePath("/etudiant", "layout");
}

export type PasswordState = { error: string | null; success: boolean };

/** Change le mot de passe après vérification du mot de passe actuel. */
export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!current) return { error: "Indiquez votre mot de passe actuel.", success: false };
  if (password.length < 8) return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères.", success: false };
  if (password !== confirm) return { error: "Les deux mots de passe ne correspondent pas.", success: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Votre session a expiré. Reconnectez-vous.", success: false };

  // Le mot de passe actuel est vérifié en se reconnectant : une session laissée ouverte
  // sur un ordinateur partagé ne suffit pas à changer le mot de passe
  const { error: checkError } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
  if (checkError) return { error: "Le mot de passe actuel est incorrect.", success: false };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: passwordErrorMessage(error.code, error.message), success: false };
  return { error: null, success: true };
}
