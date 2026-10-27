import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    .select("id, title, kind, starts_at, ends_at, room, trainer_name, course:courses(title)")
    .gte("ends_at", now.toISOString())
    .order("starts_at")
    .limit(12);
  if (error) throw new Error(`Chargement des séances impossible : ${error.message}`);

  const sessions = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    kind: row.kind,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    room: row.room,
    trainerName: row.trainer_name,
    courseTitle: row.course?.title ?? null,
  }));
  if (!sessions.length) return [];
  const day = parisDayKey(sessions[0].startsAt);
  return sessions.filter((session) => parisDayKey(session.startsAt) === day);
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
