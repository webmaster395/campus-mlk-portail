import Link from "next/link";
import { Bell, CheckCheck, ChevronRight, Megaphone } from "lucide-react";
import { markAnnouncementsRead } from "@/app/etudiant/messages/actions";
import StatusBadge from "@/components/ui/StatusBadge";
import { getLatestAnnouncements } from "@/lib/data/student";
import { relativeDay } from "@/lib/format";
import DashboardCard, { CardEmpty } from "./DashboardCard";

/** Carte Messages / Annonces : affiche les annonces récentes avec compteur non lu et action rapide. */
export default async function AnnouncementCard({
  now,
  seenAt,
  unreadCount = 0,
  className = "",
}: {
  now: Date;
  seenAt: string;
  unreadCount?: number;
  className?: string;
}) {
  const announcements = await getLatestAnnouncements(2);

  const badge =
    unreadCount > 0 ? (
      <span
        aria-label={`${unreadCount} non ${unreadCount > 1 ? "lus" : "lu"}`}
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-iris px-1.5 text-[11px] font-bold text-white"
      >
        {unreadCount}
      </span>
    ) : null;

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Link
        href="/etudiant/messages"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-graphite transition-colors hover:text-iris"
      >
        Voir tous les messages <span aria-hidden>→</span>
      </Link>
      {unreadCount > 0 && (
        <form action={markAnnouncementsRead}>
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-texte-doux transition-colors hover:text-iris"
          >
            <CheckCheck size={14} aria-hidden />
            Tout marquer comme lu
          </button>
        </form>
      )}
    </div>
  );

  return (
    <DashboardCard
      icon={Megaphone}
      title="Messages"
      badge={badge}
      href="/etudiant/messages"
      footer={footer}
      className={className}
    >
      {announcements.length === 0 ? (
        <CardEmpty>Aucun message pour le moment.</CardEmpty>
      ) : (
        <div className="flex flex-col divide-y divide-black/[0.07]">
          {announcements.map((item) => {
            const isNew = new Date(item.createdAt) > new Date(seenAt);
            const destination = item.targetUrl || "/etudiant/messages";

            return (
              <Link
                key={item.id}
                href={destination}
                className="group -mx-2 flex items-start gap-3 rounded-xl px-2 py-3 transition-colors first:pt-1 last:pb-1 hover:bg-porcelaine/80"
              >
                {/* Pastille icône inspirée de Ministry School avec point de nouveauté */}
                <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-graphite text-white">
                  <Bell size={16} aria-hidden />
                  {isNew && (
                    <span
                      className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-white"
                      aria-hidden
                    />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[14.5px] font-semibold leading-snug text-graphite transition-colors group-hover:text-iris">
                      {item.title}
                    </span>
                    {isNew && <StatusBadge tone="info">Nouveau</StatusBadge>}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-texte">
                    {item.body}
                  </span>
                  <span className="mt-1.5 block text-[12px] text-texte-doux">
                    {item.authorName} · {relativeDay(item.createdAt, now).toLowerCase()}
                  </span>
                </span>

                <ChevronRight
                  size={16}
                  aria-hidden
                  className="mt-1 shrink-0 text-texte-doux transition-transform group-hover:translate-x-0.5 group-hover:text-iris"
                />
              </Link>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
