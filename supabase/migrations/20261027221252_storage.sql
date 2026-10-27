-- Campus MLK Portail : espaces de fichiers (Supabase Storage), tous privés.
-- L'application sert les fichiers par URL signées de courte durée, jamais en accès public.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- Photos de profil : <user_id>/avatar.<ext>
  ('avatars', 'avatars', false, 2 * 1024 * 1024,
    array['image/jpeg', 'image/png', 'image/webp']),
  -- Ressources de cours déposées par le CFA : <course_id>/<fichier>
  ('materials', 'materials', false, 50 * 1024 * 1024, null),
  -- Rendus des étudiants : <assignment_id>/<student_id>/<fichier>
  ('submissions', 'submissions', false, 20 * 1024 * 1024,
    array[
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp'
    ]);

-- ---------------------------------------------------------------------------
-- avatars : chacun gère uniquement son dossier
-- ---------------------------------------------------------------------------

create policy "Avatars : lire le sien"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Avatars : déposer le sien"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_active_user())
  );

create policy "Avatars : remplacer le sien"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Avatars : supprimer le sien"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------------
-- materials : lecture seule, si la ressource correspondante est visible
-- (la RLS de public.materials s'applique dans la sous-requête)
-- ---------------------------------------------------------------------------

create policy "Ressources : lire celles de sa formation"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'materials'
    and exists (select 1 from public.materials m where m.file_path = storage.objects.name)
  );

-- ---------------------------------------------------------------------------
-- submissions : l'étudiant lit et dépose dans son propre dossier, et ne dépose
-- que pour un devoir de sa promotion avant l'échéance
-- ---------------------------------------------------------------------------

create policy "Rendus : lire les siens"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

create policy "Rendus : déposer avant l'échéance"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and exists (
      select 1
      from public.assignments a
      where a.id::text = (storage.foldername(name))[1]
        and a.promotion_id = (select private.current_promotion_id())
        and a.due_at > now()
    )
  );

create policy "Rendus : supprimer les siens avant l'échéance"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and exists (
      select 1
      from public.assignments a
      where a.id::text = (storage.foldername(name))[1]
        and a.promotion_id = (select private.current_promotion_id())
        and a.due_at > now()
    )
  );
