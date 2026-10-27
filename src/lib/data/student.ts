import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, isWithin } from "@/lib/calendar";
import { parisDayKey } from "@/lib/format";
import { assignmentStatus, compareTodo, type AssignmentStatus } from "@/lib/pedagogy";

// Lectures de l'espace étudiant. Toutes passent par le client de la personne connectée :
// la RLS limite déjà les résultats à sa promotion, rien n'est filtré « à la main » ici.

async function studentClient() {
  // Rendu à la requête (Cache Components) : voir lib/data/viewer.ts
  await connection();
  return createClient();
}

export type DashboardSession = {
  id: string;
  title: string;
  kind: string;
  startsAt: string;
  endsAt: string;
  room: string | null;
  trainerName: string | null;
  courseTitle: string | null;
};

/** Les séances de la prochaine journée au campus (aujourd'hui si une séance n'est pas finie). */
export async function getNextCampusDay(now: Date): Promise<DashboardSession[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_FIELDS)
    .gte("ends_at", now.toISOString())
    .order("starts_at")
    .limit(12);
  if (error) throw new Error(`Chargement des séances impossible : ${error.message}`);

  const sessions = (data ?? []).map(toSession);
  if (!sessions.length) return [];
  const day = parisDayKey(sessions[0].startsAt);
  return sessions.filter((session) => parisDayKey(session.startsAt) === day);
}

const SESSION_FIELDS = "id, title, kind, starts_at, ends_at, room, trainer_name, course:courses(title)";

type SessionRow = {
  id: string;
  title: string;
  kind: string;
  starts_at: string;
  ends_at: string;
  room: string | null;
  trainer_name: string | null;
  course: { title: string } | null;
};

function toSession(row: SessionRow): DashboardSession {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    room: row.room,
    trainerName: row.trainer_name,
    courseTitle: row.course?.title ?? null,
  };
}

/**
 * Les séances des jours [fromKey, toKey] (jours à Paris, bornes incluses). La requête prend
 * une marge d'un jour de chaque côté en UTC, puis on garde les séances dont le jour à Paris
 * tombe dans la plage : aucun calcul de fuseau dans la requête.
 */
export async function getSessionsBetween(fromKey: string, toKey: string): Promise<DashboardSession[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_FIELDS)
    .gte("starts_at", `${addDays(fromKey, -1)}T00:00:00Z`)
    .lt("starts_at", `${addDays(toKey, 2)}T00:00:00Z`)
    .order("starts_at");
  if (error) throw new Error(`Chargement du calendrier impossible : ${error.message}`);
  return (data ?? [])
    .map(toSession)
    .filter((session) => isWithin(parisDayKey(session.startsAt), fromKey, toKey));
}

/** Toutes les séances de la promotion (export .ics). */
export async function getAllSessions(): Promise<DashboardSession[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase.from("sessions").select(SESSION_FIELDS).order("starts_at");
  if (error) throw new Error(`Chargement des séances impossible : ${error.message}`);
  return (data ?? []).map(toSession);
}

export type CompanyPeriod = { id: string; startsOn: string; endsOn: string; note: string | null };

/** Les périodes en entreprise qui touchent les jours [fromKey, toKey] (toutes si sans bornes). */
export async function getCompanyPeriods(fromKey?: string, toKey?: string): Promise<CompanyPeriod[]> {
  const supabase = await studentClient();
  let query = supabase.from("company_periods").select("id, starts_on, ends_on, note").order("starts_on");
  if (fromKey && toKey) query = query.lte("starts_on", toKey).gte("ends_on", fromKey);
  const { data, error } = await query;
  if (error) throw new Error(`Chargement des périodes en entreprise impossible : ${error.message}`);
  return (data ?? []).map((row) => ({ id: row.id, startsOn: row.starts_on, endsOn: row.ends_on, note: row.note }));
}

export type TodoAssignment = {
  id: string;
  title: string;
  dueAt: string;
  courseTitle: string | null;
  status: AssignmentStatus;
};

/** Le travail pas encore rendu : en retard d'abord, puis par échéance. */
export async function getTodoAssignments(now: Date): Promise<TodoAssignment[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("id, title, due_at, course:courses(title), submissions(submitted_at)")
    .order("due_at");
  if (error) throw new Error(`Chargement du travail à rendre impossible : ${error.message}`);

  return (data ?? [])
    .map((row) => ({
      id: row.id,
      title: row.title,
      dueAt: row.due_at,
      courseTitle: row.course?.title ?? null,
      // La RLS ne renvoie que le rendu de la personne connectée
      status: assignmentStatus(row.due_at, row.submissions[0]?.submitted_at ?? null, now),
    }))
    .filter((assignment) => assignment.status.key !== "submitted")
    .sort(compareTodo);
}

export type AnnouncementPreview = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  targetUrl: string | null;
  ctaLabel: string | null;
};

/** Les annonces les plus récentes (de la promotion et de tout le CFA). */
export async function getLatestAnnouncements(limit: number): Promise<AnnouncementPreview[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, author_name, created_at, target_url, cta_label")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Chargement des annonces impossible : ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    authorName: row.author_name,
    createdAt: row.created_at,
    targetUrl: row.target_url,
    ctaLabel: row.cta_label,
  }));
}

export type GradePreview = {
  id: string;
  score: number | null;
  result: string | null;
  evaluationTitle: string;
  maxScore: number;
  heldOn: string;
  courseTitle: string | null;
};

/** Les dernières notes publiées (la RLS masque celles des évaluations non publiées). */
export async function getLatestGrades(limit: number): Promise<GradePreview[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("grades")
    .select("id, score, result, created_at, evaluation:evaluations(title, held_on, max_score, course:courses(title))")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Chargement des notes impossible : ${error.message}`);

  return (data ?? []).flatMap((row) =>
    row.evaluation
      ? [
          {
            id: row.id,
            score: row.score,
            result: row.result,
            evaluationTitle: row.evaluation.title,
            maxScore: row.evaluation.max_score,
            heldOn: row.evaluation.held_on,
            courseTitle: row.evaluation.course?.title ?? null,
          },
        ]
      : [],
  );
}
