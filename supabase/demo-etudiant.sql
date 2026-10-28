-- Campus MLK Portail : rattache un compte étudiant de test à la promotion de démo (Monteur audiovisuel).
--
-- 1. Créer le compte : scripts/test-accounts.mjs (comptes de test) ou, dans Supabase,
--    Authentication > Users > Add user > Create new user (cocher « Auto Confirm User »).
-- 2. Lancer ce script dans SQL Editor.
--
-- Effet : identité et entreprise de démo, promotion Monteur Audiovisuel 2026-2027,
-- un travail rendu, deux évaluations notées, et deux annonces non lues.

with student as (
  select id from public.profiles where email = 'ines.martin@portail-mlk.invalid'
),
profile as (
  update public.profiles p
  set
    first_name = 'Inès',
    last_name = 'Martin',
    company_name = 'Studio Pixel & Co',
    promotion_id = 'b0000000-0000-4000-8000-000000000001',
    deactivated = false,
    announcements_seen_at = now() - interval '3 days'
  from student
  where p.id = student.id
  returning p.id
),
submission as (
  insert into public.submissions (assignment_id, student_id, comment, submitted_at)
  select 'a2000000-0000-4000-8000-000000000002', id, 'Étalonnage terminé avec export proxy.', now() - interval '1 day'
  from profile
  on conflict (assignment_id, student_id) do update set
    comment = excluded.comment,
    submitted_at = excluded.submitted_at
  returning id
),
grade_rows as (
  insert into public.grades (evaluation_id, student_id, score, result, comment)
  select g.evaluation_id, profile.id, g.score, g.result, g.comment
  from profile,
    (values
      ('e0000000-0000-4000-8000-000000000001'::uuid, 16.5::numeric, null::text, 'Excellente gestion du rythme narratif et raccords sonores fluides.'),
      ('e0000000-0000-4000-8000-000000000002'::uuid, 14::numeric, 'acquis', 'Bonne conformité aux normes broadcast EBU R128.'),
      ('e0000000-0000-4000-8000-000000000003'::uuid, 11::numeric, null::text, 'Note non publiée : ne doit pas apparaître.')
    ) as g(evaluation_id, score, result, comment)
  on conflict (evaluation_id, student_id) do update set
    score = excluded.score,
    result = excluded.result,
    comment = excluded.comment
  returning id
)
select
  (select count(*) from profile) as profil_mis_a_jour,
  (select count(*) from submission) as rendus_ajoutes,
  (select count(*) from grade_rows) as notes_ajoutees;
