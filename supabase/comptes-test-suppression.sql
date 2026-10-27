-- Campus MLK Portail : supprime les comptes de test créés par scripts/test-accounts.mjs.
-- Suppression définitive : profils, rendus et notes de ces comptes partent avec eux
-- (on delete cascade). Les données de démo partagées (formations, séances…) restent.
--
-- 1. Lancer ce script (SQL Editor de Supabase, ou connecteur MCP « execute_sql »).
-- 2. Supprimer le fichier local supabase/comptes-test.local.json.
-- 3. Si des fichiers ont été déposés avec ces comptes (photo de profil, rendus), les effacer
--    depuis Storage dans le tableau de bord : Supabase interdit de les supprimer en SQL.

-- Aperçu de ce qui va être supprimé
select u.email, p.first_name, p.last_name
from auth.users u
left join public.profiles p on p.id = u.id
where u.email like '%@portail-mlk.invalid'
  and u.raw_app_meta_data ->> 'is_test_account' = 'true'
order by u.email;

delete from auth.users
where email like '%@portail-mlk.invalid'
  and raw_app_meta_data ->> 'is_test_account' = 'true';
