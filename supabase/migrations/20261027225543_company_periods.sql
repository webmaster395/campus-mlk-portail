-- Périodes en entreprise (rythme de l'alternance) : les jours où les apprentis d'une
-- promotion sont chez leur employeur. Saisies par le CFA, en plages de dates : un rythme
-- régulier (ex. 2 jours au campus, 3 en entreprise) se génère en une requête, voir seed.sql.

create table public.company_periods (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  -- Précision facultative affichée dans le calendrier (ex. « Semaine complète en entreprise »)
  note text,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create index company_periods_promotion_id_starts_on_idx
  on public.company_periods (promotion_id, starts_on);

revoke all on public.company_periods from anon, authenticated;
grant select on public.company_periods to authenticated;

alter table public.company_periods enable row level security;

create policy "Étudiant : les périodes en entreprise de sa promotion"
  on public.company_periods for select to authenticated
  using (promotion_id = (select private.current_promotion_id()));
