"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validate";

export type SaveSubmissionResult = { ok: true } | { ok: false; error: string };

/**
 * Enregistre un rendu. Le fichier a déjà été déposé par le navigateur directement dans le
 * bucket « submissions » (les actions serveur sont limitées à 1 Mo, Vercel à 4,5 Mo) ; on
 * vérifie ici qu'il est bien dans le dossier de la personne pour ce devoir. La RLS refuse
 * tout rendu après l'échéance ou sur un devoir d'une autre promotion.
 */
export async function saveSubmission(input: {
  assignmentId: string;
  filePath: string | null;
  comment: string;
}): Promise<SaveSubmissionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Votre session a expiré. Reconnectez-vous." };
  if (!isUuid(input.assignmentId)) return { ok: false, error: "Devoir introuvable." };

  const folder = `${input.assignmentId}/${user.id}/`;
  if (input.filePath && (!input.filePath.startsWith(folder) || input.filePath.includes(".."))) {
    return { ok: false, error: "Fichier refusé." };
  }
  const comment = input.comment.trim().slice(0, 2000);

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, due_at, requires_file")
    .eq("id", input.assignmentId)
    .maybeSingle();
  if (!assignment) return { ok: false, error: "Devoir introuvable." };
  if (new Date(assignment.due_at) <= new Date()) {
    return { ok: false, error: "La date limite est passée : contactez votre formateur." };
  }

  const { data: existing } = await supabase
    .from("submissions")
    .select("id, file_path")
    .eq("assignment_id", input.assignmentId)
    .eq("student_id", user.id)
    .maybeSingle();

  const filePath = input.filePath ?? existing?.file_path ?? null;
  if (assignment.requires_file && !filePath) return { ok: false, error: "Ajoutez le fichier à rendre." };

  const { error } = existing
    ? await supabase.from("submissions").update({ file_path: filePath, comment }).eq("id", existing.id)
    : await supabase
        .from("submissions")
        .insert({ assignment_id: input.assignmentId, student_id: user.id, file_path: filePath, comment });

  if (error) {
    if (input.filePath) await supabase.storage.from("submissions").remove([input.filePath]);
    return { ok: false, error: "Le rendu n'a pas pu être enregistré. Réessayez dans un instant." };
  }

  // Un nouveau fichier remplace l'ancien : on ne garde pas de version orpheline
  if (input.filePath && existing?.file_path && existing.file_path !== input.filePath) {
    await supabase.storage.from("submissions").remove([existing.file_path]);
  }

  revalidatePath("/etudiant", "layout");
  return { ok: true };
}
