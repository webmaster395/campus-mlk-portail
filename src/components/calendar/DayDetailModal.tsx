"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Briefcase, Clock, ExternalLink, MapPin, UserRound, X } from "lucide-react";
import { formatDayTitle } from "@/lib/calendar";
import type { CompanyPeriod, DashboardSession } from "@/lib/data/student";
import { formatTime, formatTimeRange } from "@/lib/format";
import { kindStyle } from "./kinds";

/** Fenêtre de détail d'une journée du calendrier (ouverte au clic sur un jour ou un cours). */
export default function DayDetailModal({
  day,
  sessions,
  company,
  companyName,
  onClose,
}: {
  day: string;
  sessions: DashboardSession[];
  company?: CompanyPeriod;
  companyName: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const first = sessions[0];
  const last = sessions[sessions.length - 1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-jour-titre"
    >
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-black/[0.07] pb-4">
          <div>
            <p className="m-0 text-[11.5px] font-bold tracking-[0.08em] text-texte-doux uppercase">
              {sessions.length > 0
                ? `Journée au campus · ${formatTime(first.startsAt)} – ${formatTime(last.endsAt)}`
                : company
                  ? "Journée en entreprise"
                  : "Journée sans cours"}
            </p>
            <h2 id="detail-jour-titre" className="nr mt-1 mb-0 text-[22px] leading-tight text-graphite">
              {formatDayTitle(day)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le détail"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-porcelaine text-graphite transition-colors hover:bg-black/[0.07]"
          >
            <X size={17} aria-hidden />
          </button>
        </header>

        <div className="mt-5 flex flex-col gap-3.5">
          {company && (
            <div className="rounded-xl border border-[#a8d922]/50 bg-lime/25 p-4 text-graphite">
              <div className="flex items-center gap-2 text-[14px] font-bold">
                <Briefcase size={16} aria-hidden />
                <span>Période en entreprise</span>
              </div>
              {companyName && (
                <p className="mt-1 mb-0 text-[13.5px] font-medium text-graphite/85">
                  Entreprise d&apos;accueil : {companyName}
                </p>
              )}
              {company.note && (
                <p className="mt-1.5 mb-0 text-[13px] leading-relaxed text-texte">{company.note}</p>
              )}
            </div>
          )}

          {sessions.map((session) => {
            const kind = kindStyle(session.kind);
            return (
              <article
                key={session.id}
                className={`rounded-xl border border-black/[0.07] border-l-4 bg-porcelaine/60 p-4 ${kind.bar}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-bold tabular-nums text-graphite">
                    <Clock size={14} className="text-iris" aria-hidden />
                    {formatTimeRange(session.startsAt, session.endsAt)}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-texte ring-1 ring-black/[0.08]">
                    {session.competencyBlock || kind.label}
                  </span>
                </div>

                <h3 className="mt-2 mb-0 text-[15.5px] font-semibold leading-snug text-graphite">
                  {session.title}
                </h3>

                {session.description && (
                  <p className="mt-1.5 mb-0 text-[13px] leading-relaxed text-texte-doux">
                    {session.description}
                  </p>
                )}

                {(session.room || session.trainerName) && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-black/[0.06] pt-2.5 text-[12.5px] text-texte">
                    {session.room && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13.5} className="text-iris" aria-hidden />
                        {session.room}
                      </span>
                    )}
                    {session.trainerName && (
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound size={13.5} className="text-texte-doux" aria-hidden />
                        {session.trainerName}
                      </span>
                    )}
                  </div>
                )}

                {session.courseId && (
                  <div className="mt-3">
                    <Link
                      href={`/etudiant/cours/${session.courseId}`}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-iris hover:underline"
                    >
                      Voir la fiche du cours <ExternalLink size={12.5} aria-hidden />
                    </Link>
                  </div>
                )}
              </article>
            );
          })}

          {!company && sessions.length === 0 && (
            <p className="m-0 py-4 text-center text-[14px] text-texte-doux">
              Aucune séance ni période en entreprise prévue ce jour-là.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
