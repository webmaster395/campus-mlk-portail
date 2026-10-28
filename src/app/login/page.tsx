import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { SUPPORT_EMAIL } from "@/lib/auth-messages";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthShell photo={{ src: "/images/auth-connexion.jpg", position: "68% 30%" }}>
      <p className="eyebrow m-0">Espace apprentis</p>
      <h1 className="nr mt-2 mb-1.5 text-[34px] leading-tight">Se connecter</h1>
      <p className="mt-0 mb-5 text-[15px] leading-relaxed text-texte">
        Retrouvez votre calendrier, vos cours et votre travail à rendre.
      </p>

      {/* Le formulaire lit l'adresse (?erreur=…) : rendu à la requête, sous Suspense */}
      <Suspense fallback={<div className="h-[250px]" />}>
        <LoginForm />
      </Suspense>

      <div className="mt-6 flex flex-col gap-3 border-t border-black/10 pt-6">
        <p className="m-0 text-[15px] font-semibold">Pas encore de compte&nbsp;?</p>
        <Link href="/inscription" className="btnO justify-center">
          Créer mon compte
        </Link>
      </div>

      <p className="mt-5 mb-0 text-sm text-texte-doux">
        Besoin d&apos;aide&nbsp;?{" "}
        <a className="font-semibold text-graphite underline decoration-iris/50 underline-offset-4 hover:text-iris" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
      </p>
    </AuthShell>
  );
}
