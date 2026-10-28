"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PasswordField from "@/components/auth/PasswordField";
import Notice from "@/components/ui/Notice";
import { LOGIN_NOTICES } from "@/lib/auth-messages";
import { signIn, type SignInState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {
    error: null,
    email: "",
  });
  const searchParams = useSearchParams();
  const notice = LOGIN_NOTICES[searchParams.get("erreur") ?? searchParams.get("info") ?? ""];

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error ? (
        <Notice tone="error">{state.error}</Notice>
      ) : (
        notice && <Notice tone={notice.tone}>{notice.text}</Notice>
      )}

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
          defaultValue={state.email}
          key={state.email}
        />
      </div>

      <PasswordField
        label="Mot de passe"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
      />

      <div className="-mt-1 flex justify-end">
        <Link href="/mot-de-passe-oublie" className="navl">
          Mot de passe oublié&nbsp;?
        </Link>
      </div>

      <button type="submit" className="btnA justify-center" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"} <span className="ar" aria-hidden>→</span>
      </button>
    </form>
  );
}
