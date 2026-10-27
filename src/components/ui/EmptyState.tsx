import type { LucideIcon } from "lucide-react";

/** Carte d'état vide : rien à afficher pour l'instant, avec une explication. */
export default function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="card pg2 flex flex-col items-center px-6 py-12 text-center sm:py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lilas-pale text-iris">
        <Icon size={26} strokeWidth={1.6} aria-hidden />
      </span>
      <h2 className="mt-5 mb-0 text-lg font-semibold">{title}</h2>
      {children && (
        <p className="mt-2 mb-0 max-w-[46ch] text-[15px] leading-relaxed text-texte">{children}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
