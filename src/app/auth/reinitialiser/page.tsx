import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/server";
import ResetForm from "./ResetForm";

export const metadata: Metadata = { title: "Choisir un mot de passe" };

type SearchParams = PageProps<"/auth/reinitialiser">["searchParams"];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Arrivée des liens d'invitation (premier mot de passe) et de réinitialisation.
 * Modèles d'e-mail Supabase : …/auth/reinitialiser?token_hash={{ .TokenHash }}&type=invite
 * (ou type=recovery). Sans jeton, une session ouverte par /auth/callback suffit.
 */
export default function ResetPasswordPage({ searchParams }: PageProps<"/auth/reinitialiser">) {
  return (
    <AuthShell tagline="Bienvenue chez MLK Campus.">
      <Suspense fallback={<div className="h-[380px]" />}>
        <ResetContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function ResetContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tokenHash = first(params.token_hash) ?? null;
  const type = first(params.type) === "invite" ? "invite" : "recovery";
  const erreur = first(params.erreur) ?? null;

  let canReset = !!tokenHash;
  if (!canReset) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    canReset = !!data?.claims?.sub;
  }

  if (!canReset) {
    return (
      <>
        <h1 className="nr mt-0 mb-2 text-[36px] leading-tight">Lien expiré</h1>
        <p className="mt-0 mb-8 text-[15px] leading-relaxed text-texte">
          Ce lien est incomplet ou a déjà servi. Demandez un nouveau lien pour choisir votre mot
          de passe.
        </p>
        <Link href="/mot-de-passe-oublie" className="btnA justify-center">
          Demander un nouveau lien <span className="ar" aria-hidden>→</span>
        </Link>
      </>
    );
  }

  return (
    <>
      <p className="eyebrow m-0">{type === "invite" ? "Activation du compte" : "Espace apprentis"}</p>
      <h1 className="nr mt-3 mb-2 text-[36px] leading-tight">
        {type === "invite" ? "Choisissez votre mot de passe" : "Nouveau mot de passe"}
      </h1>
      <p className="mt-0 mb-8 text-[15px] leading-relaxed text-texte">
        {type === "invite"
          ? "Dernière étape avant d'accéder à votre portail : choisissez le mot de passe de votre compte."
          : "Choisissez votre nouveau mot de passe. Vous accéderez ensuite directement à votre portail."}
      </p>
      <ResetForm tokenHash={tokenHash} type={type} initialError={erreur} />
    </>
  );
}
