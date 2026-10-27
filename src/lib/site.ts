import "server-only";
import { headers } from "next/headers";

/**
 * Adresse publique du portail, pour les liens envoyés par e-mail. NEXT_PUBLIC_SITE_URL en
 * priorité ; sinon l'origine de la requête en cours (utile en préproduction Vercel).
 */
export async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (origin) return origin;
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}
