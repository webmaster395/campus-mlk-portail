# Campus MLK Portail — plan de mise en place (phase 1 : espace étudiant)

Ce document est la feuille de route du projet. Il se suffit à lui-même : un autre
assistant (ou un autre développeur) doit pouvoir reprendre le travail à partir de lui
seul, en lisant aussi `../Campus-MLK` et `../Ministry school` pour les références.

---

## 1. Cadre

- **Projet** : espace connecté de MLK Campus, CFA à Créteil (titres professionnels
  niveaux 3 à 5, en apprentissage, première rentrée en septembre 2026).
- **Périmètre de la phase 1** : **espace étudiant uniquement**. Pas d'espace enseignant
  ni gestion. Les données (formations, cours, séances, ressources, devoirs, notes,
  annonces) sont saisies par le CFA **directement dans Supabase** (Studio ou SQL) tant
  que l'espace gestion n'existe pas.
- **Pas de sur-architecture** : un seul rôle (`student`). On n'anticipe ni permissions
  fines ni abstraction de rôles. On ajoutera une colonne ou une table plus tard.

### Références

| Besoin | Où regarder |
| --- | --- |
| Charte : couleurs, boutons, cartes, champs, animations | `../Campus-MLK/app/globals.css` |
| Logomark (PNG officiels, jamais redessinés) | `../Campus-MLK/components/Logomark.tsx`, `../Campus-MLK/public/images/logomark-*.png`, `logotype*.png` |
| Animations | `../Campus-MLK/components/ScrollReveal.tsx`, `PageTransition.tsx` |
| Police des titres | `../Campus-MLK/app/layout.tsx` (Fraunces via `next/font`, variable `--font-titles`, provisoire en attendant New Spirit d'Adobe Fonts) |
| Clients Supabase | `../Ministry school/src/lib/supabase/{client,server,service}.ts` |
| Garde d'auth (Next 16 : `proxy.ts`, plus `middleware.ts`) | `../Ministry school/src/proxy.ts` |
| Utilisateur connecté mis en cache par requête | `../Ministry school/src/lib/data/viewer.ts` (`cache()` de React + `getClaims()`) |
| Pages étudiant | `../Ministry school/src/app/etudiant/*` |
| Coquille de l'espace (sidebar, header, nav mobile) | `../Ministry school/src/components/{Sidebar,AppHeader,MobileNav,SpaceTabs}.tsx` |
| Calendrier mois / semaine, export ICS | `../Ministry school/src/components/{MonthCalendar,WeekCalendar}.tsx`, `src/lib/ics.ts`, `src/app/etudiant/calendrier/ics/route.ts` |
| Pages d'auth | `../Ministry school/src/app/{login,mot-de-passe-oublie,auth/*}`, `src/components/AuthShell.tsx` |
| Vérification des variables d'env au build | `../Ministry school/scripts/validate-server-env.mjs` |

### À ne PAS reprendre de Ministry School

Tout ce qui est propre à l'école de ministère : `ministries`, `opportunities`, `services`,
La Cuve, `mlk-engagement`, `WelcomeModal`/`MlkEngagementModal`, `steering`, `project lead`,
le suivi d'usage (`StudentUsageTracker`, tables `*_usage*`, `*_activity`), les comptes
de test de charge, les feature flags `NEW_COURSE_EXPERIENCE_*`.

Ministry School n'a pas versionné son schéma de base : `profiles`, `courses`,
`sessions`, `materials`, `assignments` et `announcements` ont été créées à la main
dans Supabase. **Le Portail repart d'un schéma complet et versionné dans
`supabase/migrations/`**, déduit du code de Ministry School et adapté à un CFA.

---

## 2. Stack et versions

| Brique | Version cible | Remarque |
| --- | --- | --- |
| Next.js (App Router) | 16.4.x | Lire `node_modules/next/dist/docs/` avant de coder (règle `AGENTS.md`). `proxy.ts` remplace `middleware.ts`. |
| React | 19.2.x | |
| TypeScript | 5.x | `strict: true` |
| Tailwind CSS | 4.x (`@tailwindcss/turbopack`, configuré dans `next.config.ts`) | + classes de charte reprises de Campus-MLK |
| Supabase | `@supabase/ssr` 0.12.x, `@supabase/supabase-js` 2.x | Auth + Postgres + Storage |
| Icônes | `lucide-react` | comme Ministry School |
| Animations | `motion` | comme Campus-MLK (ScrollReveal, PageTransition) |
| Tests | `node --test` (`tests/*.test.mjs`) | même approche que Ministry School |
| Hébergement | Vercel | à confirmer |

Pas de Sanity : le Portail n'a pas de contenu éditorial, Supabase suffit.

---

## 3. Arborescence cible

```
Campus-MLK-Portail/
  AGENTS.md, CLAUDE.md          règles Next 16 (copiées des projets frères)
  PLAN.md                       ce document
  .env.example
  next.config.ts
  scripts/validate-server-env.mjs
  supabase/
    config.toml                 (si on utilise la CLI Supabase en local)
    migrations/
      <horodatage>_schema_initial.sql
      <horodatage>_rls.sql
      <horodatage>_storage.sql
    seed.sql                    données de démo (formation, promo, cours, séances…)
  public/images/                logomark-*.png, logotype*.png (copiés de Campus-MLK)
  tests/
  src/
    proxy.ts
    app/
      layout.tsx                police, metadata, globals.css
      globals.css               charte Campus-MLK + tokens de l'espace connecté
      page.tsx                  redirige vers /etudiant ou /login
      not-found.tsx, error.tsx
      login/page.tsx
      mot-de-passe-oublie/page.tsx
      auth/
        callback/route.ts       échange du code (lien magique, invitation)
        confirm/route.ts        vérification du token_hash (e-mails Supabase)
        reinitialiser/page.tsx  nouveau mot de passe
        desactive/page.tsx      compte désactivé
      etudiant/
        layout.tsx              garde (getViewer) + Sidebar + AppHeader + MobileNav
        page.tsx                tableau de bord
        loading.tsx
        calendrier/page.tsx
        calendrier/ics/route.ts
        cours/page.tsx
        cours/[courseId]/page.tsx
        ressources/page.tsx
        ressources/[materialId]/ouvrir/route.ts
        travail/page.tsx
        travail/actions.ts
        notes/page.tsx
        messages/page.tsx
        messages/actions.ts
        profil/page.tsx
        profil/actions.ts
    components/
      brand/                    Logomark, Logotype, ScrollReveal, PageTransition
      shell/                    Sidebar, AppHeader, MobileNav, LogoutButton
      ui/                       Card, Button, Field, Badge, EmptyState, Skeleton, FormSubmitButton
      calendar/                 MonthCalendar, WeekCalendar
      auth/                     AuthShell
    lib/
      supabase/{client,server,service}.ts
      data/{viewer,student,messages}.ts
      format.ts                 dates/heures en fr-FR, fuseau Europe/Paris
      ics.ts
      env.ts
```

`/inscription` : création de compte libre (décision du 27/10/2026, voir question n° 3).

---

## 4. Schéma Supabase (phase 1)

Principes :
- Horodatages en `timestamptz`, affichés en `Europe/Paris`. Pas de couple
  `date` + `time` en texte comme dans Ministry School.
- Clés primaires `uuid default gen_random_uuid()`.
- RLS activée sur **toutes** les tables. L'étudiant ne lit que ce qui concerne sa
  promotion, et n'écrit que ses propres lignes (rendus, profil, lecture des annonces).
- Les écritures du CFA passent par Studio ou la clé `service_role`, qui contourne la RLS.

### Tables

**`formations`** : les titres professionnels du CFA.
`id`, `slug` (unique), `title`, `level` (3 à 5), `rncp_code`, `created_at`.

**`promotions`** : une cohorte d'apprentis sur une formation.
`id`, `formation_id` → formations, `label` (ex. « TP DWWM 2026-2027 »), `starts_on`,
`ends_on`, `created_at`.

**`profiles`** : 1 ligne par compte, créée par trigger sur `auth.users`.
`id` (→ `auth.users.id`, PK), `first_name`, `last_name`, `email`, `avatar_path`,
`role` (`text`, check `in ('student')`, défaut `'student'`), `promotion_id` → promotions,
`company_name` (entreprise d'accueil, facultatif), `deactivated` (bool, défaut false),
`announcements_seen_at` (timestamptz), `created_at`, `updated_at`.

**`courses`** : un module ou bloc de compétences d'une formation.
`id`, `formation_id` → formations, `title`, `description`, `objectives` (text[]),
`competency_block` (code du bloc / CCP, facultatif), `position` (ordre), `created_at`.

**`sessions`** : une séance planifiée pour une promotion.
`id`, `course_id` → courses (nullable : examen blanc, journée d'intégration…),
`promotion_id` → promotions, `title`, `kind` (`'cours' | 'evaluation' | 'evenement'`),
`starts_at`, `ends_at`, `room`, `trainer_name` (texte libre en phase 1), `description`,
`created_at`.

**`materials`** : les ressources (fichier dans Storage ou lien externe).
`id`, `course_id` → courses, `session_id` → sessions (nullable), `title`,
`file_path` (bucket `materials`) **ou** `link_url` (check : exactement un des deux),
`visible_from` (timestamptz, nullable), `created_at`.

**`assignments`** : le travail à rendre.
`id`, `course_id` → courses, `promotion_id` → promotions, `title`, `instructions`,
`due_at`, `requires_file` (bool), `created_at`.

**`submissions`** : le rendu d'un étudiant (fusionne `assignment_completions`).
`id`, `assignment_id` → assignments, `student_id` → profiles, `file_path`
(bucket `submissions`, nullable), `comment`, `submitted_at`, `updated_at`.
Contrainte unique `(assignment_id, student_id)`.

**`evaluations`** + **`grades`** : les notes. Le format dépend de la question ouverte n° 1.
- `evaluations` : `id`, `course_id`, `promotion_id`, `title`, `held_on`,
  `max_score` (défaut 20), `coefficient` (défaut 1), `published` (bool).
- `grades` : `id`, `evaluation_id`, `student_id`, `score` (numeric, nullable),
  `result` (`'acquis' | 'en_cours' | 'non_acquis'`, nullable), `comment`, `created_at`.
  Unique `(evaluation_id, student_id)`. Visible seulement si l'évaluation est publiée.

**`announcements`** : les messages du CFA vers les étudiants (sens unique en phase 1).
`id`, `promotion_id` → promotions (**null = tout le CFA**), `title`, `body`,
`author_name` (signature affichée), `target_url`, `cta_label`, `created_at`.

### Fonctions et triggers

- `handle_new_user()` : trigger `after insert on auth.users`, qui crée la ligne
  `profiles` à partir de `raw_user_meta_data` (prénom, nom, promotion).
- `current_promotion_id()` : `security definer`, `stable`. Elle renvoie la promotion de
  `auth.uid()`. Les politiques RLS l'utilisent pour éviter la récursion sur `profiles`.
- `set_updated_at()` : trigger générique.
- `student_viewer_context()` : une RPC qui renvoie en un appel le profil, la promotion, la
  formation et le nombre d'annonces non lues. Même idée que Ministry School, version
  réduite.
- Index sur `sessions (promotion_id, starts_at)`, `assignments (promotion_id, due_at)`,
  `materials (course_id)`, `submissions (student_id)`, `grades (student_id)`,
  `announcements (promotion_id, created_at desc)`.

### Politiques RLS (résumé)

| Table | Lecture étudiant | Écriture étudiant |
| --- | --- | --- |
| formations | la sienne (via sa promotion) | non |
| promotions | la sienne | non |
| profiles | la sienne | la sienne, colonnes limitées (avatar, `announcements_seen_at`) via `update` + vérification `role`/`promotion_id` inchangés |
| courses | ceux de sa formation | non |
| sessions | celles de sa promotion | non |
| materials | celles des cours de sa formation, si `visible_from` est vide ou passé | non |
| assignments | ceux de sa promotion | non |
| submissions | les siens | insert/update les siens, avant `due_at` |
| evaluations | celles de sa promotion, si `published` | non |
| grades | les siennes, si l'évaluation est publiée | non |
| announcements | celles de sa promotion ou globales (`promotion_id is null`) | non |

Un compte avec `deactivated = true` ne voit rien. La règle est dans `current_promotion_id()`,
qui renvoie `null`, et le layout le redirige vers `/auth/desactive`.

### Storage

| Bucket | Accès | Chemin |
| --- | --- | --- |
| `avatars` | privé, URL signées | `<user_id>/avatar.<ext>` : l'étudiant écrit dans son dossier |
| `materials` | privé, URL signées générées côté serveur après vérification RLS sur `materials` | `<course_id>/<fichier>` |
| `submissions` | privé | `<assignment_id>/<student_id>/<fichier>` : l'étudiant écrit et lit uniquement son dossier |

### Seed de démo (`supabase/seed.sql`)

1 formation (ex. TP Développeur Web et Web Mobile), 1 promotion, 4 cours, une vingtaine
de séances réparties sur 6 semaines (alternance école / entreprise), 6 ressources,
3 devoirs (dont 1 en retard et 1 rendu), 2 évaluations publiées avec notes, 3 annonces
(1 globale, 2 de promotion). Le compte étudiant de test est créé par
invitation ou via Studio : ses identifiants ne sont jamais écrits dans le dépôt, seule
l'adresse e-mail de démo est dans `.env.example`.

---

## 5. Charte et composants visuels

- Reprendre **mot pour mot** les tokens et classes de `../Campus-MLK/app/globals.css` :
  `--porcelaine #f9f9f9`, `--graphite #1a1a1a`, `--iris #8d7cff`, `--lilas #ba7eee`,
  `--lime #d1ff5e` et les secondaires relevées dans le site (`#e84d72`, `#4ec5a5`,
  `#1b5cff`, `#f4bf4c`, `#f2683c`, `#f2e9fb`), les gris `#3d3d3d #4a4a4a #6b6b6b`, et les
  classes `.btnA .btnO .ar .card .lift .fld .lbl .eyebrow .nr`, ainsi que les keyframes
  `fup` et `fin`.
- Les exposer aussi en `@theme` Tailwind 4 (`bg-iris`, `text-graphite`…) pour les nouveaux
  composants.
- Usage des couleurs : Iris = interactif (liens, focus, bouton survolé). Lilas =
  informatif (eyebrows, badges d'info). Lime = accent sur fond graphite (sidebar active,
  pastilles). Secondaires = statuts (rouge `#e84d72` en retard, vert `#4ec5a5` rendu ou
  acquis, jaune `#f4bf4c` bientôt dû).
- Titres en `.nr` (Fraunces → New Spirit), corps en Helvetica Neue.
- Sidebar sur fond graphite avec le logomark `blanc` ou `principal`. Contenu sur porcelaine.
  Cartes blanches arrondies, comme les cartes du site.
- Mouvement léger : `ScrollReveal` sur les cartes du tableau de bord, transition de
  page discrète, respect de `prefers-reduced-motion`.
- Mobile d'abord : nav basse ou tiroir sous 768 px (modèle `MobileNav` de Ministry
  School). Cibles tactiles ≥ 44 px.
- Accessibilité : contrastes AA (attention au texte sur Lilas et Lime), focus visible
  en Iris, libellés de formulaires, `aria-current` dans la nav.

---

## 6. Étapes de réalisation

Chaque étape se termine par `npm run lint` et `npm run build` sans erreur, plus une
vérification dans le navigateur. Après la mise en place du dépôt git, chaque étape
donne lieu à un commit.

### Étape 0 : socle du projet
1. `git init` et `.gitignore` (dont `.env*.local`).
2. `create-next-app` (TypeScript, App Router, Tailwind, ESLint, `src/`, alias `@/*`) dans
   le dossier courant. Aligner sur Next 16.4.x / React 19.2.x.
3. Copier `AGENTS.md` et `CLAUDE.md` des projets frères. Lire
   `node_modules/next/dist/docs/01-app/01-getting-started/` (structure, proxy, data
   fetching, caching) avant d'écrire le code.
4. Dépendances : `@supabase/ssr @supabase/supabase-js lucide-react motion`.
5. Copier les PNG de marque dans `public/images/`. Ajouter favicon et `icon`.
6. `globals.css` (charte), `layout.tsx` (Fraunces, `lang="fr"`, metadata
   « Portail · MLK Campus »), composants `brand/`.
7. `.env.example` avec `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Ajouter `scripts/validate-server-env.mjs`
   en `prebuild`.

**Terminé quand** : `npm run dev` affiche une page de test aux couleurs MLK, et le
lint et le build passent.

### Étape 1 : Supabase
1. Créer un **projet Supabase dédié** (région UE, ex. `eu-west-3` Paris). Voir la question n° 4.
2. Écrire les migrations : schéma, puis RLS, puis Storage. Appliquer, puis lancer les
   advisors (sécurité et performance) et corriger les alertes.
3. Écrire et appliquer `seed.sql`. Créer le compte étudiant de démo.
4. Générer les types : `src/lib/supabase/database.types.ts` (via la CLI ou le MCP).
5. Réglages Auth : inscriptions publiques **désactivées**, URL du site et redirections
   (`/auth/callback`, `/auth/confirm`), modèles d'e-mail en français (invitation,
   réinitialisation).

**Terminé quand** : en SQL, avec le JWT de l'étudiant de démo, on ne voit que les
données de sa promotion. Un second étudiant d'une autre promotion ne voit rien du
premier. Les advisors ne remontent pas d'alerte de sécurité.

### Étape 2 : authentification
1. `src/lib/supabase/{client,server,service}.ts` : repris de Ministry School.
2. `src/proxy.ts` : rafraîchit la session (`getClaims`). Routes publiques : `/login`,
   `/mot-de-passe-oublie`, `/auth/*`. Tout le reste exige une session. Connecté sur
   `/login` → `/etudiant`.
3. Pages `login` (e-mail + mot de passe, messages d'erreur en français, e-mail non
   confirmé), `mot-de-passe-oublie`, `auth/callback`, `auth/confirm`,
   `auth/reinitialiser`, `auth/desactive`, avec un `AuthShell` aux couleurs MLK
   (logotype, fond graphite ou porcelaine).
4. Déconnexion (server action).
5. `lib/data/viewer.ts` : `getViewer()` mis en cache par requête, via la RPC
   `student_viewer_context`.

**Terminé quand** : connexion, déconnexion, mot de passe oublié de bout en bout,
invitation (définir son mot de passe au premier accès), redirection des pages protégées
et compte désactivé fonctionnent.

### Étape 3 : coquille de l'espace étudiant
1. `etudiant/layout.tsx` : garde et redirections, puis Sidebar (logomark, liens, compteur
   d'annonces non lues, avatar et nom, déconnexion), AppHeader (titre de page, promotion),
   MobileNav.
2. Composants `ui/` : Card, Button (`btnA`/`btnO`), Badge de statut, EmptyState,
   Skeleton, FormSubmitButton (état en attente).
3. `loading.tsx` par section, `error.tsx`, `not-found.tsx`.

**Terminé quand** : la navigation complète fonctionne sur desktop et mobile, avec des
pages vides propres (états vides).

### Étape 4 : sections (dans cet ordre, une par une)

| # | Section | Contenu | Données |
| --- | --- | --- | --- |
| 4.1 | **Tableau de bord** `/etudiant` | Bonjour {prénom}, prochaine séance (date, heure, salle, formateur), travail à rendre bientôt (3 max, avec statut), dernière annonce, dernières notes publiées | sessions, assignments + submissions, announcements, grades |
| 4.2 | **Calendrier** `/etudiant/calendrier` | Vue semaine (défaut sur mobile) et mois, couleurs par type de séance, distinction école / entreprise si retenue, export `.ics` | sessions |
| 4.3 | **Cours** `/etudiant/cours` et `/[courseId]` | Liste des modules de la formation avec progression (séances passées / total), fiche : objectifs, séances, ressources, devoirs | courses, sessions, materials, assignments |
| 4.4 | **Ressources** `/etudiant/ressources` | Toutes les ressources visibles, filtrables par cours, ouverture via route serveur qui vérifie l'accès et redirige vers une URL signée de courte durée | materials + Storage |
| 4.5 | **Travail à rendre** `/etudiant/travail` | Onglets « À faire / Rendus / En retard », dépôt de fichier (taille et types limités) + commentaire, modification possible avant échéance | assignments, submissions + Storage |
| 4.6 | **Notes** `/etudiant/notes` | Par cours : évaluations publiées, note ou résultat, coefficient, moyenne (si notation chiffrée), commentaire du formateur | evaluations, grades |
| 4.7 | **Messages** `/etudiant/messages` | Annonces du CFA, badge « nouveau », bouton « tout marquer comme lu » | announcements, `profiles.announcements_seen_at` |
| 4.8 | **Profil** `/etudiant/profil` | Identité, formation, promotion, entreprise, photo (upload), changement de mot de passe | profiles + Storage |

Règles communes : Server Components par défaut, Server Actions pour les écritures avec
validation des entrées et `revalidatePath`, aucune clé `service_role` dans le code
de l'espace étudiant (seule la RLS protège les données), dates en `Europe/Paris`.

### Étape 5 : finition et mise en ligne
1. Tests `node --test` sur les fonctions pures (`format.ts`, `ics.ts`, calcul de moyenne,
   statut d'un devoir) et un test de non-régression RLS (script SQL ou JS avec deux
   comptes).
2. Passe accessibilité et responsive (375 px, 768 px, 1280 px), `prefers-reduced-motion`.
3. Metadata, favicon, `robots: noindex` (espace privé).
4. Déploiement Vercel : variables d'environnement, domaine (ex. `portail.mlkcampus.fr`),
   URL de redirection Supabase mises à jour.
5. `README.md` : installation, variables, migrations, ajout de données par le CFA via Studio.

---

## 7. Questions ouvertes (à trancher avant ou pendant l'étape concernée)

1. **« Notes » = évaluations ?** Pour un titre professionnel, l'évaluation se fait souvent
   par compétences (ECF, acquis / non acquis) plutôt que sur 20. Le schéma prévoit les
   deux. Faut-il afficher des moyennes ? *(étape 4.6)*
2. **Messages** : annonces à sens unique (comme Ministry School) en phase 1, ou vraie
   messagerie étudiant ↔ CFA ? *(étape 4.7, recommandation : annonces seules pour
   l'instant)*
3. ~~**Création des comptes**~~ **Tranché** : inscription libre sur `/inscription` (lien
   depuis `/login`), contrairement à Ministry School (pas d'adresse secrète). Le compte
   naît **sans promotion** et le CFA le rattache (`profiles.promotion_id`) : la promotion
   ouvre l'accès aux données, l'inscrit ne peut donc pas la choisir (le trigger ne la lit
   que dans `raw_app_meta_data`, jamais dans les métadonnées envoyées à l'inscription).
   L'invitation par le CFA reste possible.
4. **Projet Supabase** : nouveau projet dédié (recommandé), créé par toi dans le tableau
   de bord, ou par moi via le connecteur Supabase. La création peut avoir un coût selon
   ton offre, je te le confirmerai avant. *(étape 1)*
5. **Alternance** : faut-il afficher les périodes en entreprise dans le calendrier
   (rythme école / entreprise) ? *(étape 4.2)*
6. **Hébergement et domaine** : Vercel et `portail.mlkcampus.fr` ? *(étape 5)*
7. **Dépôt git distant** : GitHub (quel compte ou organisation) ? *(étape 0)*

---

## 8. Reprise par un autre assistant

Si le travail est repris en cours de route :
1. Lire ce fichier, puis `AGENTS.md`. Lire la doc Next 16 dans `node_modules/next/dist/docs/`.
2. `git log --oneline` pour voir la dernière étape terminée. Chaque commit porte le
   numéro de l'étape (« Étape 3 : coquille de l'espace étudiant »).
3. Vérifier `npm run lint && npm run build` avant de continuer.
4. Respecter les choix ci-dessus (un seul rôle, RLS partout, pas de `service_role` côté
   étudiant, charte Campus-MLK, logomark en PNG uniquement).
5. Tenir à jour la section « Avancement » ci-dessous.

## 9. Avancement

- [x] Étape 0 : socle. Next 16.4.3, React 19.3, Tailwind 4 via le loader Turbopack. **Cache
  Components et Partial Prefetching sont activés** (défauts de `create-next-app` 16.4) :
  les lectures de session doivent être sous `<Suspense>` (voir `CLAUDE.md`).
- [x] Étape 1 : Supabase. Projet `campus-mlk-portail` (ref `xmxpgnxeehvkvnsvrynt`, eu-west-3,
  offre gratuite). Migrations appliquées (schéma, RLS, storage), seed de démo chargé,
  isolement RLS vérifié (`supabase/tests/rls_isolation.sql`), advisors sécurité : aucune
  alerte. Types dans `src/lib/supabase/database.types.ts`. Les fonctions internes sont
  dans le schéma `private` (non exposé par l'API).
  **Comptes de test** (`scripts/test-accounts.mjs`, domaine `portail-mlk.invalid`,
  identifiants dans `supabase/comptes-test.local.json`, non versionné) : Inès (DWWM, avec
  rendu et notes), Yanis (NTC), Léa (désactivée), Sam (sans promotion). Vérifier qu'ils
  se connectent : `node scripts/test-accounts.mjs check`. Les effacer :
  `supabase/comptes-test-suppression.sql`.
  **Reste à faire par le propriétaire du compte Supabase** : réglages Auth de l'étape 2 ;
  renseigner `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`.
- [x] Étape 2 : authentification. Connexion (action serveur), déconnexion, mot de passe
  oublié, `/auth/callback` (PKCE), `/auth/confirm`, `/auth/reinitialiser` (premier mot de
  passe après invitation, ou nouveau mot de passe), `/auth/desactive`, `proxy.ts`, garde de
  `/etudiant` (`getViewer`). Testé dans le navigateur avec les comptes de test : connexion,
  erreur, déconnexion, compte désactivé, redirections sans session.
  **Inscription libre** (`/inscription`, ajoutée ensuite) : prénom, nom, e-mail, mot de
  passe ; compte créé sans promotion, rattaché par le CFA (migration
  `inscription_publique` : le trigger ignore toute promotion envoyée par l'inscrit).
  **Réglages Supabase à faire (Authentication)** :
  1. *Sign In / Providers* : laisser « Allow new users to sign up » **activé** et
     « Confirm email » activé (l'adresse doit être vérifiée).
  2. *URL Configuration* : Site URL = adresse du portail ; Redirect URLs =
     `http://localhost:3000/**` et l'adresse de production `/**`.
  3. *Emails > Templates* (recommandé : le jeton n'est consommé qu'au clic) :
     « Confirm signup » → `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` ;
     « Invite user » → `{{ .SiteURL }}/auth/reinitialiser?token_hash={{ .TokenHash }}&type=invite` ;
     « Reset password » → `{{ .SiteURL }}/auth/reinitialiser?token_hash={{ .TokenHash }}&type=recovery`.
     Sans ce réglage, confirmation et réinitialisation marchent via `/auth/callback`
     (dans le même navigateur), mais pas l'invitation.
  4. *SMTP* : le SMTP par défaut de Supabase n'envoie qu'aux membres de l'équipe du projet
     et quelques e-mails par heure. Un SMTP à soi (ex. campus@mlkgrandparis.com) est
     indispensable avant d'ouvrir l'inscription à de vrais apprentis.
  5. Désactiver un apprenti : `profiles.deactivated = true` (l'accès est coupé) ; pour
     bloquer aussi la connexion elle-même, le bannir dans Authentication > Users.
- [x] Étape 3 : coquille. Sidebar graphite (logotype blanc, sections du menu, entrée active
  en lime, pastille des annonces non lues, profil et déconnexion en bas), en-tête (section,
  promotion, raccourci Messages), tiroir mobile accessible (Échap, focus, défilement
  bloqué), lien d'évitement. Composants `ui/` : PageHeader, EmptyState, StatusBadge,
  SectionSkeleton, Avatar (initiales), ComingSoon. Pages vides des 7 sections avec
  `loading.tsx`, `error.tsx` de l'espace, 404 aux couleurs MLK, état « en attente de
  rattachement » pour un compte sans promotion. Menu défini dans `src/lib/nav.ts`.
  Testé : ordinateur et mobile, comptes Inès et Sam, navigation, déconnexion par le menu.
- [ ] Étape 4 : sections (4.1 → 4.8)
- [ ] Étape 5 : finition et mise en ligne
