import type { Metadata } from "next";
import Link from "next/link";
import { CheckCheck, Megaphone } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import FormSubmitButton from "@/components/ui/FormSubmitButton";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { getLatestAnnouncements } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";
import { formatLongDay, formatTime, relativeDay } from "@/lib/format";
import { markAnnouncementsRead } from "./actions";

export const metadata: Metadata = { title: "Messages" };

/** Les annonces du CFA et de la promotion, les plus récentes d'abord. */
export default async function MessagesPage() {
  const viewer = await getViewer();
  if (!viewer) return null;

  const now = new Date();
  const announcements = await getLatestAnnouncements(100);
  const seenAt = new Date(viewer.announcementsSeenAt);
  const unread = announcements.filter((announcement) => new Date(announcement.createdAt) > seenAt).length;

  return (
    <>
      <PageHeader
        eyebrow={viewer.promotion?.label ?? "Espace apprentis"}
        title="Messages"
        actions={
          unread > 0 && (
            <form action={markAnnouncementsRead}>
              <FormSubmitButton className="btnO !px-5 !py-3 text-[13.5px]" pendingLabel="Un instant…">
                <CheckCheck size={16} aria-hidden /> Tout marquer comme lu
              </FormSubmitButton>
            </form>
          )
        }
      >
        Les annonces de l&apos;équipe de MLK Campus et de vos formateurs.
        {unread > 0 && ` ${unread} nouvelle${unread > 1 ? "s" : ""}.`}
      </PageHeader>

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="Aucune annonce pour le moment">
          Les messages de l&apos;équipe pédagogique apparaîtront ici.
        </EmptyState>
      ) : (
        <ol className="pg2 m-0 flex list-none flex-col gap-4 p-0">
          {announcements.map((announcement) => {
            const isNew = new Date(announcement.createdAt) > seenAt;
            return (
              <li key={announcement.id}>
                <article className={`card p-5 sm:p-6 ${isNew ? "!border-iris/50 shadow-[0_0_0_3px_rgba(141,124,255,0.12)]" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-texte-doux">
                    {isNew && <StatusBadge tone="info">Nouveau</StatusBadge>}
                    <StatusBadge tone="neutral">{announcement.forPromotion ? "Votre promotion" : "Tout le CFA"}</StatusBadge>
                    <span>
                      {announcement.authorName} ·{" "}
                      <time dateTime={announcement.createdAt} title={`${formatLongDay(announcement.createdAt)} à ${formatTime(announcement.createdAt)}`}>
                        {relativeDay(announcement.createdAt, now).toLowerCase()}
                      </time>
                    </span>
                  </div>
                  <h2 className="mt-3 mb-0 text-[18px] font-semibold">{announcement.title}</h2>
                  <p className="mt-2 mb-0 whitespace-pre-line text-[15px] leading-relaxed text-texte">{announcement.body}</p>
                  {announcement.targetUrl && announcement.ctaLabel && (
                    <Link href={announcement.targetUrl} className="btnO mt-5 !px-5 !py-3 text-[13.5px]">
                      {announcement.ctaLabel} <span className="ar" aria-hidden>→</span>
                    </Link>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
