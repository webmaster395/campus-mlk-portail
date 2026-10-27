import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import FormSubmitButton from "@/components/ui/FormSubmitButton";
import { confirmEmail } from "./actions";

export const metadata: Metadata = { title: "Confirmer mon adresse" };

type SearchParams = PageProps<"/auth/confirm">["searchParams"];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Arrivée des liens de confirmation d'adresse : …/auth/confirm?token_hash={{ .TokenHash }}&type=email
 * (ou email_change). Les liens d'invitation et de réinitialisation sont renvoyés vers
 * /auth/reinitialiser, où l'on choisit son mot de passe.
 */
export default function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  return (
    <AuthShell>
      <Suspense fallback={<div className="h-[220px]" />}>
        <ConfirmContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function ConfirmContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tokenHash = first(params.token_hash);
  const type = first(params.type) ?? "email";

  if (tokenHash && (type === "invite" || type === "recovery")) {
    redirect(`/auth/reinitialiser?token_hash=${encodeURIComponent(tokenHash)}&type=${type}`);
  }

  return (
    <>
      <p className="eyebrow m-0">Espace apprentis</p>
      <h1 className="nr mt-3 mb-2 text-[36px] leading-tight">Confirmer mon adresse</h1>
      {tokenHash ? (
        <>
          <p className="mt-0 mb-8 text-[15px] leading-relaxed text-texte">
            Une dernière étape : confirmez votre adresse e-mail pour accéder à votre portail.
          </p>
          <form action={confirmEmail} className="flex flex-col">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <FormSubmitButton pendingLabel="Confirmation…">
              Confirmer mon adresse <span className="ar" aria-hidden>→</span>
            </FormSubmitButton>
          </form>
        </>
      ) : (
        <p className="mt-0 text-[15px] leading-relaxed text-texte">
          Ce lien est incomplet. Ouvrez-le depuis l&apos;e-mail reçu, ou{" "}
          <Link href="/login" className="font-semibold underline decoration-iris/50 underline-offset-4">
            connectez-vous
          </Link>
          .
        </p>
      )}
    </>
  );
}
