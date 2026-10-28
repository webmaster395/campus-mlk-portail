-- Type d'évaluation (partiel, devoir maison…), affiché aux apprentis à côté du titre
alter table public.evaluations
  add column kind text not null default 'autre'
  check (kind in ('partiel', 'devoir_sur_table', 'devoir_maison', 'ecf', 'oral', 'projet', 'autre'));

update public.evaluations set kind = 'ecf' where id = 'e0000000-0000-4000-8000-000000000001';
update public.evaluations set kind = 'devoir_sur_table' where id = 'e0000000-0000-4000-8000-000000000002';
update public.evaluations set kind = 'partiel' where id = 'e0000000-0000-4000-8000-000000000003';
