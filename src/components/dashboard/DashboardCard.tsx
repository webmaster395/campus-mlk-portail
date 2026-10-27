import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Cadre d'une carte du tableau de bord : icône, titre, lien « Tout voir ». */
export default function DashboardCard({
  icon: Icon,
  title,
  href,
  linkLabel = "Tout voir",
  className = "",
  children,
}: {
  icon: LucideIcon;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`card flex flex-col p-5 sm:p-6 ${className}`}>
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lilas-pale text-iris">
          <Icon size={18} strokeWidth={1.8} aria-hidden />
        </span>
        <h2 className="m-0 flex-1 text-[16px] font-semibold">{title}</h2>
        {href && (
          <Link href={href} className="navl text-[13px]">
            {linkLabel}
          </Link>
        )}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

/** Texte d'une carte sans contenu. */
export function CardEmpty({ children }: { children: React.ReactNode }) {
  return <p className="my-auto py-4 text-[15px] leading-relaxed text-texte-doux">{children}</p>;
}

/** Squelette d'une carte pendant le chargement de ses données. */
export function CardSkeleton({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div
      aria-busy="true"
      aria-label="Chargement"
      className={`min-h-[220px] animate-pulse rounded-2xl ${dark ? "bg-graphite" : "bg-black/[0.06]"} ${className}`}
    />
  );
}
