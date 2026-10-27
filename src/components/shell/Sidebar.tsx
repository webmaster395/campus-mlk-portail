import Link from "next/link";
import Logotype from "@/components/brand/Logotype";
import NavLinks from "./NavLinks";

/** Menu latéral sur ordinateur : fond graphite, logotype blanc, accents lime. */
export default function Sidebar({
  unread,
  footer,
}: {
  unread: number;
  footer: React.ReactNode;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col bg-graphite md:flex">
      <div className="px-6 pt-7 pb-8">
        <Link href="/etudiant" aria-label="Accueil du portail" className="inline-block">
          <Logotype variant="blanc" height={36} priority />
        </Link>
      </div>
      <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3 pb-6">
        <NavLinks unread={unread} />
      </nav>
      <div className="border-t border-white/10 px-3 py-3">{footer}</div>
    </aside>
  );
}
