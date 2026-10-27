"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Notice from "@/components/ui/Notice";
import { requestPasswordReset, type ResetRequestState } from "./actions";

export default function ForgotForm() {
  const searchParams = useSearchParams();
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(
    requestPasswordReset,
    {
      error:
        searchParams.get("erreur") === "lien_expire"
          ? "Ce lien a expiré ou a déjà servi. Demandez-en un nouveau ci-dessous."
          : null,
      sentTo: null,
    },
  );

  if (state.sentTo) {
    return (
      <div className="flex flex-col gap-5">
        <Notice tone="success">
          Si un compte existe pour <strong>{state.sentTo}</strong>, un e-mail vient de partir avec
          un lien pour choisir un nouveau mot de passe.
        </Notice>
        <p className="m-0 text-[15px] leading-relaxed text-texte">
          Pensez à regarder dans vos courriers indésirables. Le lien ne sert qu&apos;une fois et
          expire rapidement.
        </p>
        <Link href="/login" className="btnO justify-center">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && <Notice tone="error">{state.error}</Notice>}

      <div>
        <label className="lbl" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          className="fld"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="prenom.nom@exemple.fr"
        />
      </div>

      <button type="submit" className="btnA justify-center" disabled={pending}>
        {pending ? "Envoi…" : "Recevoir le lien"} <span className="ar" aria-hidden>→</span>
      </button>
    </form>
  );
}
