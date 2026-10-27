import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarPath: string | null;
  /** URL signée (1 h) de la photo de profil, bucket privé « avatars » */
  avatarUrl: string | null;
  companyName: string | null;
  deactivated: boolean;
  createdAt: string;
  /** Les annonces publiées après cette date sont « nouvelles » */
  announcementsSeenAt: string;
  unreadAnnouncements: number;
  promotion: { id: string; label: string; startsOn: string; endsOn: string } | null;
  formation: { id: string; title: string; level: number | null } | null;
};

type ViewerContext = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_path: string | null;
  company_name: string | null;
  deactivated: boolean;
  created_at: string;
  announcements_seen_at: string;
  unread_announcements: number;
  promotion: { id: string; label: string; starts_on: string; ends_on: string } | null;
  formation: { id: string; title: string; level: number | null } | null;
};

/**
 * La personne connectée, sa promotion et sa formation, en un seul appel (RPC
 * student_viewer_context). Mise en cache le temps d'une requête : le layout et les pages
 * l'utilisent sans doubler l'appel. Renvoie null sans session ou sans profil.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Rendu à la requête : le client Supabase lit l'heure (expiration du jeton), ce que
  // Cache Components refuse pendant un pré-rendu
  await connection();
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  if (authError || !auth?.claims?.sub) return null;

  const { data, error } = await supabase.rpc("student_viewer_context");
  if (error) throw new Error(`Chargement du profil impossible : ${error.message}`);
  if (!data) return null;

  const context = data as unknown as ViewerContext;
  const avatarUrl = context.avatar_path
    ? ((await supabase.storage.from("avatars").createSignedUrl(context.avatar_path, 3600)).data?.signedUrl ?? null)
    : null;

  return {
    id: context.id,
    firstName: context.first_name,
    lastName: context.last_name,
    fullName: `${context.first_name} ${context.last_name}`.trim() || context.email,
    email: context.email,
    avatarPath: context.avatar_path,
    avatarUrl,
    companyName: context.company_name,
    deactivated: context.deactivated,
    createdAt: context.created_at,
    announcementsSeenAt: context.announcements_seen_at,
    unreadAnnouncements: Number(context.unread_announcements ?? 0),
    promotion: context.promotion
      ? {
          id: context.promotion.id,
          label: context.promotion.label,
          startsOn: context.promotion.starts_on,
          endsOn: context.promotion.ends_on,
        }
      : null,
    formation: context.formation,
  };
});
