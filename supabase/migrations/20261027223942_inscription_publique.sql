-- Inscription publique : n'importe qui peut créer son compte depuis /inscription, et donc
-- envoyer ses propres métadonnées (raw_user_meta_data). La promotion, qui ouvre l'accès
-- aux données d'une classe, ne doit donc plus y être lue : elle vient uniquement des
-- métadonnées d'application (raw_app_meta_data), que seul le CFA (clé secrète) peut écrire.
-- Sans promotion, le compte reste « en attente de rattachement » jusqu'à ce que le CFA
-- renseigne profiles.promotion_id.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, promotion_id)
  values (
    new.id,
    coalesce(new.email, ''),
    left(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 80),
    left(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), 80),
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
