import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages des visiteurs non connectés ; une personne connectée y est renvoyée vers son espace
const GUEST_PATHS = ["/login", "/inscription", "/mot-de-passe-oublie"];

function redirectTo(request: NextRequest, pathname: string, response: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  // Conserve les cookies de session rafraîchis pendant cette requête
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

/**
 * Rafraîchit la session Supabase à chaque requête et fait les redirections « optimistes » :
 * sans session, tout mène à /login ; avec session, /login mène à /etudiant.
 * La vérification complète (compte désactivé, profil) est faite par le layout de l'espace.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Vérifie la signature du jeton (clés publiques mises en cache) et le rafraîchit si besoin
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims?.sub;
  const { pathname } = request.nextUrl;

  // Les liens reçus par e-mail (invitation, réinitialisation) arrivent souvent sans session
  const isAuthRoute = pathname.startsWith("/auth/");
  const isGuestPath = GUEST_PATHS.includes(pathname);

  if (pathname === "/") {
    return redirectTo(request, isAuthenticated ? "/etudiant" : "/login", response);
  }
  if (!isAuthenticated && !isGuestPath && !isAuthRoute) {
    return redirectTo(request, "/login", response);
  }
  if (isAuthenticated && isGuestPath) {
    return redirectTo(request, "/etudiant", response);
  }

  return response;
}

export const config = {
  // Ne s'exécute pas sur les fichiers statiques (images, polices, icônes…)
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp|gif|woff2?|txt|xml|json|webmanifest)$).*)",
  ],
};
