import { NextResponse, type NextRequest } from "next/server";
import { getSubmissionFileUrl } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";
import { isUuid } from "@/lib/validate";

/** Télécharge son propre rendu : URL signée de 60 s, jamais d'adresse permanente. */
export async function GET(request: NextRequest, { params }: RouteContext<"/etudiant/travail/[assignmentId]/fichier">) {
  const { assignmentId } = await params;
  const viewer = await getViewer();
  if (!viewer || viewer.deactivated) return NextResponse.redirect(new URL("/login", request.url));

  const url = isUuid(assignmentId) ? await getSubmissionFileUrl(assignmentId) : null;
  if (!url) return NextResponse.redirect(new URL("/etudiant/travail?onglet=rendus", request.url));
  return NextResponse.redirect(url);
}
