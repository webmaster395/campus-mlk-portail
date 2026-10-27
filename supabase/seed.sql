-- Campus MLK Portail : données de démonstration (formations, promotions, cours, séances,
-- ressources, devoirs, évaluations, annonces). Aucun compte n'est créé ici : voir
-- supabase/demo-etudiant.sql pour rattacher un compte étudiant de test à la promotion de démo.
--
-- Les dates sont calculées à partir de la semaine en cours (heure de Paris) : le calendrier
-- de démo reste vivant quel que soit le jour où le seed est lancé.
-- Identifiants fixes : le seed est rejouable (on conflict do nothing) et les scripts de
-- démo peuvent y faire référence.
--
-- Rythme de l'alternance (site vitrine) : 2 jours au campus, 3 jours en entreprise.

-- ---------------------------------------------------------------------------
-- Formations et promotions
-- ---------------------------------------------------------------------------

insert into public.formations (id, slug, title, level, rncp_code) values
  ('f0000000-0000-4000-8000-000000000001', 'developpeur-web-et-web-mobile',
    'Développeur web et web mobile', 5, 'RNCP37674'),
  ('f0000000-0000-4000-8000-000000000002', 'negociateur-technico-commercial',
    'Négociateur technico-commercial', 5, null)
on conflict (id) do nothing;

insert into public.promotions (id, formation_id, label, starts_on, ends_on) values
  ('b0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001',
    'DWWM 2026-2027', '2026-09-07', '2027-09-03'),
  ('b0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000002',
    'NTC 2026-2027', '2026-09-07', '2027-09-03')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Modules
-- ---------------------------------------------------------------------------

insert into public.courses (id, formation_id, title, description, objectives, competency_block, position) values
  ('c0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001',
    'Interfaces web et maquettes',
    'Concevoir des interfaces accessibles et responsives à partir d''une maquette.',
    array['Intégrer une maquette en HTML et CSS', 'Rendre une interface responsive', 'Respecter les règles d''accessibilité (RGAA)'],
    'CCP 1', 1),
  ('c0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000001',
    'JavaScript et interfaces dynamiques',
    'Rendre une interface interactive avec JavaScript et un framework moderne.',
    array['Manipuler le DOM', 'Consommer une API', 'Structurer une application en composants'],
    'CCP 1', 2),
  ('c0000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000001',
    'Bases de données et back-end',
    'Modéliser une base de données et développer les composants d''accès aux données.',
    array['Concevoir un modèle de données', 'Écrire des requêtes SQL', 'Sécuriser l''accès aux données'],
    'CCP 2', 3),
  ('c0000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000001',
    'Gestion de projet et méthodes agiles',
    'Travailler en équipe sur un projet web avec les outils et rituels agiles.',
    array['Organiser un backlog', 'Utiliser Git en équipe', 'Présenter son travail'],
    null, 4),
  ('c0000000-0000-4000-8000-000000000005', 'f0000000-0000-4000-8000-000000000002',
    'Prospection et négociation',
    'Identifier des prospects et conduire un entretien de négociation.',
    array['Construire un plan de prospection', 'Mener un entretien de vente'],
    'CCP 1', 1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Séances : lundi et mardi au campus, de 3 semaines avant à 5 semaines après la
-- semaine en cours. Un ECF remplace le mardi après-midi de la semaine +2.
-- ---------------------------------------------------------------------------

with ref as (
  select date_trunc('week', now() at time zone 'Europe/Paris')::date as monday
),
modules as (
  select
    array[
      'c0000000-0000-4000-8000-000000000001',
      'c0000000-0000-4000-8000-000000000002',
      'c0000000-0000-4000-8000-000000000003',
      'c0000000-0000-4000-8000-000000000004'
    ]::uuid[] as ids,
    array[
      'Interfaces web et maquettes',
      'JavaScript et interfaces dynamiques',
      'Bases de données et back-end',
      'Gestion de projet et méthodes agiles'
    ] as titles,
    array['Sarah Benali', 'Thomas Leroy', 'Karim Haddad', 'Julie Moreau'] as trainers,
    array['Salle 1.02', 'Salle 1.02', 'Salle 2.05', 'Salle 2.05'] as rooms
),
slots as (
  select w, d, start_t, end_t, ((w + 3) * 2 + d) % 4 + 1 as module_index
  from generate_series(-3, 5) as w,
    (values (0, time '09:00', time '12:30'), (0, time '13:30', time '17:00'),
            (1, time '09:00', time '12:30'), (1, time '13:30', time '17:00')) as s(d, start_t, end_t)
)
insert into public.sessions (course_id, promotion_id, title, kind, starts_at, ends_at, room, trainer_name, description)
select
  m.ids[s.module_index],
  'b0000000-0000-4000-8000-000000000001',
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30'
    then 'ECF : intégration d''une maquette'
    else m.titles[s.module_index] end,
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30' then 'evaluation' else 'cours' end,
  ((ref.monday + s.w * 7 + s.d) + s.start_t) at time zone 'Europe/Paris',
  ((ref.monday + s.w * 7 + s.d) + s.end_t) at time zone 'Europe/Paris',
  m.rooms[s.module_index],
  m.trainers[s.module_index],
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30'
    then 'Évaluation en cours de formation, individuelle, 3 h 30. Ordinateur portable chargé.'
    else 'Séance au campus.' end
from slots s, modules m, ref
-- Rejouable : pas de doublon si les séances de la promotion de démo existent déjà
where not exists (
  select 1 from public.sessions x where x.promotion_id = 'b0000000-0000-4000-8000-000000000001'
);

-- Un atelier (événement sans module) et une séance de la seconde promotion
with ref as (
  select date_trunc('week', now() at time zone 'Europe/Paris')::date as monday
)
insert into public.sessions (course_id, promotion_id, title, kind, starts_at, ends_at, room, trainer_name, description)
select * from (
  select
    null::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid, 'Atelier : préparer son entretien de mi-parcours',
    'evenement', ((ref.monday + 10) + time '09:00') at time zone 'Europe/Paris',
    ((ref.monday + 10) + time '12:00') at time zone 'Europe/Paris', 'Amphithéâtre', 'Équipe pédagogique',
    'Point d''étape avec votre référent et votre tuteur en entreprise.'
  from ref
  union all
  select
    'c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002', 'Prospection et négociation',
    'cours', ((ref.monday + 3) + time '09:00') at time zone 'Europe/Paris',
    ((ref.monday + 3) + time '12:30') at time zone 'Europe/Paris', 'Salle 3.01', 'Nadia Ferhat', 'Séance au campus.'
  from ref
) as extra
where not exists (
  select 1 from public.sessions x where x.kind = 'evenement'
    and x.promotion_id = 'b0000000-0000-4000-8000-000000000001'
);

-- ---------------------------------------------------------------------------
-- Ressources (liens externes ; les fichiers seront déposés par le CFA)
-- ---------------------------------------------------------------------------

insert into public.materials (id, course_id, title, link_url, visible_from) values
  ('a1000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
    'MDN : apprendre le HTML', 'https://developer.mozilla.org/fr/docs/Learn/HTML', null),
  ('a1000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001',
    'Référentiel général d''amélioration de l''accessibilité (RGAA)', 'https://accessibilite.numerique.gouv.fr/', null),
  ('a1000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002',
    'MDN : JavaScript, premiers pas', 'https://developer.mozilla.org/fr/docs/Learn/JavaScript/First_steps', null),
  ('a1000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000003',
    'Documentation PostgreSQL (en français)', 'https://docs.postgresql.fr/', null),
  ('a1000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000004',
    'Le guide Scrum', 'https://scrumguides.org/', null),
  -- Corrigé publié plus tard : invisible des étudiants jusqu'à sa date
  ('a1000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000001',
    'Corrigé de l''ECF (après l''évaluation)', 'https://developer.mozilla.org/fr/docs/Web/CSS',
    now() + interval '30 days'),
  ('a1000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000005',
    'Fiche : les étapes de la vente', 'https://www.francetravail.fr/', null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Travail à rendre
-- ---------------------------------------------------------------------------

with ref as (
  select date_trunc('week', now() at time zone 'Europe/Paris')::date as monday
)
insert into public.assignments (id, course_id, promotion_id, title, instructions, due_at, requires_file)
select * from (
  -- En retard : échéance le vendredi précédent
  select 'a2000000-0000-4000-8000-000000000001'::uuid, 'c0000000-0000-4000-8000-000000000003'::uuid,
    'b0000000-0000-4000-8000-000000000001'::uuid, 'Modèle conceptuel de données',
    'Réalisez le MCD de l''application de réservation vue en cours. Rendez un PDF.',
    ((ref.monday - 3) + time '23:59') at time zone 'Europe/Paris', true
  from ref
  union all
  -- Bientôt dû : vendredi de cette semaine
  select 'a2000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000001', 'Exercices sur le DOM',
    'Terminez les exercices 1 à 5 du support. Pas de fichier à rendre : cochez une fois terminé.',
    ((ref.monday + 4) + time '23:59') at time zone 'Europe/Paris', false
  from ref
  union all
  -- Plus tard : intégration d'une maquette, avec fichier
  select 'a2000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001', 'Intégration de la maquette « Portfolio »',
    'Intégrez la maquette fournie en HTML/CSS, responsive et accessible. Rendez une archive .zip.',
    ((ref.monday + 18) + time '23:59') at time zone 'Europe/Paris', true
  from ref
  union all
  select 'a2000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000005',
    'b0000000-0000-4000-8000-000000000002', 'Plan de prospection',
    'Construisez le plan de prospection de votre entreprise d''accueil.',
    ((ref.monday + 11) + time '23:59') at time zone 'Europe/Paris', true
  from ref
) as seed_assignments
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Évaluations (les notes de l'étudiant de démo sont dans demo-etudiant.sql)
-- ---------------------------------------------------------------------------

with ref as (
  select (date_trunc('week', now() at time zone 'Europe/Paris'))::date as monday
)
insert into public.evaluations (id, course_id, promotion_id, title, held_on, max_score, coefficient, published)
select * from (
  select 'e0000000-0000-4000-8000-000000000001'::uuid, 'c0000000-0000-4000-8000-000000000001'::uuid,
    'b0000000-0000-4000-8000-000000000001'::uuid, 'Quiz HTML et CSS', ref.monday - 20, 20::numeric, 1::numeric, true
  from ref
  union all
  select 'e0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000001', 'Requêtes SQL (compétences)', ref.monday - 13, 20, 2, true
  from ref
  union all
  -- Pas encore publiée : invisible des étudiants
  select 'e0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000001', 'Contrôle JavaScript', ref.monday - 6, 20, 1, false
  from ref
) as seed_evaluations
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Annonces
-- ---------------------------------------------------------------------------

insert into public.announcements (id, promotion_id, title, body, author_name, target_url, cta_label, created_at) values
  ('a3000000-0000-4000-8000-000000000001', null,
    'Bienvenue sur votre portail',
    'Retrouvez ici votre calendrier, vos cours, vos ressources, le travail à rendre et vos notes. En cas de question, écrivez à l''équipe pédagogique.',
    'MLK Campus', '/etudiant', 'Découvrir le portail', now() - interval '20 days'),
  ('a3000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
    'ECF dans deux semaines',
    'L''ECF d''intégration de maquette approche : la date est dans votre calendrier. Pensez à venir avec votre ordinateur chargé.',
    'Sarah Benali', '/etudiant/calendrier', 'Voir le calendrier', now() - interval '2 days'),
  ('a3000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001',
    'Changement de salle',
    'Les séances de bases de données ont lieu désormais en salle 2.05.',
    'Équipe pédagogique', null, null, now() - interval '6 hours'),
  ('a3000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002',
    'Salon de l''alternance',
    'Rendez-vous jeudi au salon de l''alternance de Créteil.',
    'Équipe pédagogique', null, null, now() - interval '1 day')
on conflict (id) do nothing;
