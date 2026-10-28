import Link from "next/link";
import { Building2, Clock, MapPin } from "lucide-react";
import BrandStripe from "@/components/brand/BrandStripe";
import Logomark from "@/components/brand/Logomark";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import { getNextCampusDay } from "@/lib/data/student";
import { formatLongDay, formatTime, formatTimeRange, relativeDay } from "@/lib/format";
import { sessionKind } from "@/lib/pedagogy";

/** Palette d'accents issue de la charte Campus MLK pour rythmer les créneaux de la frise. */
const TIMELINE_PALETTE = [
  {
    ring: "border-iris text-iris",
    dot: "bg-iris",
    pill: "bg-lilas-pale text-iris border-iris/15",
  },
  {
    ring: "border-turquoise text-turquoise",
    dot: "bg-turquoise",
    pill: "bg-turquoise/15 text-[#1f6351] border-turquoise/25",
  },
  {
    ring: "border-safran text-safran",
    dot: "bg-safran",
    pill: "bg-safran/20 text-[#7a4b00] border-safran/35",
  },
  {
    ring: "border-lilas text-lilas",
    dot: "bg-lilas",
    pill: "bg-lilas/18 text-[#63329c] border-lilas/30",
  },
];

/** Carte principale : la prochaine journée au campus présentée en frise chronologique. */
export default async function NextDayCard({ now, className = "" }: { now: Date; className?: string }) {
  const sessions = await getNextCampusDay(now);
  const first = sessions[0];
  const last = sessions[sessions.length - 1];

  return (
    <section className={`card relative flex flex-col overflow-hidden ${className}`}>
      {/* Filet chromatique officiel Campus MLK en haut de la carte */}
      <BrandStripe height={4} />

      {/* Filigrane discret de l'astérisque Campus MLK */}
      <div className="pointer-events-none absolute -top-10 -right-10 opacity-[0.045]">
        <Logomark size={180} variant="iris" />
      </div>

      <div className="relative flex flex-1 flex-col p-5 sm:p-7">
        {/* En-tête : surtitre + pastille J-X */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow m-0 inline-flex items-center gap-2 text-iris">
              <Logomark size={11} variant="iris" />
              Prochaine journée au campus
            </p>
            <h2 className="nr mt-2 mb-0 text-[24px] leading-tight text-graphite sm:text-[28px]">
              Votre prochaine journée de formation
            </h2>
          </div>
          {first && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-graphite px-3.5 py-1.5 text-[12.5px] font-bold text-lime shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden />
              {relativeDay(first.startsAt, now)}
            </span>
          )}
        </header>

        {first && last ? (
          <>
            {/* Bandeau récapitulatif de la date, des horaires de la journée et du lieu */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-black/[0.06] bg-porcelaine/80 px-4 py-3 text-[13.5px]">
              <span className="font-bold text-graphite">{formatLongDay(first.startsAt)}</span>
              <span className="text-black/20" aria-hidden>
                ·
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-texte">
                <Clock size={14} className="text-iris" aria-hidden />
                {formatTime(first.startsAt)} – {formatTime(last.endsAt)}
              </span>
              <span className="text-black/20" aria-hidden>
                ·
              </span>
              <span className="inline-flex items-center gap-1.5 text-texte-doux">
                <Building2 size={14} aria-hidden />
                MLK Campus · Créteil
              </span>
            </div>

            {/* Frise chronologique des séances de la journée */}
            <ol className="m-0 mt-6 flex list-none flex-col p-0">
              {sessions.map((session, index) => {
                const kind = sessionKind(session.kind);
                const accent = TIMELINE_PALETTE[index % TIMELINE_PALETTE.length];
                const isLast = index === sessions.length - 1;
                const badgeLabel = session.competencyBlock || (kind ? kind.label : "Module de formation");

                return (
                  <li key={session.id} className="group relative flex gap-3 sm:gap-5">
                    {/* Colonne horaire à gauche */}
                    <div className="w-[88px] shrink-0 pt-1 text-right sm:w-[112px]">
                      <span className="text-[13px] font-bold tabular-nums text-graphite sm:text-[13.5px]">
                        {formatTimeRange(session.startsAt, session.endsAt)}
                      </span>
                    </div>

                    {/* Axe vertical et nœud coloré */}
                    <div className="relative flex flex-col items-center">
                      <span
                        className={`relative z-10 mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-white ${accent.ring}`}
                        aria-hidden
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                      </span>
                      {!isLast && (
                        <span className="my-1 w-[2px] flex-1 rounded-full bg-black/[0.08]" aria-hidden />
                      )}
                    </div>

                    {/* Contenu de la séance */}
                    <div className={`min-w-0 flex-1 ${isLast ? "pb-1" : "pb-5"}`}>
                      <div className="rounded-xl border border-black/[0.06] bg-porcelaine/45 p-3.5 transition-colors group-hover:border-iris/25 group-hover:bg-lilas-pale/25 sm:p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-[0.04em] uppercase ${accent.pill}`}
                          >
                            {badgeLabel}
                          </span>
                          {kind && <StatusBadge tone={kind.tone}>{kind.label}</StatusBadge>}
                        </div>

                        <h3 className="mt-2 mb-0 text-[16px] font-semibold leading-snug text-graphite">
                          {session.courseId ? (
                            <Link
                              href={`/etudiant/cours/${session.courseId}`}
                              className="transition-colors hover:text-iris"
                            >
                              {session.title}
                            </Link>
                          ) : (
                            session.title
                          )}
                        </h3>

                        {session.description && (
                          <p className="mt-1 mb-0 line-clamp-2 text-[13px] leading-relaxed text-texte-doux">
                            {session.description}
                          </p>
                        )}

                        {(session.trainerName || session.room) && (
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-texte-doux">
                            {session.trainerName && (
                              <span className="inline-flex items-center gap-2 font-medium text-graphite">
                                <Avatar name={session.trainerName} size={24} />
                                {session.trainerName}
                              </span>
                            )}
                            {session.room && (
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[12.5px] font-medium text-texte shadow-2xs">
                                <MapPin size={13} className="text-iris" aria-hidden />
                                {session.room}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        ) : (
          <p className="mt-4 mb-0 rounded-xl bg-porcelaine p-4 text-[14.5px] leading-relaxed text-texte-doux">
            Aucune séance n&apos;est prévue pour le moment. Votre calendrier se remplira dès que
            l&apos;équipe pédagogique aura planifié vos journées au campus.
          </p>
        )}

        <div className="mt-6 pt-1">
          <Link href="/etudiant/calendrier" className="btnA self-start !px-5 !py-2.5 !text-[13px]">
            Voir le programme de la journée <span className="ar" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
