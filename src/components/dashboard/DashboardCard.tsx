import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Cadre d'une carte du tableau de bord : icône, titre, pastille facultative et lien « Tout voir ». */
export default function DashboardCard({
  icon: Icon,
  title,
  badge,
  href,
  linkLabel = "Tout voir",
  footer,
  className = "",
  children,
}: {
  icon: LucideIcon;
  title: string;
  badge?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`card flex flex-col p-5 sm:p-6 ${className}`}>
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-porcelaine text-graphite">
          <Icon size={19} strokeWidth={1.8} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h2 className="nr m-0 truncate text-[19px] leading-tight text-graphite">{title}</h2>
          {badge}
        </div>
        {href && (
          <Link href={href} className="navl shrink-0 text-[13px]">
            {linkLabel}
          </Link>
        )}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      {footer && <footer className="mt-4 border-t border-black/[0.07] pt-3.5">{footer}</footer>}
    </section>
  );
}

/** Texte d'une carte sans contenu. */
export function CardEmpty({ children }: { children: React.ReactNode }) {
  return <p className="my-auto py-4 text-[14.5px] leading-relaxed text-texte-doux">{children}</p>;
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
