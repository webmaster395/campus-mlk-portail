"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Déconnexion : supprime la session puis renvoie vers la connexion avec un message. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?info=deconnecte");
}
