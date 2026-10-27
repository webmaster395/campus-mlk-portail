"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Marque toutes les annonces comme lues (seule colonne du profil que l'étudiant écrit avec sa photo). */
export async function markAnnouncementsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update({ announcements_seen_at: new Date().toISOString() }).eq("id", user.id);
  // Pastilles de la sidebar et de l'en-tête comprises
  revalidatePath("/etudiant", "layout");
}
