import Link from "next/link";
import { LogOut } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import FormSubmitButton from "@/components/ui/FormSubmitButton";
import { signOut } from "@/lib/actions/auth";
import { getFormationTheme } from "@/lib/formations";

/**
 * Bas du menu : profil de l'étudiant et bouton de déconnexion d'origine.
 * - Ordinateur déplié : avatar, nom/prénom, formation avec pastille de filière et bouton de déconnexion.
 * - Ordinateur replié : avatar seul, centré.
 * - Téléphone : avatar, nom et bouton de déconnexion.
 */
export default function ProfileBlock({
  fullName,
  subtitle,
  avatarUrl,
  formationTitle,
}: {
  fullName: string;
  subtitle: string;
  avatarUrl: string | null;
  formationTitle?: string | null;
  showLogout?: boolean;
}) {
  const theme = formationTitle ? getFormationTheme(formationTitle) : null;

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/etudiant/profil"
        title={fullName}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-2 transition-colors group-data-[collapsed=true]/sidebar:justify-center hover:bg-black/[0.04]"
      >
        <Avatar name={fullName} size={36} src={avatarUrl} color={theme?.deep} />
        <span className="min-w-0 group-data-[collapsed=true]/sidebar:sr-only">
          <span className="block truncate text-sm font-semibold text-graphite">{fullName}</span>
          {theme ? (
            <span className="flex items-center gap-1.5 truncate text-xs text-texte-doux">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: theme.color }}
                aria-hidden
              />
              <span className="truncate">{theme.name}</span>
            </span>
          ) : (
            <span className="block truncate text-xs text-texte-doux">{subtitle}</span>
          )}
        </span>
      </Link>
      <form action={signOut} className="group-data-[collapsed=true]/sidebar:hidden">
        <FormSubmitButton
          pendingLabel="…"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-texte-doux transition-colors hover:bg-black/[0.05] hover:text-graphite"
        >
          <LogOut size={18} aria-hidden />
          <span className="sr-only">Se déconnecter</span>
        </FormSubmitButton>
      </form>
    </div>
  );
}
