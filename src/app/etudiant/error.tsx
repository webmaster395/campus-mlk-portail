"use client";

import { RefreshCw } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/auth-messages";

/** Erreur inattendue dans une page de l'espace : la coquille reste, on propose de réessayer. */
export default function StudentError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="card pg flex flex-col items-center px-6 py-12 text-center sm:py-16" role="alert">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-alerte/10 text-[#a3203f]">
        <RefreshCw size={24} strokeWidth={1.7} aria-hidden />
      </span>
      <h1 className="nr mt-5 mb-0 text-[28px]">Un souci est survenu</h1>
      <p className="mt-2 mb-0 max-w-[46ch] text-[15px] leading-relaxed text-texte">
        Cette page n&apos;a pas pu se charger. Réessayez dans un instant ; si le problème
        continue, écrivez à {SUPPORT_EMAIL}
        {error.digest ? ` en indiquant le code ${error.digest}` : ""}.
      </p>
      <button type="button" className="btnA mt-7" onClick={() => retry()}>
        Réessayer
      </button>
    </div>
  );
}
