-- Civilité de l'apprenti (statistiques du CFA). Valeur libre interdite : madame ou monsieur.
alter table public.profiles
  add column gender text check (gender in ('madame', 'monsieur'));

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  civilite text := lower(trim(coalesce(new.raw_user_meta_data ->> 'gender', '')));
begin
  insert into public.profiles (id, email, first_name, last_name, gender, promotion_id)
  values (
    new.id,
    coalesce(new.email, ''),
    left(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 80),
    left(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), 80),
    case when civilite in ('madame', 'monsieur') then civilite else null end,
    (
      select p.id
      from public.promotions p
      where p.id::text = new.raw_app_meta_data ->> 'promotion_id'
    )
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
