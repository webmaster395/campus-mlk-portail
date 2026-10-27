import { NextResponse, type NextRequest } from "next/server";
import { getMaterialTarget } from "@/lib/data/student";
import { getViewer } from "@/lib/data/viewer";
import { isUuid } from "@/lib/validate";

/**
 * Ouvre une ressource : vérifie que la personne y a accès (RLS), puis redirige vers une
 * URL signée de courte durée (fichier) ou vers le lien externe. Les fichiers ne sont
 * jamais exposés par une adresse permanente.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/etudiant/ressources/[materialId]/ouvrir">) {
  const { materialId } = await params;
  const viewer = await getViewer();
  if (!viewer || viewer.deactivated) return NextResponse.redirect(new URL("/login", request.url));

  const target = isUuid(materialId) ? await getMaterialTarget(materialId) : null;
  if (!target) return NextResponse.redirect(new URL("/etudiant/ressources?erreur=introuvable", request.url));

  return NextResponse.redirect(target);
}
