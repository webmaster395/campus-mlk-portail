import type { Metadata } from "next";
import Link from "next/link";
import Logotype from "@/components/brand/Logotype";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-porcelaine px-5 py-16 text-center">
      <Logotype height={44} />
      <p className="eyebrow mt-12 mb-0">Erreur 404</p>
      <h1 className="nr mt-3 mb-0 text-[40px] leading-tight sm:text-[52px]">Page introuvable</h1>
      <p className="mt-4 mb-0 max-w-[44ch] text-[15.5px] leading-relaxed text-texte">
        Cette adresse ne mène nulle part. Le lien est peut-être incomplet, ou la page a été
        déplacée.
      </p>
      <Link href="/etudiant" className="btnA mt-8">
        Retour au portail <span className="ar" aria-hidden>→</span>
      </Link>
    </main>
  );
}
