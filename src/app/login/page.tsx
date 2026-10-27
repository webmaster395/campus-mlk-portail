import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { SUPPORT_EMAIL } from "@/lib/auth-messages";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthShell>
      <p className="eyebrow m-0">Espace apprentis</p>
      <h1 className="nr mt-3 mb-2 text-[36px] leading-tight">Se connecter</h1>
      <p className="mt-0 mb-8 text-[15px] leading-relaxed text-texte">
        Utilisez l&apos;adresse e-mail à laquelle MLK Campus vous a invité.
      </p>

      {/* Le formulaire lit l'adresse (?erreur=…) : rendu à la requête, sous Suspense */}
      <Suspense fallback={<div className="h-[290px]" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-10 mb-0 text-sm text-texte-doux">
        Pas encore de compte ou besoin d&apos;aide&nbsp;?{" "}
        <a className="font-semibold text-graphite underline decoration-iris/50 underline-offset-4 hover:text-iris" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
      </p>
    </AuthShell>
  );
}
