"use client";

import { useActionState } from "react";
import Link from "next/link";
import PasswordField from "@/components/auth/PasswordField";
import Notice from "@/components/ui/Notice";
import { signUp, type SignUpState } from "./actions";

const INITIAL: SignUpState = {
  error: null,
  sentTo: null,
  values: { gender: "", firstName: "", lastName: "", email: "" },
};

export default function SignupForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, INITIAL);

  if (state.sentTo) {
    return (
      <div className="flex flex-col gap-5">
        <Notice tone="success">
          Un e-mail de confirmation vient de partir à <strong>{state.sentTo}</strong>. Ouvrez le
          lien qu&apos;il contient pour activer votre compte.
        </Notice>
        <p className="m-0 text-[15px] leading-relaxed text-texte">
          Pensez à regarder dans vos courriers indésirables. Une fois votre compte activé,
          l&apos;équipe de MLK Campus le rattache à votre promotion.
        </p>
        <Link href="/login" className="btnO justify-center">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  // key : les champs reprennent les valeurs saisies après une erreur
  const key = `${state.values.email}|${state.error}`;
  return (
    <form action={action} className="flex flex-col gap-3.5" key={key}>
      {state.error && <Notice tone="error">{state.error}</Notice>}

      <fieldset className="m-0 border-0 p-0">
        <legend className="lbl">Civilité</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["madame", "Madame"],
            ["monsieur", "Monsieur"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 rounded-[11px] border border-black/[0.18] bg-white px-4 py-2.5 text-[14px] font-medium has-[:checked]:border-iris has-[:checked]:bg-lilas-pale has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-iris"
            >
              <input
                type="radio"
                name="gender"
                value={value}
                required
                defaultChecked={state.values.gender === value}
                className="chk !h-4 !w-4"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <label className="lbl" htmlFor="first_name">
            Prénom
          </label>
          <input
            id="first_name"
            className="fld"
            name="first_name"
            required
            maxLength={80}
            autoComplete="given-name"
            defaultValue={state.values.firstName}
          />
        </div>
        <div>
          <label className="lbl" htmlFor="last_name">
            Nom
          </label>
          <input
            id="last_name"
            className="fld"
            name="last_name"
            required
            maxLength={80}
            autoComplete="family-name"
            defaultValue={state.values.lastName}
          />
        </div>
      </div>

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
          defaultValue={state.values.email}
        />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <PasswordField
          label="Mot de passe"
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="8 caractères min."
        />
        <PasswordField
          label="Confirmer"
          name="confirm"
          autoComplete="new-password"
          minLength={8}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" className="btnA justify-center" disabled={pending}>
        {pending ? "Création du compte…" : "Créer mon compte"} <span className="ar" aria-hidden>→</span>
      </button>
    </form>
  );
}
