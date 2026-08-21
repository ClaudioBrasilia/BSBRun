-- BSBRun — check-in diário de bem-estar e recuperação

create table if not exists public.athlete_checkins (
  id                   uuid primary key default uuid_generate_v4(),
  athlete_id           uuid not null references public.athletes (id) on delete cascade,
  checkin_date         date not null default current_date,
  sleep_quality        smallint not null check (sleep_quality between 1 and 5),
  energy               smallint not null check (energy between 1 and 5),
  muscle_soreness      smallint not null check (muscle_soreness between 1 and 5),
  stress               smallint not null check (stress between 1 and 5),
  motivation           smallint not null check (motivation between 1 and 5),
  illness_symptoms     boolean not null default false,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (athlete_id, checkin_date)
);

create index if not exists athlete_checkins_athlete_date_idx
  on public.athlete_checkins (athlete_id, checkin_date desc);

alter table public.athlete_checkins enable row level security;

drop policy if exists "Atleta lê seus check-ins" on public.athlete_checkins;
create policy "Atleta lê seus check-ins"
  on public.athlete_checkins for select
  using (exists (select 1 from public.athletes a where a.id = athlete_checkins.athlete_id and a.user_id = auth.uid()));

drop policy if exists "Atleta registra seus check-ins" on public.athlete_checkins;
create policy "Atleta registra seus check-ins"
  on public.athlete_checkins for insert
  with check (exists (select 1 from public.athletes a where a.id = athlete_checkins.athlete_id and a.user_id = auth.uid()));

drop policy if exists "Atleta atualiza seus check-ins" on public.athlete_checkins;
create policy "Atleta atualiza seus check-ins"
  on public.athlete_checkins for update
  using (exists (select 1 from public.athletes a where a.id = athlete_checkins.athlete_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.athletes a where a.id = athlete_checkins.athlete_id and a.user_id = auth.uid()));

drop policy if exists "Coach acessa check-ins dos seus atletas" on public.athlete_checkins;
create policy "Coach acessa check-ins dos seus atletas"
  on public.athlete_checkins for all
  using (exists (select 1 from public.athletes a where a.id = athlete_checkins.athlete_id and a.coach_id = auth.uid()))
  with check (exists (select 1 from public.athletes a where a.id = athlete_checkins.athlete_id and a.coach_id = auth.uid()));
