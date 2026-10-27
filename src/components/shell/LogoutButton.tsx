import { LogOut } from "lucide-react";
import FormSubmitButton from "@/components/ui/FormSubmitButton";
import { signOut } from "@/lib/actions/auth";

/** Bouton de déconnexion (formulaire + action serveur : fonctionne même sans JavaScript). */
export default function LogoutButton({ className = "btnO" }: { className?: string }) {
  return (
    <form action={signOut}>
      <FormSubmitButton className={className} pendingLabel="Déconnexion…">
        <LogOut size={16} aria-hidden /> Se déconnecter
      </FormSubmitButton>
    </form>
  );
}
