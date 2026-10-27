import Link from "next/link";
import { Megaphone } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getLatestAnnouncements } from "@/lib/data/student";
import { relativeDay } from "@/lib/format";
import DashboardCard, { CardEmpty } from "./DashboardCard";

/** La dernière annonce, signalée « Nouveau » si elle n'a pas encore été lue. */
export default async function AnnouncementCard({
  now,
  seenAt,
  className = "",
}: {
  now: Date;
  seenAt: string;
  className?: string;
}) {
  const [latest] = await getLatestAnnouncements(1);

  return (
    <DashboardCard icon={Megaphone} title="Dernière annonce" href="/etudiant/messages" className={className}>
      {!latest ? (
        <CardEmpty>Aucune annonce pour le moment.</CardEmpty>
      ) : (
        <article className="flex flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {new Date(latest.createdAt) > new Date(seenAt) && <StatusBadge tone="info">Nouveau</StatusBadge>}
            <span className="text-[13px] text-texte-doux">
              {latest.authorName} · {relativeDay(latest.createdAt, now).toLowerCase()}
            </span>
          </div>
          <h3 className="mt-2 mb-0 text-[17px] font-semibold">{latest.title}</h3>
          <p className="mt-2 mb-0 line-clamp-3 text-[15px] leading-relaxed text-texte">{latest.body}</p>
          {latest.targetUrl && latest.ctaLabel && (
            <Link href={latest.targetUrl} className="btnO mt-5 self-start !px-5 !py-3 text-[13.5px]">
              {latest.ctaLabel} <span className="ar" aria-hidden>→</span>
            </Link>
          )}
        </article>
      )}
    </DashboardCard>
  );
}
