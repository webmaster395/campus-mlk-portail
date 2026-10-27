"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import Notice from "@/components/ui/Notice";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/lib/validate";
import { setAvatar } from "@/app/etudiant/profil/actions";

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Choix d'une photo : envoi direct vers le bucket privé « avatars », puis enregistrement. */
export default function AvatarUploader({ userId, hasAvatar }: { userId: string; hasAvatar: boolean }) {
  const router = useRouter();
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    if (!AVATAR_TYPES.includes(file.type)) return setError("Choisissez une image JPEG, PNG ou WebP.");
    if (file.size > AVATAR_MAX_BYTES) return setError("Cette image dépasse 2 Mo.");

    setBusy(true);
    const path = `${userId}/avatar-${Date.now()}.${EXTENSIONS[file.type]}`;
    const { error: uploadError } = await createClient()
      .storage.from("avatars")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setBusy(false);
      return setError("L'envoi de la photo a échoué. Réessayez.");
    }
    const result = await setAvatar(path);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={inputId} className={`btnO cursor-pointer !px-5 !py-2.5 text-[13.5px] ${busy ? "pointer-events-none opacity-60" : ""}`}>
        <Camera size={16} aria-hidden /> {busy ? "Envoi…" : hasAvatar ? "Changer la photo" : "Ajouter une photo"}
      </label>
      <input
        id={inputId}
        type="file"
        accept={AVATAR_TYPES.join(",")}
        onChange={onChange}
        disabled={busy}
        className="sr-only"
      />
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
