"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Upload } from "lucide-react";
import Notice from "@/components/ui/Notice";
import { createClient } from "@/lib/supabase/client";
import { SUBMISSION_ACCEPT, formatFileSize, safeFileName, submissionFileError } from "@/lib/validate";
import { saveSubmission } from "@/app/etudiant/travail/actions";

/**
 * Dépôt ou modification d'un rendu. Le fichier part directement du navigateur vers
 * Supabase Storage (dossier <devoir>/<étudiant>/, autorisé par la RLS du bucket jusqu'à
 * l'échéance), puis l'action serveur enregistre le rendu.
 */
export default function SubmissionForm({
  assignmentId,
  userId,
  requiresFile,
  initialComment,
  submitted,
  hasFile,
  onDone,
}: {
  assignmentId: string;
  userId: string;
  requiresFile: boolean;
  initialComment: string;
  submitted: boolean;
  hasFile: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const fileId = useId();
  const commentId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "upload" | "save">("idle");
  const [, startTransition] = useTransition();
  const busy = step !== "idle";

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setError(chosen ? submissionFileError(chosen.name, chosen.size) : null);
    setFile(chosen);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const comment = String(new FormData(event.currentTarget).get("comment") ?? "");

    if (requiresFile && !file && !hasFile) return setError("Ajoutez le fichier à rendre.");
    if (file) {
      const fileError = submissionFileError(file.name, file.size);
      if (fileError) return setError(fileError);
    }

    let filePath: string | null = null;
    if (file) {
      setStep("upload");
      filePath = `${assignmentId}/${userId}/${Date.now()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await createClient()
        .storage.from("submissions")
        .upload(filePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (uploadError) {
        setStep("idle");
        return setError(
          /mime|type/i.test(uploadError.message)
            ? "Ce type de fichier n'est pas accepté."
            : /size|large/i.test(uploadError.message)
              ? "Ce fichier dépasse 20 Mo."
              : "L'envoi du fichier a échoué. Vérifiez votre connexion et réessayez.",
        );
      }
    }

    setStep("save");
    const result = await saveSubmission({ assignmentId, filePath, comment });
    setStep("idle");
    if (!result.ok) return setError(result.error);

    setFile(null);
    if (input.current) input.current.value = "";
    onDone?.();
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && <Notice tone="error">{error}</Notice>}

      {requiresFile && (
        <div>
          <label htmlFor={fileId} className="lbl">
            {hasFile ? "Remplacer le fichier (facultatif)" : "Fichier à rendre"}
          </label>
          <label
            htmlFor={fileId}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-black/25 bg-white px-4 py-4 transition-colors hover:border-iris hover:bg-lilas-pale/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lilas-pale text-iris">
              {file ? <Paperclip size={18} aria-hidden /> : <Upload size={18} aria-hidden />}
            </span>
            <span className="min-w-0 text-[14px]">
              {file ? (
                <>
                  <span className="block truncate font-semibold">{file.name}</span>
                  <span className="block text-[12.5px] text-texte-doux">{formatFileSize(file.size)}</span>
                </>
              ) : (
                <>
                  <span className="block font-semibold">Choisir un fichier</span>
                  <span className="block text-[12.5px] text-texte-doux">PDF, ZIP, Office, OpenDocument ou image · 20 Mo maximum</span>
                </>
              )}
            </span>
          </label>
          <input
            ref={input}
            id={fileId}
            type="file"
            name="file"
            accept={SUBMISSION_ACCEPT}
            onChange={onFileChange}
            className="sr-only"
          />
        </div>
      )}

      <div>
        <label htmlFor={commentId} className="lbl">
          Commentaire pour le formateur <span className="font-normal text-texte-doux">(facultatif)</span>
        </label>
        <textarea
          id={commentId}
          name="comment"
          rows={3}
          maxLength={2000}
          defaultValue={initialComment}
          className="fld resize-y"
          placeholder="Une précision sur votre travail…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btnA" disabled={busy}>
          {step === "upload"
            ? "Envoi du fichier…"
            : step === "save"
              ? "Enregistrement…"
              : submitted
                ? "Mettre à jour mon rendu"
                : requiresFile
                  ? "Rendre mon travail"
                  : "Marquer comme fait"}
        </button>
        {onDone && (
          <button type="button" className="btnO" onClick={onDone} disabled={busy}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
