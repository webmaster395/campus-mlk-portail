-- Test d'isolement RLS de l'espace étudiant. À lancer sur une base contenant supabase/seed.sql
-- (SQL Editor de Supabase, ou connecteur MCP « execute_sql »).
--
-- Tout se passe dans une transaction annulée : le bloc se termine volontairement par une
-- exception « RESULTATS {...} » qui affiche le résultat et défait toutes les écritures
-- (comptes fictifs, notes, rendus). Rien ne reste en base.
--
-- Résultat attendu (seed de démo) :
--   A_dwwm      : formations 1, promotions 1, profiles 1, courses 4, sessions 37, materials 5,
--                 assignments 3, evaluations 2, grades 2, announcements 3
--   B_ntc       : formations 1, promotions 1, profiles 1, courses 1, sessions 1, materials 1,
--                 assignments 1, evaluations 0, grades 0, announcements 2
--   C_desactive : tout à 0 sauf profiles 1
--   trigger_profils : promotion lue des métadonnées pour A et B, « null » pour C (uuid invalide)
--   A_depot_devoir_futur « autorisé », A_marque_annonces_lues 1, A_modifie_avatar_de_B_lignes 0,
--   tout le reste « refusé ».

do $$
declare
  ua uuid := '11111111-1111-4111-8111-111111111111';
  ub uuid := '22222222-2222-4222-8222-222222222222';
  uc uuid := '33333333-3333-4333-8333-333333333333';
  r jsonb := '{}'::jsonb;
  n int;
  ctx jsonb;
  label text;
  who uuid;
begin
  -- Comptes fictifs : A et C (désactivé) dans la promo DWWM, B dans la promo NTC.
  -- Le trigger handle_new_user doit créer les profils et lire la promotion des métadonnées.
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
  values
    (ua, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@test.invalid',
      '{"first_name":"Alice","last_name":"Test","promotion_id":"b0000000-0000-4000-8000-000000000001"}', now(), now()),
    (ub, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@test.invalid',
      '{"first_name":"Bruno","last_name":"Test","promotion_id":"b0000000-0000-4000-8000-000000000002"}', now(), now()),
    (uc, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-c@test.invalid',
      '{"first_name":"Chloé","last_name":"Test","promotion_id":"pas-un-uuid"}', now(), now());

  select jsonb_object_agg(email, coalesce(promotion_id::text, 'null')) into ctx from public.profiles where id in (ua, ub, uc);
  r := r || jsonb_build_object('trigger_profils', ctx);

  update public.profiles set promotion_id = 'b0000000-0000-4000-8000-000000000001', deactivated = true where id = uc;
  insert into public.grades (evaluation_id, student_id, score, comment) values
    ('e0000000-0000-4000-8000-000000000001', ua, 15.5, 'Bien'),
    ('e0000000-0000-4000-8000-000000000003', ua, 12, 'Non publiée');
  insert into public.grades (evaluation_id, student_id, result) values
    ('e0000000-0000-4000-8000-000000000002', ua, 'acquis');

  execute 'set local role authenticated';

  foreach who in array array[ua, ub, uc] loop
    perform set_config('request.jwt.claims', jsonb_build_object('sub', who, 'role', 'authenticated')::text, true);
    label := case who when ua then 'A_dwwm' when ub then 'B_ntc' else 'C_desactive' end;
    r := r || jsonb_build_object(label, jsonb_build_object(
      'formations', (select count(*) from public.formations),
      'promotions', (select count(*) from public.promotions),
      'profiles', (select count(*) from public.profiles),
      'courses', (select count(*) from public.courses),
      'sessions', (select count(*) from public.sessions),
      'materials', (select count(*) from public.materials),
      'assignments', (select count(*) from public.assignments),
      'evaluations', (select count(*) from public.evaluations),
      'grades', (select count(*) from public.grades),
      'announcements', (select count(*) from public.announcements),
      'viewer_formation', (select public.student_viewer_context() #>> '{formation,title}')
    ));
  end loop;

  -- Écritures de A
  perform set_config('request.jwt.claims', jsonb_build_object('sub', ua, 'role', 'authenticated')::text, true);

  begin
    insert into public.submissions (assignment_id, student_id, comment) values ('a2000000-0000-4000-8000-000000000003', ua, 'ok');
    r := r || '{"A_depot_devoir_futur":"autorisé"}';
  exception when others then r := r || jsonb_build_object('A_depot_devoir_futur', 'REFUSÉ: ' || sqlerrm); end;

  begin
    insert into public.submissions (assignment_id, student_id, comment) values ('a2000000-0000-4000-8000-000000000001', ua, 'retard');
    r := r || '{"A_depot_devoir_echu":"AUTORISÉ (problème)"}';
  exception when others then r := r || jsonb_build_object('A_depot_devoir_echu', 'refusé'); end;

  begin
    insert into public.submissions (assignment_id, student_id, comment) values ('a2000000-0000-4000-8000-000000000004', ua, 'autre promo');
    r := r || '{"A_depot_autre_promo":"AUTORISÉ (problème)"}';
  exception when others then r := r || jsonb_build_object('A_depot_autre_promo', 'refusé'); end;

  begin
    insert into public.submissions (assignment_id, student_id, comment) values ('a2000000-0000-4000-8000-000000000003', ub, 'usurpation');
    r := r || '{"A_depot_pour_B":"AUTORISÉ (problème)"}';
  exception when others then r := r || jsonb_build_object('A_depot_pour_B', 'refusé'); end;

  begin
    update public.profiles set promotion_id = 'b0000000-0000-4000-8000-000000000002' where id = ua;
    r := r || '{"A_change_sa_promo":"AUTORISÉ (problème)"}';
  exception when others then r := r || jsonb_build_object('A_change_sa_promo', 'refusé'); end;

  begin
    update public.profiles set deactivated = false where id = uc;
    r := r || '{"A_modifie_profil_C":"AUTORISÉ (problème)"}';
  exception when others then r := r || jsonb_build_object('A_modifie_profil_C', 'refusé'); end;

  update public.profiles set announcements_seen_at = now() where id = ua;
  get diagnostics n = row_count;
  r := r || jsonb_build_object('A_marque_annonces_lues', n);

  update public.profiles set avatar_path = 'x' where id = ub;
  get diagnostics n = row_count;
  r := r || jsonb_build_object('A_modifie_avatar_de_B_lignes', n);

  -- Visiteur non connecté
  execute 'reset role';
  execute 'set local role anon';
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin
    select count(*) into n from public.sessions;
    r := r || jsonb_build_object('anon_sessions', n);
  exception when others then r := r || jsonb_build_object('anon_sessions', 'refusé'); end;
  begin
    perform public.student_viewer_context();
    r := r || '{"anon_viewer_context":"AUTORISÉ (problème)"}';
  exception when others then r := r || jsonb_build_object('anon_viewer_context', 'refusé'); end;

  raise exception 'RESULTATS %', r::text;
end $$;
