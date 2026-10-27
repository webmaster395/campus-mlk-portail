"use client";

import { useFormStatus } from "react-dom";

/**
 * Bouton d'envoi bloqué pendant l'envoi : un second clic renverrait par exemple un jeton
 * d'e-mail déjà consommé par le premier.
 */
export default function FormSubmitButton({
  children,
  pendingLabel,
  className = "btnA justify-center",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
