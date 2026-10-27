import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell tagline="Un oubli, ça arrive.">
      <Link href="/login" className="navl">
        <span aria-hidden>←</span> Retour à la connexion
      </Link>
      <h1 className="nr mt-6 mb-2 text-[36px] leading-tight">Mot de passe oublié</h1>
      <p className="mt-0 mb-8 text-[15px] leading-relaxed text-texte">
        Indiquez l&apos;adresse e-mail de votre compte : nous vous envoyons un lien pour choisir
        un nouveau mot de passe.
      </p>

      <Suspense fallback={<div className="h-[150px]" />}>
        <ForgotForm />
      </Suspense>
    </AuthShell>
  );
}
