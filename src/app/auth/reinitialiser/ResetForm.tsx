"use client";

import { useActionState } from "react";
import PasswordField from "@/components/auth/PasswordField";
import Notice from "@/components/ui/Notice";
import { setPassword, type ResetState } from "./actions";

export default function ResetForm({
  tokenHash,
  type,
  initialError,
}: {
  tokenHash: string | null;
  type: "invite" | "recovery";
  initialError: string | null;
}) {
  const [state, action, pending] = useActionState<ResetState, FormData>(setPassword, {
    error: initialError,
  });

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {tokenHash && <input type="hidden" name="token_hash" value={tokenHash} />}
      <input type="hidden" name="type" value={type} />

      <PasswordField
        label={type === "invite" ? "Votre mot de passe" : "Nouveau mot de passe"}
        name="password"
        autoComplete="new-password"
        minLength={8}
        placeholder="8 caractères minimum"
      />
      <PasswordField
        label="Confirmer le mot de passe"
        name="confirm"
        autoComplete="new-password"
        minLength={8}
        placeholder="••••••••"
      />

      <button type="submit" className="btnA justify-center" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer et accéder au portail"}{" "}
        <span className="ar" aria-hidden>→</span>
      </button>
    </form>
  );
}
