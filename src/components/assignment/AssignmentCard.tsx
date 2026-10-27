"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Lock } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { AssignmentItem } from "@/lib/data/student";
import { formatLongDay, formatTime, relativeDay } from "@/lib/format";
import { displayFileName } from "@/lib/validate";
import SubmissionForm from "./SubmissionForm";

/** Un devoir : consignes, échéance, rendu existant et formulaire de dépôt. */
export default function AssignmentCard({
  assignment,
  userId,
  now,
}: {
  assignment: AssignmentItem;
  userId: string;
  now: string;
}) {
  const { submission, status } = assignment;
  const open = new Date(assignment.dueAt) > new Date(now);
  const [editing, setEditing] = useState(false);

  return (
    <article id={`devoir-${assignment.id}`} className="card scroll-mt-24 p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {assignment.courseTitle && (
            <Link href={`/etudiant/cours/${assignment.courseId}`} className="eyebrow hover:underline">
              {assignment.courseTitle}
            </Link>
          )}
          <h2 className="mt-1.5 mb-0 text-[18px] font-semibold leading-snug">{assignment.title}</h2>
          <p className="mt-1 mb-0 text-[13.5px] text-texte-doux">
            {status.key === "late" ? "Attendu le " : "À rendre pour le "}
            {formatLongDay(assignment.dueAt).toLowerCase()} à {formatTime(assignment.dueAt)}
            {open && ` · ${relativeDay(assignment.dueAt, now).toLowerCase()}`}
          </p>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </header>

      {assignment.instructions && (
        <p className="mt-4 mb-0 whitespace-pre-line text-[15px] leading-relaxed text-texte">{assignment.instructions}</p>
      )}

      <div className="mt-5 border-t border-black/[0.08] pt-5">
        {submission && !editing && (
          <div className="flex flex-col gap-3">
            <p className="m-0 flex items-center gap-2 text-[14px] font-semibold text-[#1d6b55]">
              <CheckCircle2 size={17} aria-hidden /> Rendu le {formatLongDay(submission.submittedAt).toLowerCase()} à{" "}
              {formatTime(submission.submittedAt)}
              {submission.updatedAt !== submission.submittedAt && (
                <span className="font-normal text-texte-doux">
                  {" "}
                  (modifié le {formatLongDay(submission.updatedAt).toLowerCase()})
                </span>
              )}
            </p>
            {submission.filePath && (
              <a
                href={`/etudiant/travail/${assignment.id}/fichier`}
                className="inline-flex items-center gap-2 self-start rounded-lg bg-porcelaine px-3 py-2 text-[14px] font-medium hover:text-iris"
              >
                <Download size={16} aria-hidden /> {displayFileName(submission.filePath)}
              </a>
            )}
            {submission.comment && (
              <p className="m-0 whitespace-pre-line rounded-lg bg-porcelaine px-3 py-2 text-[14px] text-texte">
                {submission.comment}
              </p>
            )}
            {open && (
              <button type="button" className="btnO self-start !px-5 !py-2.5 text-[13.5px]" onClick={() => setEditing(true)}>
                Modifier mon rendu
              </button>
            )}
          </div>
        )}

        {(!submission || editing) && open && (
          <SubmissionForm
            assignmentId={assignment.id}
            userId={userId}
            requiresFile={assignment.requiresFile}
            initialComment={submission?.comment ?? ""}
            submitted={!!submission}
            hasFile={!!submission?.filePath}
            onDone={editing ? () => setEditing(false) : undefined}
          />
        )}

        {!submission && !open && (
          <p className="m-0 flex items-center gap-2 text-[14px] text-texte">
            <Lock size={16} aria-hidden className="text-[#a3203f]" />
            La date limite est passée : le dépôt est fermé. Contactez votre formateur.
          </p>
        )}
      </div>
    </article>
  );
}
