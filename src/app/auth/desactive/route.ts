import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Coupe la session d'un compte désactivé, puis renvoie vers la connexion avec un message.
 * Les cookies de session sont effacés sur la réponse de redirection elle-même : sinon
 * /login verrait encore une session et renverrait vers /etudiant (boucle).
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login?erreur=desactive", request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  // « local » : ferme la session de ce navigateur sans appel réseau supplémentaire
  await supabase.auth.signOut({ scope: "local" });

  // Filet de sécurité : tout cookie de session Supabase restant est expiré
  request.cookies
    .getAll()
    .filter(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"))
    .forEach(({ name }) => response.cookies.set(name, "", { path: "/", maxAge: 0 }));

  return response;
}
