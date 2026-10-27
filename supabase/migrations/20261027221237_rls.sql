-- Campus MLK Portail : droits et Row Level Security de l'espace étudiant.
-- Principe : un étudiant ne lit que ce qui concerne sa promotion (ou sa formation),
-- et n'écrit que ses propres lignes. Le CFA écrit via Studio ou la clé secrète, qui
-- contournent la RLS. Un compte désactivé ne voit plus rien (sauf son propre profil,
-- pour que l'application puisse le rediriger vers /auth/desactive).

-- ---------------------------------------------------------------------------
-- Droits de table : rien pour les visiteurs anonymes, lecture seule par défaut pour
-- les comptes connectés, et quelques écritures colonne par colonne.
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to authenticated;

-- Profil : l'étudiant ne change que sa photo et sa date de lecture des annonces
grant update (avatar_path, announcements_seen_at) on public.profiles to authenticated;

-- Rendus : dépôt et modification (fichier, commentaire), jamais la date de dépôt
grant insert (assignment_id, student_id, file_path, comment) on public.submissions to authenticated;
grant update (file_path, comment) on public.submissions to authenticated;

-- ---------------------------------------------------------------------------
-- Activation de la RLS
-- ---------------------------------------------------------------------------

alter table public.formations enable row level security;
alter table public.promotions enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.sessions enable row level security;
alter table public.materials enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.evaluations enable row level security;
alter table public.grades enable row level security;
alter table public.announcements enable row level security;

-- ---------------------------------------------------------------------------
-- Politiques (auth.uid() et fonctions entre parenthèses : évaluées une fois par requête)
-- ---------------------------------------------------------------------------

create policy "Étudiant : sa formation"
  on public.formations for select to authenticated
  using (id = (select private.current_formation_id()));

create policy "Étudiant : sa promotion"
  on public.promotions for select to authenticated
  using (id = (select private.current_promotion_id()));

create policy "Chacun : son profil"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Chacun : modifie son profil"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()) and not deactivated)
  with check (id = (select auth.uid()));

create policy "Étudiant : les modules de sa formation"
  on public.courses for select to authenticated
  using (formation_id = (select private.current_formation_id()));

create policy "Étudiant : les séances de sa promotion"
  on public.sessions for select to authenticated
  using (promotion_id = (select private.current_promotion_id()));

create policy "Étudiant : les ressources visibles de sa formation"
  on public.materials for select to authenticated
  using (
    (visible_from is null or visible_from <= now())
    and exists (
      select 1
      from public.courses c
      where c.id = materials.course_id
        and c.formation_id = (select private.current_formation_id())
    )
  );

create policy "Étudiant : le travail de sa promotion"
  on public.assignments for select to authenticated
  using (promotion_id = (select private.current_promotion_id()));

create policy "Étudiant : ses rendus"
  on public.submissions for select to authenticated
  using (student_id = (select auth.uid()));

-- Dépôt : pour soi, sur un devoir de sa promotion, avant l'échéance
create policy "Étudiant : dépose un rendu avant l'échéance"
  on public.submissions for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1
      from public.assignments a
      where a.id = submissions.assignment_id
        and a.promotion_id = (select private.current_promotion_id())
        and a.due_at > now()
    )
  );

create policy "Étudiant : modifie son rendu avant l'échéance"
  on public.submissions for update to authenticated
  using (student_id = (select auth.uid()))
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1
      from public.assignments a
      where a.id = submissions.assignment_id
        and a.promotion_id = (select private.current_promotion_id())
        and a.due_at > now()
    )
  );

create policy "Étudiant : les évaluations publiées de sa promotion"
  on public.evaluations for select to authenticated
  using (published and promotion_id = (select private.current_promotion_id()));

create policy "Étudiant : ses notes publiées"
  on public.grades for select to authenticated
  using (
    student_id = (select auth.uid())
    and exists (
      select 1
      from public.evaluations e
      where e.id = grades.evaluation_id
        and e.published
        and e.promotion_id = (select private.current_promotion_id())
    )
  );

create policy "Étudiant : les annonces de sa promotion et du CFA"
  on public.announcements for select to authenticated
  using (
    (promotion_id is null and (select private.is_active_user()))
    or promotion_id = (select private.current_promotion_id())
  );
