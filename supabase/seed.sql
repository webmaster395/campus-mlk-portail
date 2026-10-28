-- Campus MLK Portail : données de démonstration (formations, promotions, cours, séances,
-- ressources, devoirs, évaluations, annonces).
--
-- Formations officielles de Campus MLK :
--   1. Monteur audiovisuel (Niveau 5 - RNCP37666)
--   2. Graphiste (Niveau 5 - RNCP36873)
--   3. Commis de cuisine (Niveau 3 - RNCP38541)
--   4. Serveur en restauration (Niveau 3 - RNCP38540)
--
-- Les dates sont calculées à partir de la semaine en cours (heure de Paris) : le calendrier
-- de démo reste vivant quel que soit le jour où le seed est exécuté.
-- Rythme de l'alternance : 2 jours au campus, 3 jours en entreprise.

-- ---------------------------------------------------------------------------
-- 1. Formations et promotions
-- ---------------------------------------------------------------------------

insert into public.formations (id, slug, title, level, rncp_code) values
  ('f0000000-0000-4000-8000-000000000001', 'monteur-audiovisuel',
    'Monteur audiovisuel', 5, 'RNCP37666'),
  ('f0000000-0000-4000-8000-000000000002', 'graphiste',
    'Graphiste', 5, 'RNCP36873'),
  ('f0000000-0000-4000-8000-000000000003', 'commis-de-cuisine',
    'Commis de cuisine', 3, 'RNCP38541'),
  ('f0000000-0000-4000-8000-000000000004', 'serveur-en-restauration',
    'Serveur en restauration', 3, 'RNCP38540')
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  level = excluded.level,
  rncp_code = excluded.rncp_code;

insert into public.promotions (id, formation_id, label, starts_on, ends_on) values
  ('b0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001',
    'Promotion 2026–2027', '2026-09-07', '2027-09-03'),
  ('b0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000003',
    'Commis de Cuisine 2026–2027', '2026-09-07', '2027-09-03'),
  ('b0000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000002',
    'Graphiste 2026–2027', '2026-09-07', '2027-09-03'),
  ('b0000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000004',
    'Serveur en Restauration 2026–2027', '2026-09-07', '2027-09-03')
on conflict (id) do update set
  formation_id = excluded.formation_id,
  label = excluded.label,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on;

-- ---------------------------------------------------------------------------
-- 2. Modules / Cours
-- ---------------------------------------------------------------------------

-- Monteur audiovisuel (promotion principale de démonstration)
insert into public.courses (id, formation_id, title, description, objectives, competency_block, position) values
  ('c0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001',
    'Cours test – Techniques de montage et outils de post-production',
    'Prendre en main les logiciels professionnels (Premiere Pro, DaVinci Resolve) et structurer un workflow de montage efficace.',
    array['Dérusher et synchroniser des prises multicaméras', 'Construire un premier ours (assemblage narratif)', 'Gérer les raccords d''action et de regard'],
    'CCP 1', 1),
  ('c0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000001',
    'Cours test – Narration visuelle, rythme et découpage',
    'Donner vie à un récit à travers le tempo, le choix des angles et la dynamique émotionnelle des plans.',
    array['Analyser une note d''intention et un scénario', 'Maîtriser le sens du rythme au montage', 'Accorder l''image et la bande sonore avec fluidité'],
    'CCP 1', 2),
  ('c0000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000001',
    'Cours test – Étalonnage colorimétrique et post-production sonore',
    'Corriger les défauts d''éclairage, harmoniser la colorimétrie et traiter le mixage audio aux normes professionnelles.',
    array['Effectuer la balance des blancs et des contrastes', 'Créer un look visuel cinématographique cohérent', 'Nettoyer les voix et mixer ambiances et musiques (-23 LUFS)'],
    'CCP 2', 3),
  ('c0000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000001',
    'Cours test – Habillage graphique et motion design',
    'Créer des éléments animés pour enrichir les productions : génériques, synthés, titrages et transitions After Effects.',
    array['Créer des bandeaux et titrages animés pour le web et la TV', 'Animer un logotype ou une icône de marque', 'Exporter aux spécifications broadcast et réseaux sociaux'],
    'CCP 2', 4),
  -- Commis de cuisine (seconde filière de démo)
  ('c0000000-0000-4000-8000-000000000005', 'f0000000-0000-4000-8000-000000000003',
    'Cours test – Techniques culinaires de base et organisation du poste',
    'Maîtrise des taillages, cuissons élémentaires et de la méthode HACCP en brigade.',
    array['Tailler légumes, viandes et poissons avec rigueur', 'Conduire des cuissons maîtrisées', 'Appliquer scrupuleusement les règles d''hygiène alimentaire'],
    'CCP 1', 1)
on conflict (id) do update set
  formation_id = excluded.formation_id,
  title = excluded.title,
  description = excluded.description,
  objectives = excluded.objectives,
  competency_block = excluded.competency_block,
  position = excluded.position;

-- ---------------------------------------------------------------------------
-- 3. Séances : lundi et mardi au campus (heures calculées à la semaine en cours)
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
      'Techniques de montage et outils',
      'Narration visuelle et rythme',
      'Étalonnage et post-production sonore',
      'Habillage graphique et motion design'
    ] as titles,
    array['Julien Marchand', 'Claire Vasseur', 'Alexandre Dumas', 'Sophie Renard'] as trainers,
    array['Studio Montage 1', 'Salle Création Mac', 'Régie Post-Prod', 'Plateau Tournage'] as rooms
),
slots as (
  select w, d, start_t, end_t, ((w + 3) * 2 + d) % 4 + 1 as module_index
  from generate_series(-3, 5) as w,
    (values (0, time '09:00', time '12:30'), (0, time '13:30', time '17:00'),
            (1, time '09:00', time '12:30'), (1, time '13:30', time '17:00')) as s(d, start_t, end_t)
)
insert into public.sessions (course_id, promotion_id, title, kind, starts_at, ends_at, room, trainer_name, description)
select
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30' then m.ids[1] else m.ids[s.module_index] end,
  'b0000000-0000-4000-8000-000000000001',
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30'
    then 'ECF : Montage d''une capsule documentaire'
    else m.titles[s.module_index] end,
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30' then 'evaluation' else 'cours' end,
  ((ref.monday + s.w * 7 + s.d) + s.start_t) at time zone 'Europe/Paris',
  ((ref.monday + s.w * 7 + s.d) + s.end_t) at time zone 'Europe/Paris',
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30' then m.rooms[1] else m.rooms[s.module_index] end,
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30' then m.trainers[1] else m.trainers[s.module_index] end,
  case when s.w = 2 and s.d = 1 and s.start_t = time '13:30'
    then 'Évaluation pratique en conditions réelles, 3 h 30 sur station de montage dédiée.'
    else 'Séance pratique en studio au campus.' end
from slots s, modules m, ref
where not exists (
  select 1 from public.sessions x where x.promotion_id = 'b0000000-0000-4000-8000-000000000001'
);

-- Atelier transversal
with ref as (
  select date_trunc('week', now() at time zone 'Europe/Paris')::date as monday
)
insert into public.sessions (course_id, promotion_id, title, kind, starts_at, ends_at, room, trainer_name, description)
select * from (
  select
    null::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid, 'Atelier professionnel : Préparer son book et showreel',
    'evenement', ((ref.monday + 10) + time '09:00') at time zone 'Europe/Paris',
    ((ref.monday + 10) + time '12:00') at time zone 'Europe/Paris', 'Amphithéâtre', 'Équipe pédagogique',
    'Conseils pratiques pour structurer sa bande démo et réussir son insertion professionnelle.'
  from ref
) as extra
where not exists (
  select 1 from public.sessions x where x.kind = 'evenement'
    and x.promotion_id = 'b0000000-0000-4000-8000-000000000001'
);

-- ---------------------------------------------------------------------------
-- 4. Périodes en entreprise (rythme 2 jours campus / 3 jours entreprise)
-- ---------------------------------------------------------------------------

with ref as (select date_trunc('week', now() at time zone 'Europe/Paris')::date as monday)
insert into public.company_periods (promotion_id, starts_on, ends_on)
select 'b0000000-0000-4000-8000-000000000001', ref.monday + w * 7 + 2, ref.monday + w * 7 + 4
from ref, generate_series(-3, 5) as w
where not exists (select 1 from public.company_periods where promotion_id = 'b0000000-0000-4000-8000-000000000001');

-- ---------------------------------------------------------------------------
-- 5. Ressources pédagogiques
-- ---------------------------------------------------------------------------

insert into public.materials (id, course_id, title, link_url, visible_from) values
  ('a1000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
    'Guide des raccourcis essentiels Premiere Pro & DaVinci Resolve', 'https://helpx.adobe.com/fr/premiere-pro/using/default-keyboard-shortcuts.html', null),
  ('a1000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001',
    'Fiche pratique : structurer son dossier de projet et dérushage', 'https://www.blackmagicdesign.com/fr/products/davinciresolve/training', null),
  ('a1000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002',
    'Analyse de séquences : rythme, ellipses et raccords dans le cinéma moderne', 'https://www.cnc.fr/', null),
  ('a1000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000003',
    'Normes de diffusion audio : recommandations EBU R128 (-23 LUFS)', 'https://tech.ebu.ch/loudness', null),
  ('a1000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000004',
    'Guide de création d''habillages animés sur After Effects', 'https://helpx.adobe.com/fr/after-effects/tutorials.html', null)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  link_url = excluded.link_url;

-- ---------------------------------------------------------------------------
-- 6. Travail à rendre
-- ---------------------------------------------------------------------------

with ref as (
  select date_trunc('week', now() at time zone 'Europe/Paris')::date as monday
)
insert into public.assignments (id, course_id, promotion_id, title, instructions, due_at, requires_file)
select * from (
  -- En retard : vendredi précédent
  select 'a2000000-0000-4000-8000-000000000001'::uuid, 'c0000000-0000-4000-8000-000000000001'::uuid,
    'b0000000-0000-4000-8000-000000000001'::uuid, 'Dérushage et premier montage (Interview 3 caméras)',
    'Dérushez les médias du tournage plateau et réalisez l''assemblage brut avec timecode incrusté. Déposez votre export vidéo léger (MP4).',
    ((ref.monday - 3) + time '23:59') at time zone 'Europe/Paris', true
  from ref
  union all
  -- Bientôt dû : vendredi de cette semaine
  select 'a2000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000001', 'Étalonnage : scène de dialogue en intérieur nuit',
    'Harmonisez les teintes de peau et appliquez le look cinéma demandé sur les 5 plans fournis. Cochez une fois terminé.',
    ((ref.monday + 4) + time '23:59') at time zone 'Europe/Paris', false
  from ref
  union all
  -- Plus tard : habillage After Effects
  select 'a2000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000004',
    'b0000000-0000-4000-8000-000000000001', 'Habillage complet d''une capsule vidéo (titres et synthés)',
    'Créez l''animation du titre principal (5 sec) et le synthé de présentation de l''invité sous After Effects. Rendez une archive .zip.',
    ((ref.monday + 18) + time '23:59') at time zone 'Europe/Paris', true
  from ref
) as seed_assignments
on conflict (id) do update set
  course_id = excluded.course_id,
  promotion_id = excluded.promotion_id,
  title = excluded.title,
  instructions = excluded.instructions,
  due_at = excluded.due_at,
  requires_file = excluded.requires_file;

-- ---------------------------------------------------------------------------
-- 7. Évaluations
-- ---------------------------------------------------------------------------

with ref as (
  select (date_trunc('week', now() at time zone 'Europe/Paris'))::date as monday
)
insert into public.evaluations (id, course_id, promotion_id, title, held_on, max_score, coefficient, published)
select * from (
  select 'e0000000-0000-4000-8000-000000000001'::uuid, 'c0000000-0000-4000-8000-000000000001'::uuid,
    'b0000000-0000-4000-8000-000000000001'::uuid, 'Épreuve pratique : Montage d''une bande-annonce',
    ref.monday - 14, 20::numeric, 2::numeric, true
  from ref
  union all
  select 'e0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000001', 'Étalonnage colorimétrique et conformité broadcast',
    ref.monday - 7, 20::numeric, 1::numeric, true
  from ref
  union all
  select 'e0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000001', 'Analyse filmique et intentions de montage',
    ref.monday - 1, 20::numeric, 1::numeric, false
  from ref
) as seed_evaluations
on conflict (id) do update set
  course_id = excluded.course_id,
  promotion_id = excluded.promotion_id,
  title = excluded.title,
  held_on = excluded.held_on,
  max_score = excluded.max_score,
  coefficient = excluded.coefficient,
  published = excluded.published;

-- ---------------------------------------------------------------------------
-- 8. Annonces générales et pédagogiques
-- ---------------------------------------------------------------------------

insert into public.announcements (id, promotion_id, title, body, author_name, target_url, cta_label, created_at)
values
  ('d0000000-0000-4000-8000-000000000001', null,
    'Accès aux studios de montage et régies le samedi matin',
    'Les stations de montage Mac et les régies audiovisuelles sont désormais accessibles sur réservation le samedi de 9h à 13h pour vos projets personnels et d''alternance. Rapprochez-vous de l''accueil du campus.',
    'Direction du campus', '/etudiant/ressources', 'Voir les créneaux', now() - interval '2 days'),
  ('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
    'Masterclass exceptionnelle : Le montage de documentaire',
    'Jeudi prochain à 14h en amphithéâtre, nous accueillons Marc Teissier, chef monteur primé, pour une rencontre sur la narration du documentaire contemporain.',
    'Équipe pédagogique', null, null, now() - interval '6 hours')
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  author_name = excluded.author_name,
  target_url = excluded.target_url,
  cta_label = excluded.cta_label;
