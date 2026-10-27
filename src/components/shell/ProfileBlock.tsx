import Link from "next/link";
import { LogOut } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import FormSubmitButton from "@/components/ui/FormSubmitButton";
import { signOut } from "@/lib/actions/auth";

/** Bas du menu : la personne connectée (lien vers son profil) et la déconnexion. */
export default function ProfileBlock({
  fullName,
  subtitle,
}: {
  fullName: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/etudiant/profil"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.06]"
      >
        <Avatar name={fullName} size={38} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{fullName}</span>
          <span className="block truncate text-xs text-white/55">{subtitle}</span>
        </span>
      </Link>
      <form action={signOut}>
        <FormSubmitButton
          pendingLabel="…"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut size={18} aria-hidden />
          <span className="sr-only">Se déconnecter</span>
        </FormSubmitButton>
      </form>
    </div>
  );
}
