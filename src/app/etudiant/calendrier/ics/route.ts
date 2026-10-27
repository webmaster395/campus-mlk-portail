import { getAllSessions, getCompanyPeriods } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";
import { buildIcs, type IcsEvent } from "@/lib/ics";

/**
 * Téléchargement du calendrier de la personne connectée (.ics), à importer dans Google
 * Agenda, Outlook ou Apple Calendrier : séances au campus et périodes en entreprise.
 * Ponctuel : pour suivre les changements, il faut le télécharger à nouveau.
 */
export async function GET() {
  const viewer = await getViewer();
  if (!viewer || viewer.deactivated) return new Response("Non autorisé", { status: 401 });

  const [sessions, periods] = await Promise.all([getAllSessions(), getCompanyPeriods()]);

  const events: IcsEvent[] = [
    ...sessions.map((session) => ({
      uid: `seance-${session.id}@portail.mlkcampus`,
      title: session.kind === "evaluation" ? `Évaluation · ${session.title}` : session.title,
      start: session.startsAt,
      end: session.endsAt,
      location: session.room ? `MLK Campus, ${session.room}` : "MLK Campus",
      description: [session.courseTitle, session.trainerName && `Formateur : ${session.trainerName}`]
        .filter(Boolean)
        .join("\n"),
    })),
    ...periods.map((period) => ({
      uid: `entreprise-${period.id}@portail.mlkcampus`,
      title: viewer.companyName ? `En entreprise · ${viewer.companyName}` : "En entreprise",
      allDay: true as const,
      startsOn: period.startsOn,
      endsOn: period.endsOn,
      description: period.note,
    })),
  ];

  const ics = buildIcs({
    name: viewer.promotion ? `MLK Campus · ${viewer.promotion.label}` : "MLK Campus",
    events,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mlk-campus-calendrier.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
