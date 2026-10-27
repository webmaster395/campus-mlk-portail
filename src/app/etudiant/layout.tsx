import { redirect } from "next/navigation";
import { Suspense } from "react";
import Logomark from "@/components/brand/Logomark";
import LogoutButton from "@/components/shell/LogoutButton";
import { getViewer } from "@/lib/data/viewer";

/*
  Garde de l'espace étudiant. Le proxy a déjà renvoyé vers /login les visiteurs sans
  session ; ici on vérifie le profil (compte désactivé, profil absent).
  Cache Components : la lecture de la session se fait sous <Suspense>.
  La coquille complète (sidebar, navigation mobile) arrive à l'étape 3.
*/
export default function StudentLayout({ children }: LayoutProps<"/etudiant">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <StudentShell>{children}</StudentShell>
    </Suspense>
  );
}

async function StudentShell({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (viewer.deactivated) redirect("/auth/desactive");

  return (
    <div className="min-h-screen bg-porcelaine">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <span className="flex items-center gap-3">
            <Logomark size={28} />
            <span className="text-sm font-semibold">Portail MLK Campus</span>
          </span>
          <span className="flex items-center gap-4">
            <span className="hidden text-sm text-texte sm:inline">{viewer.fullName}</span>
            <LogoutButton className="btnO !px-4 !py-2.5 !text-[13.5px]" />
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 sm:py-12">{children}</main>
    </div>
  );
}

function ShellFallback() {
  return (
    <div className="min-h-screen bg-porcelaine" aria-busy="true">
      <div className="h-[69px] border-b border-black/10 bg-white" />
    </div>
  );
}
