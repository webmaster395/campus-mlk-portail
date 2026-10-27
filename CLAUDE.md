@AGENTS.md

# Campus MLK Portail

Espace connecté des apprentis de MLK Campus (CFA à Créteil). La feuille de route, le
schéma Supabase prévu et l'avancement sont dans `PLAN.md` : le lire avant toute tâche.

## Règles du projet

- **Phase 1 = espace étudiant uniquement.** Un seul rôle (`student`), pas d'espace
  enseignant ni gestion, pas d'abstraction de rôles anticipée.
- **Charte** : celle du site vitrine `../Campus-MLK` (classes `.btnA .btnO .card .fld
  .eyebrow .nr`, tokens Tailwind `iris`, `lilas`, `lime`, `graphite`, `porcelaine`…
  dans `src/app/globals.css`). Logomark et logotype : toujours les PNG de
  `public/images/` via `components/brand/`, jamais redessinés.
- **CSS** : dans `globals.css`, les styles de base sont dans `@layer base` et les classes
  de la charte dans `@layer components`. Ne rien ajouter hors couche : avec Tailwind 4,
  une règle hors couche bat les utilitaires (`a { color: inherit }` hors couche rendait
  `text-white` inopérant sur les liens).
- **Coquille** : menu dans `src/lib/nav.ts` ; une nouvelle page de l'espace utilise
  `PageHeader` (h1), `EmptyState` pour les listes vides et a son `loading.tsx`.
- **Cache Components est activé** (`cacheComponents: true`, défaut de Next 16.4). Toute
  lecture de cookies / session / données par utilisateur doit être dans un composant
  enveloppé de `<Suspense>`, ou dans une route avec `loading.tsx`. Voir
  `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`.
  En pratique : **chaque page de `/etudiant/*` a son `loading.tsx`** (la navigation
  instantanée l'exige, même si le layout a déjà son Suspense), et les données passent par
  `getViewer()` / `lib/data/*`, qui appellent `connection()` avant le client Supabase (il
  lit l'heure, interdit pendant un pré-rendu). Même règle pour `new Date()` dans une page :
  seulement après `await getViewer()` ou `await connection()`. Le build ne le détecte pas
  sur les routes à paramètres (`[courseId]`) : vérifier le journal du serveur de dev.
- **Auth** : connexion et déconnexion par actions serveur ; les liens d'e-mail arrivent sur
  `/auth/reinitialiser` (invitation, oubli) ou `/auth/confirm`, et le jeton n'est consommé
  qu'au clic. Toute redirection après un lien passe par `safeNextPath()`.
- **Fichiers déposés** (rendus, photo) : envoyés directement du navigateur vers Supabase
  Storage (la RLS des buckets contrôle le dossier), puis une action serveur enregistre le
  chemin après vérification. Jamais de fichier dans le corps d'une action serveur (limite
  1 Mo, et 4,5 Mo sur Vercel). Les fichiers ne sortent que par des URL signées de 60 s.
- **Serveur de dev** : si un route handler signale « X is not a function » juste après
  l'ajout d'un export dans un module qu'il importe, c'est le cache de Turbopack :
  redémarrer `npm run dev`.
- **Comptes de test** : `node scripts/test-accounts.mjs check` (identifiants dans
  `supabase/comptes-test.local.json`, jamais dans le chat ni dans git).
- **Supabase** (projet `xmxpgnxeehvkvnsvrynt`) : la RLS protège toutes les données de
  l'espace étudiant. Jamais de clé `service_role` dans le code de l'espace étudiant.
  Schéma versionné dans `supabase/migrations/` uniquement, nom de fichier = version
  enregistrée par Supabase (`list_migrations`). Toute nouvelle table : RLS activée,
  droits explicites (`grant select … to authenticated`, rien pour `anon`), puis
  relancer les advisors, `supabase/tests/rls_isolation.sql` et régénérer
  `src/lib/supabase/database.types.ts`. Fonctions internes dans le schéma `private`.
- **Dates** : `timestamptz` en base, affichage en `fr-FR` et fuseau `Europe/Paris`.
- Textes de l'interface et commentaires en français.

## Commandes

- `npm run dev` : serveur de développement
- `npm run lint` : ESLint
- `npm run build` : build de production (vérifie l'env en Production Vercel)
- `npm test` : tests `node --test` dans `tests/`
