import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "./SignupForm";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <AuthShell
      tagline="Bienvenue chez MLK Campus."
      photo={{ src: "/images/auth-inscription.jpg", position: "40% center" }}
    >
      <p className="eyebrow m-0">Espace apprentis</p>
      <h1 className="nr mt-2 mb-1.5 text-[34px] leading-tight">Créer un compte</h1>
      <p className="mt-0 mb-4 text-[14.5px] leading-relaxed text-texte">
        Apprenti de MLK Campus&nbsp;? Créez votre compte : l&apos;équipe du CFA le rattache
        ensuite à votre promotion.
      </p>

      <SignupForm />

      <p className="mt-4 mb-0 text-sm text-texte-doux">
        Déjà un compte&nbsp;?{" "}
        <Link className="font-semibold text-graphite underline decoration-iris/50 underline-offset-4 hover:text-iris" href="/login">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
