"use client";

import { useActionState } from "react";
import PasswordField from "@/components/auth/PasswordField";
import Notice from "@/components/ui/Notice";
import { changePassword, type PasswordState } from "@/app/etudiant/profil/actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {
    error: null,
    success: false,
  });

  return (
    // key : les champs se vident après un changement réussi
    <form action={action} className="flex flex-col gap-4" key={state.success ? "ok" : "form"}>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">Votre mot de passe a été modifié.</Notice>}
      <PasswordField label="Mot de passe actuel" name="current" autoComplete="current-password" />
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField label="Nouveau mot de passe" name="password" autoComplete="new-password" minLength={8} placeholder="8 caractères minimum" />
        <PasswordField label="Confirmer" name="confirm" autoComplete="new-password" minLength={8} />
      </div>
      <button type="submit" className="btnA self-start" disabled={pending}>
        {pending ? "Enregistrement…" : "Changer mon mot de passe"}
      </button>
    </form>
  );
}
