-- Campus MLK Portail : schéma initial de l'espace étudiant (phase 1).
-- Les données sont saisies par le CFA dans Supabase Studio tant que l'espace gestion n'existe pas.
-- Horodatages en timestamptz, affichés en Europe/Paris côté application.

-- Fonctions internes : schéma non exposé par l'API (PostgREST), donc impossible à appeler en RPC.
create schema if not exists private;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Référentiel : formations et promotions
-- ---------------------------------------------------------------------------

-- Les titres professionnels proposés par le CFA
create table public.formations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  level smallint check (level between 3 and 7),
  rncp_code text,
  created_at timestamptz not null default now()
);

-- Une cohorte d'apprentis suivant une formation sur une période donnée
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid not null references public.formations (id) on delete restrict,
  label text not null,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  check (ends_on > starts_on)
);
create index promotions_formation_id_idx on public.promotions (formation_id);

-- ---------------------------------------------------------------------------
-- Comptes
-- ---------------------------------------------------------------------------

-- Une ligne par compte, créée automatiquement à la création de l'utilisateur (voir trigger plus bas)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null,
  avatar_path text,
  -- Un seul rôle en phase 1 ; les espaces enseignant et gestion ajouteront leurs valeurs
  role text not null default 'student' check (role in ('student')),
  promotion_id uuid references public.promotions (id) on delete set null,
  company_name text,
  deactivated boolean not null default false,
  -- Les annonces publiées après cette date sont « nouvelles » pour l'étudiant
  announcements_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_promotion_id_idx on public.profiles (promotion_id);

-- ---------------------------------------------------------------------------
-- Pédagogie
-- ---------------------------------------------------------------------------

-- Un module ou bloc de compétences d'une formation
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid not null references public.formations (id) on delete cascade,
  title text not null,
  description text not null default '',
  objectives text[] not null default '{}',
  competency_block text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index courses_formation_id_position_idx on public.courses (formation_id, position);

-- Une séance planifiée pour une promotion (cours, évaluation ou événement sans module)
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete set null,
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  title text not null,
  kind text not null default 'cours' check (kind in ('cours', 'evaluation', 'evenement')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  room text,
  trainer_name text,
  description text not null default '',
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index sessions_promotion_id_starts_at_idx on public.sessions (promotion_id, starts_at);
create index sessions_course_id_idx on public.sessions (course_id);

-- Une ressource : fichier déposé dans le bucket « materials », ou lien externe
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  title text not null,
  file_path text,
  link_url text check (link_url ~ '^https?://'),
  -- Vide = visible tout de suite ; sinon la ressource apparaît à cette date
  visible_from timestamptz,
  created_at timestamptz not null default now(),
  check ((file_path is null) <> (link_url is null))
);
create index materials_course_id_idx on public.materials (course_id);
create index materials_session_id_idx on public.materials (session_id);

-- Le travail à rendre par une promotion
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  title text not null,
  instructions text not null default '',
  due_at timestamptz not null,
  requires_file boolean not null default false,
  created_at timestamptz not null default now()
);
create index assignments_promotion_id_due_at_idx on public.assignments (promotion_id, due_at);
create index assignments_course_id_idx on public.assignments (course_id);

-- Le rendu d'un étudiant (un seul par devoir, modifiable jusqu'à l'échéance)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  file_path text,
  comment text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);
create index submissions_student_id_idx on public.submissions (student_id);

-- ---------------------------------------------------------------------------
-- Évaluations et notes
-- ---------------------------------------------------------------------------

-- Une évaluation (ECF, devoir sur table…) ; invisible des étudiants tant qu'elle n'est pas publiée
create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  title text not null,
  held_on date not null,
  max_score numeric(5, 2) not null default 20 check (max_score > 0),
  coefficient numeric(4, 2) not null default 1 check (coefficient > 0),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create index evaluations_promotion_id_idx on public.evaluations (promotion_id);
create index evaluations_course_id_idx on public.evaluations (course_id);

-- Le résultat d'un étudiant : note chiffrée, résultat par compétence, ou les deux
create table public.grades (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  score numeric(5, 2) check (score >= 0),
  result text check (result in ('acquis', 'en_cours', 'non_acquis')),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (evaluation_id, student_id),
  check (score is not null or result is not null)
);
create index grades_student_id_idx on public.grades (student_id);

-- ---------------------------------------------------------------------------
-- Communication
-- ---------------------------------------------------------------------------

-- Annonce du CFA : à une promotion, ou à tout le CFA quand promotion_id est vide
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid references public.promotions (id) on delete cascade,
  title text not null,
  body text not null,
  author_name text not null default 'MLK Campus',
  -- Lien interne uniquement (ex. /etudiant/travail), jamais vers un autre site
  target_url text check (target_url ~ '^/[^/]'),
  cta_label text,
  created_at timestamptz not null default now()
);
create index announcements_promotion_id_created_at_idx
  on public.announcements (promotion_id, created_at desc);
create index announcements_created_at_idx on public.announcements (created_at desc);

-- ---------------------------------------------------------------------------
-- Fonctions et triggers
-- ---------------------------------------------------------------------------

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function private.set_updated_at();

-- Crée le profil à partir des métadonnées passées à l'invitation (prénom, nom, promotion).
-- Une promotion inconnue est ignorée plutôt que de bloquer la création du compte.
create function private.handle_new_user()
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
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    (
      select p.id
      from public.promotions p
      where p.id::text = new.raw_user_meta_data ->> 'promotion_id'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- La promotion de la personne connectée, ou null si son compte est désactivé.
-- security definer : lit profiles sans repasser par sa RLS (évite la récursion).
create function private.current_promotion_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.promotion_id
  from public.profiles p
  where p.id = auth.uid() and not p.deactivated
$$;

-- La formation suivie par la personne connectée (via sa promotion)
create function private.current_formation_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select pr.formation_id
  from public.promotions pr
  where pr.id = private.current_promotion_id()
$$;

-- Vrai si la personne connectée a un profil actif
create function private.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and not p.deactivated
  )
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.current_promotion_id() from public, anon;
revoke all on function private.current_formation_id() from public, anon;
revoke all on function private.is_active_user() from public, anon;
grant execute on function private.current_promotion_id() to authenticated;
grant execute on function private.current_formation_id() to authenticated;
grant execute on function private.is_active_user() to authenticated;

-- Contexte de la personne connectée en un seul appel (layout de l'espace étudiant).
-- security invoker : ne renvoie que ce que la RLS laisse voir.
create function public.student_viewer_context()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'email', p.email,
    'avatar_path', p.avatar_path,
    'company_name', p.company_name,
    'deactivated', p.deactivated,
    'created_at', p.created_at,
    'announcements_seen_at', p.announcements_seen_at,
    'promotion', (
      select jsonb_build_object(
        'id', pr.id, 'label', pr.label, 'starts_on', pr.starts_on, 'ends_on', pr.ends_on
      )
      from public.promotions pr
      where pr.id = p.promotion_id
    ),
    'formation', (
      select jsonb_build_object('id', f.id, 'title', f.title, 'level', f.level)
      from public.promotions pr
      join public.formations f on f.id = pr.formation_id
      where pr.id = p.promotion_id
    ),
    'unread_announcements', (
      select count(*)
      from public.announcements a
      where a.created_at > p.announcements_seen_at
    )
  )
  from public.profiles p
  where p.id = auth.uid()
$$;

revoke all on function public.student_viewer_context() from public, anon;
grant execute on function public.student_viewer_context() to authenticated;
