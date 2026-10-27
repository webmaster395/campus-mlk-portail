import { redirect } from "next/navigation";
import { Suspense } from "react";
import AppHeader from "@/components/shell/AppHeader";
import MobileNav from "@/components/shell/MobileNav";
import ProfileBlock from "@/components/shell/ProfileBlock";
import Sidebar from "@/components/shell/Sidebar";
import { getViewer } from "@/lib/data/viewer";

/*
  Coquille de l'espace étudiant : sidebar graphite (ordinateur), en-tête et tiroir (téléphone).
  Garde : le proxy a déjà renvoyé vers /login les visiteurs sans session ; ici on vérifie le
  profil (compte désactivé, profil absent). Cache Components : la session est lue sous
  <Suspense>, et chaque page a en plus son loading.tsx.
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

  const unread = viewer.unreadAnnouncements;
  const footer = (
    <ProfileBlock
      fullName={viewer.fullName}
      subtitle={viewer.promotion?.label ?? "En attente de promotion"}
      avatarUrl={viewer.avatarUrl}
    />
  );

  return (
    <div className="min-h-screen bg-porcelaine md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      <a
        href="#contenu"
        className="sr-only z-[60] rounded-full bg-graphite px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <Sidebar unread={unread} footer={footer} />
      <div className="flex min-h-screen min-w-0 flex-col">
        <AppHeader
          promotionLabel={viewer.promotion?.label ?? null}
          unread={unread}
          mobileNav={<MobileNav unread={unread} footer={footer} />}
        />
        <main id="contenu" tabIndex={-1} className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-6 outline-none sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Même structure que la coquille, sans données : pas de saut de mise en page au chargement. */
function ShellFallback() {
  return (
    <div className="min-h-screen bg-porcelaine md:grid md:grid-cols-[264px_minmax(0,1fr)]" aria-busy="true">
      <div className="hidden h-screen bg-graphite md:block" />
      <div className="h-16 border-b border-black/[0.08]" />
    </div>
  );
}
