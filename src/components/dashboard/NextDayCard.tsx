import Link from "next/link";
import { MapPin, UserRound } from "lucide-react";
import { getNextCampusDay } from "@/lib/data/student";
import { formatLongDay, formatTimeRange, relativeDay } from "@/lib/format";
import { sessionKind } from "@/lib/pedagogy";

/** Carte graphite : la prochaine journée au campus et ses séances. */
export default async function NextDayCard({ now, className = "" }: { now: Date; className?: string }) {
  const sessions = await getNextCampusDay(now);
  const first = sessions[0];

  return (
    <section className={`relative flex flex-col overflow-hidden rounded-2xl bg-graphite p-5 text-white sm:p-7 ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow m-0 !text-lime">Prochaine journée au campus</p>
        {first && (
          <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-graphite">
            {relativeDay(first.startsAt, now)}
          </span>
        )}
      </header>

      {first ? (
        <>
          <h2 className="nr mt-3 mb-6 text-[30px] leading-tight sm:text-[34px]">{formatLongDay(first.startsAt)}</h2>
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {sessions.map((session) => {
              const kind = sessionKind(session.kind);
              return (
                <li
                  key={session.id}
                  className="flex flex-col gap-2 rounded-xl bg-white/[0.06] p-4 sm:flex-row sm:items-start sm:gap-5"
                >
                  <span className="shrink-0 text-[14px] font-bold tabular-nums text-lime sm:w-[118px] sm:pt-0.5">
                    {formatTimeRange(session.startsAt, session.endsAt)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15.5px] font-semibold">{session.title}</span>
                      {/* Sur fond graphite, pastille contour plutôt que les teintes claires */}
                      {kind && (
                        <span className="rounded-full border border-lime/60 px-2.5 py-0.5 text-xs font-semibold text-lime">
                          {kind.label}
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/65">
                      {session.room && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} aria-hidden /> {session.room}
                        </span>
                      )}
                      {session.trainerName && (
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound size={14} aria-hidden /> {session.trainerName}
                        </span>
                      )}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <p className="mt-4 mb-0 text-[15px] leading-relaxed text-white/70">
          Aucune séance n&apos;est prévue pour le moment. Votre calendrier se remplira dès que
          l&apos;équipe pédagogique aura planifié vos journées au campus.
        </p>
      )}

      <Link
        href="/etudiant/calendrier"
        className="gobtn mt-6 inline-flex items-center gap-2 self-start text-[14px] font-semibold text-white/85 transition-colors hover:text-lime"
      >
        Voir le calendrier <span className="ar" aria-hidden>→</span>
      </Link>
    </section>
  );
}
