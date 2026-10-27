/** Pastille de statut (devoir rendu, en retard, bientôt dû…) aux couleurs de la charte. */
export type StatusTone = "success" | "danger" | "warning" | "info" | "neutral";

const TONES: Record<StatusTone, string> = {
  success: "bg-succes/15 text-[#1d6b55]",
  danger: "bg-alerte/12 text-[#a3203f]",
  warning: "bg-attente/20 text-[#7a5600]",
  info: "bg-lilas-pale text-[#6a3fb0]",
  neutral: "bg-black/[0.06] text-texte",
};

export default function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}
