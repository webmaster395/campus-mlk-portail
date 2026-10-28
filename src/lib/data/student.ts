import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, isWithin } from "@/lib/calendar";
import { parisDayKey } from "@/lib/format";
import { assignmentStatus, compareTodo, type AssignmentStatus } from "@/lib/pedagogy";
import { displayFileName } from "@/lib/validate";

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
  description: string;
  courseId: string | null;
  courseTitle: string | null;
  competencyBlock: string | null;
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

const SESSION_FIELDS =
  "id, title, kind, starts_at, ends_at, room, trainer_name, description, course:courses(id, title, competency_block)";

type SessionRow = {
  id: string;
  title: string;
  kind: string;
  starts_at: string;
  ends_at: string;
  room: string | null;
  trainer_name: string | null;
  description: string;
  course: { id: string; title: string; competency_block: string | null } | null;
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
    description: row.description,
    courseId: row.course?.id ?? null,
    courseTitle: row.course?.title ?? null,
    competencyBlock: row.course?.competency_block ?? null,
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

export type CourseSummary = {
  id: string;
  title: string;
  description: string;
  competencyBlock: string | null;
  sessionsTotal: number;
  sessionsDone: number;
  materialsCount: number;
  assignmentsCount: number;
  nextSessionAt: string | null;
};

/** Les modules de la formation, avec la progression des séances de la promotion. */
export async function getCourses(now: Date): Promise<CourseSummary[]> {
  const supabase = await studentClient();
  const [courses, sessions, materials, assignments] = await Promise.all([
    supabase.from("courses").select("id, title, description, competency_block, position").order("position"),
    supabase.from("sessions").select("course_id, starts_at, ends_at").not("course_id", "is", null),
    supabase.from("materials").select("course_id"),
    supabase.from("assignments").select("course_id"),
  ]);
  const error = courses.error ?? sessions.error ?? materials.error ?? assignments.error;
  if (error) throw new Error(`Chargement des cours impossible : ${error.message}`);

  const nowIso = now.toISOString();
  return (courses.data ?? []).map((course) => {
    const own = (sessions.data ?? []).filter((s) => s.course_id === course.id);
    const upcoming = own.filter((s) => s.ends_at >= nowIso).map((s) => s.starts_at).sort();
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      competencyBlock: course.competency_block,
      sessionsTotal: own.length,
      sessionsDone: own.length - upcoming.length,
      materialsCount: (materials.data ?? []).filter((m) => m.course_id === course.id).length,
      assignmentsCount: (assignments.data ?? []).filter((a) => a.course_id === course.id).length,
      nextSessionAt: upcoming[0] ?? null,
    };
  });
}

export type MaterialItem = {
  id: string;
  title: string;
  isFile: boolean;
  linkHost: string | null;
  courseId: string;
  courseTitle: string | null;
  createdAt: string;
};

function toMaterial(row: {
  id: string;
  title: string;
  file_path: string | null;
  link_url: string | null;
  course_id: string;
  created_at: string;
  course: { title: string } | null;
}): MaterialItem {
  let linkHost: string | null = null;
  if (row.link_url) {
    try {
      linkHost = new URL(row.link_url).hostname.replace(/^www\./, "");
    } catch {
      linkHost = null;
    }
  }
  return {
    id: row.id,
    title: row.title,
    isFile: !!row.file_path,
    linkHost,
    courseId: row.course_id,
    courseTitle: row.course?.title ?? null,
    createdAt: row.created_at,
  };
}

const MATERIAL_FIELDS = "id, title, file_path, link_url, course_id, created_at, course:courses(title)";

/** Les ressources visibles (la RLS masque celles programmées plus tard). */
export async function getMaterials(): Promise<MaterialItem[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase.from("materials").select(MATERIAL_FIELDS).order("created_at", { ascending: false });
  if (error) throw new Error(`Chargement des ressources impossible : ${error.message}`);
  return (data ?? []).map(toMaterial);
}

/**
 * Où mène une ressource : URL signée de 60 s pour un fichier du bucket « materials »,
 * lien externe (http ou https uniquement) sinon. Null si la ressource n'est pas visible.
 */
export async function getMaterialTarget(materialId: string): Promise<string | null> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("materials")
    .select("file_path, link_url")
    .eq("id", materialId)
    .maybeSingle();
  if (error || !data) return null;

  if (data.file_path) {
    const { data: signed } = await supabase.storage.from("materials").createSignedUrl(data.file_path, 60);
    return signed?.signedUrl ?? null;
  }
  if (data.link_url) {
    try {
      const url = new URL(data.link_url);
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
      return null;
    }
  }
  return null;
}

export type AssignmentItem = {
  id: string;
  title: string;
  instructions: string;
  dueAt: string;
  requiresFile: boolean;
  courseId: string;
  courseTitle: string | null;
  submission: { id: string; filePath: string | null; comment: string; submittedAt: string; updatedAt: string } | null;
  status: AssignmentStatus;
};

/** Tout le travail de la promotion, avec le rendu de la personne connectée. */
export async function getAssignments(now: Date, courseId?: string): Promise<AssignmentItem[]> {
  const supabase = await studentClient();
  let query = supabase
    .from("assignments")
    .select(
      "id, title, instructions, due_at, requires_file, course_id, course:courses(title), submissions(id, file_path, comment, submitted_at, updated_at)",
    )
    .order("due_at");
  if (courseId) query = query.eq("course_id", courseId);
  const { data, error } = await query;
  if (error) throw new Error(`Chargement du travail à rendre impossible : ${error.message}`);

  return (data ?? []).map((row) => {
    const submission = row.submissions[0] ?? null;
    return {
      id: row.id,
      title: row.title,
      instructions: row.instructions,
      dueAt: row.due_at,
      requiresFile: row.requires_file,
      courseId: row.course_id,
      courseTitle: row.course?.title ?? null,
      submission: submission
        ? {
            id: submission.id,
            filePath: submission.file_path,
            comment: submission.comment,
            submittedAt: submission.submitted_at,
            updatedAt: submission.updated_at,
          }
        : null,
      status: assignmentStatus(row.due_at, submission?.submitted_at ?? null, now),
    };
  });
}

/** URL signée (60 s) du fichier rendu par la personne connectée pour ce devoir. */
export async function getSubmissionFileUrl(assignmentId: string): Promise<string | null> {
  const supabase = await studentClient();
  const { data } = await supabase
    .from("submissions")
    .select("file_path")
    .eq("assignment_id", assignmentId)
    .maybeSingle();
  if (!data?.file_path) return null;
  const { data: signed } = await supabase.storage
    .from("submissions")
    .createSignedUrl(data.file_path, 60, { download: displayFileName(data.file_path) });
  return signed?.signedUrl ?? null;
}

export type GradeReportCourse = {
  courseId: string;
  courseTitle: string;
  evaluations: {
    id: string;
    title: string;
    heldOn: string;
    maxScore: number;
    coefficient: number;
    score: number | null;
    result: string | null;
    comment: string;
    graded: boolean;
  }[];
};

/**
 * Les évaluations publiées de la promotion, regroupées par module (ordre du programme),
 * avec la note de la personne connectée quand elle existe.
 */
export async function getGradeReport(): Promise<GradeReportCourse[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("evaluations")
    .select("id, title, held_on, max_score, coefficient, course:courses(id, title, position), grades(score, result, comment)")
    .order("held_on");
  if (error) throw new Error(`Chargement des notes impossible : ${error.message}`);

  const byCourse = new Map<string, GradeReportCourse & { position: number }>();
  for (const row of data ?? []) {
    if (!row.course) continue;
    const grade = row.grades[0] ?? null;
    const group = byCourse.get(row.course.id) ?? {
      courseId: row.course.id,
      courseTitle: row.course.title,
      position: row.course.position,
      evaluations: [],
    };
    group.evaluations.push({
      id: row.id,
      title: row.title,
      heldOn: row.held_on,
      maxScore: row.max_score,
      coefficient: row.coefficient,
      score: grade?.score ?? null,
      result: grade?.result ?? null,
      comment: grade?.comment ?? "",
      graded: !!grade,
    });
    byCourse.set(row.course.id, group);
  }
  return [...byCourse.values()]
    .sort((a, b) => a.position - b.position)
    .map((course) => ({ courseId: course.courseId, courseTitle: course.courseTitle, evaluations: course.evaluations }));
}

export type CourseDetail = {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  competencyBlock: string | null;
  sessions: DashboardSession[];
  materials: MaterialItem[];
  assignments: AssignmentItem[];
};

/** Un module, ses séances, ses ressources et son travail à rendre (null s'il n'est pas visible). */
export async function getCourse(courseId: string, now: Date): Promise<CourseDetail | null> {
  const supabase = await studentClient();
  const [course, sessions, materials, assignments] = await Promise.all([
    supabase.from("courses").select("id, title, description, objectives, competency_block").eq("id", courseId).maybeSingle(),
    supabase.from("sessions").select(SESSION_FIELDS).eq("course_id", courseId).order("starts_at"),
    supabase.from("materials").select(MATERIAL_FIELDS).eq("course_id", courseId).order("created_at", { ascending: false }),
    getAssignments(now, courseId),
  ]);
  const error = course.error ?? sessions.error ?? materials.error;
  if (error) throw new Error(`Chargement du module impossible : ${error.message}`);
  if (!course.data) return null;

  return {
    id: course.data.id,
    title: course.data.title,
    description: course.data.description,
    objectives: course.data.objectives,
    competencyBlock: course.data.competency_block,
    sessions: (sessions.data ?? []).map(toSession),
    materials: (materials.data ?? []).map(toMaterial),
    assignments,
  };
}

export type TodoAssignment = {
  id: string;
  title: string;
  dueAt: string;
  requiresFile: boolean;
  courseTitle: string | null;
  status: AssignmentStatus;
};

/** Le travail pas encore rendu : en retard d'abord, puis par échéance. */
export async function getTodoAssignments(now: Date): Promise<TodoAssignment[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("id, title, due_at, requires_file, course:courses(title), submissions(submitted_at)")
    .order("due_at");
  if (error) throw new Error(`Chargement du travail à rendre impossible : ${error.message}`);

  return (data ?? [])
    .map((row) => ({
      id: row.id,
      title: row.title,
      dueAt: row.due_at,
      requiresFile: row.requires_file,
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
  /** Vrai pour une annonce à la promotion, faux pour une annonce à tout le CFA */
  forPromotion: boolean;
};

/** Les annonces les plus récentes (de la promotion et de tout le CFA). */
export async function getLatestAnnouncements(limit: number): Promise<AnnouncementPreview[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, author_name, created_at, target_url, cta_label, promotion_id")
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
    forPromotion: row.promotion_id !== null,
  }));
}

export type GradePreview = {
  id: string;
  score: number | null;
  result: string | null;
  evaluationTitle: string;
  maxScore: number;
  coefficient: number;
  heldOn: string;
  courseTitle: string | null;
};

/** Les dernières notes publiées (la RLS masque celles des évaluations non publiées). */
export async function getLatestGrades(limit: number): Promise<GradePreview[]> {
  const supabase = await studentClient();
  const { data, error } = await supabase
    .from("grades")
    .select("id, score, result, created_at, evaluation:evaluations(title, held_on, max_score, coefficient, course:courses(title))")
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
            coefficient: row.evaluation.coefficient,
            heldOn: row.evaluation.held_on,
            courseTitle: row.evaluation.course?.title ?? null,
          },
        ]
      : [],
  );
}
