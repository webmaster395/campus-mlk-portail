/** Titre de page (h1) avec sur-titre et introduction facultatifs. */
export default function PageHeader({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pg mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow m-0">{eyebrow}</p>}
        <h1 className="nr mt-2 mb-0 text-[34px] leading-[1.08] sm:text-[44px]">{title}</h1>
        {children && <p className="mt-3 mb-0 max-w-[62ch] text-[15.5px] leading-relaxed text-texte">{children}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
