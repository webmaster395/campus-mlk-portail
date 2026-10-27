# Campus MLK Portail

Espace connecté des apprentis de MLK Campus (CFA à Créteil). Phase 1 : espace étudiant
(tableau de bord, calendrier, cours, ressources, travail à rendre, notes, messages, profil).

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind 4 · Supabase.
La feuille de route et l'avancement sont dans [PLAN.md](PLAN.md), les règles de code dans
[CLAUDE.md](CLAUDE.md).

## Installation

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Adresse du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (la RLS protège les données) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète, serveur uniquement, jamais côté étudiant |
| `NEXT_PUBLIC_SITE_URL` | Adresse publique du portail (liens des e-mails) |

Le build Production Vercel échoue si une de ces variables manque.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires (`node --test`) |
| `npm run build` | Build de production |
| `node scripts/test-accounts.mjs check` | Vérifie la connexion des comptes de test |

## Base de données (Supabase)

- Schéma, RLS et stockage : `supabase/migrations/` (le nom d'un fichier est la version
  enregistrée par Supabase).
- Données de démonstration : `supabase/seed.sql` (dates calculées à partir de la semaine
  en cours, rejouable). Rattacher un compte de test : `supabase/demo-etudiant.sql`.
- Test d'isolement entre promotions : `supabase/tests/rls_isolation.sql` (annule tout ce
  qu'il écrit). À relancer après toute modification de table ou de politique.
- Comptes de test : `scripts/test-accounts.mjs` ; suppression : `supabase/comptes-test-suppression.sql`.

## Gérer les données (pour l'équipe du CFA)

Tant que l'espace gestion n'existe pas, tout se saisit dans Supabase Studio (Table Editor
ou SQL Editor) :

1. **Formations, promotions, modules** : tables `formations`, `promotions`, `courses`.
2. **Séances** (`sessions`), **périodes en entreprise** (`company_periods`, en plages de
   dates ; un rythme régulier se génère en une requête, voir `seed.sql`).
3. **Ressources** (`materials`) : un lien (`link_url`) ou un fichier déposé dans le bucket
   `materials` (`file_path`) ; `visible_from` programme la publication.
4. **Devoirs** (`assignments`), **évaluations** (`evaluations`, cochées `published` pour
   être visibles) et **notes** (`grades`).
5. **Annonces** (`announcements`) : `promotion_id` vide = tout le CFA.
6. **Rattacher un apprenti** : un compte créé librement n'a aucune promotion. Renseigner
   `profiles.promotion_id` (et `company_name`). Désactiver : `profiles.deactivated = true`.

## Mise en ligne

Réglages Supabase (Authentication) et variables Vercel : voir la section Avancement de
[PLAN.md](PLAN.md) (URL du site et redirections, modèles d'e-mail, SMTP, protection des
mots de passe compromis).
