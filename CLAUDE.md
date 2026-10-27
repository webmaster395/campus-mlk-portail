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
- **Cache Components est activé** (`cacheComponents: true`, défaut de Next 16.4). Toute
  lecture de cookies / session / données par utilisateur doit être dans un composant
  enveloppé de `<Suspense>`, ou dans une route avec `loading.tsx`. Voir
  `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`.
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
