-- ============================================================================
-- BSBRun — integração com Strava (conexão OAuth + atividades importadas)
-- Rode este arquivo no SQL Editor do seu projeto Supabase (depois das anteriores).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- strava_connections: 1 linha por atleta conectado, guarda os tokens OAuth.
-- Só o próprio atleta (via user_id) acessa — tokens nunca são expostos ao coach.
-- ----------------------------------------------------------------------------
create table if not exists public.strava_connections (
  id                 uuid primary key default uuid_generate_v4(),
  athlete_id         uuid not null unique references public.athletes (id) on delete cascade,
  strava_athlete_id  bigint not null,
  access_token       text not null,
  refresh_token      text not null,
  expires_at         bigint not null, -- epoch em segundos
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.strava_connections enable row level security;

drop policy if exists "Atleta gerencia a própria conexão Strava" on public.strava_connections;
create policy "Atleta gerencia a própria conexão Strava"
  on public.strava_connections for all
  using (
    exists (
      select 1 from public.athletes a
      where a.id = strava_connections.athlete_id and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.athletes a
      where a.id = strava_connections.athlete_id and a.user_id = auth.uid()
    )
  );

drop trigger if exists strava_connections_set_updated_at on public.strava_connections;
create trigger strava_connections_set_updated_at
  before update on public.strava_connections
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- strava_activities: atividades de corrida importadas do Strava.
-- ----------------------------------------------------------------------------
create table if not exists public.strava_activities (
  id                  uuid primary key default uuid_generate_v4(),
  athlete_id          uuid not null references public.athletes (id) on delete cascade,
  strava_activity_id  bigint not null unique,
  name                text,
  distance_m          numeric,
  moving_time_s        int,
  start_date          timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists strava_activities_athlete_idx on public.strava_activities (athlete_id);

alter table public.strava_activities enable row level security;

-- Atleta lê as próprias atividades importadas
drop policy if exists "Atleta lê as próprias atividades Strava" on public.strava_activities;
create policy "Atleta lê as próprias atividades Strava"
  on public.strava_activities for select
  using (
    exists (
      select 1 from public.athletes a
      where a.id = strava_activities.athlete_id and a.user_id = auth.uid()
    )
  );

-- Coach lê as atividades dos seus atletas
drop policy if exists "Coach lê atividades Strava dos seus atletas" on public.strava_activities;
create policy "Coach lê atividades Strava dos seus atletas"
  on public.strava_activities for select
  using (
    exists (
      select 1 from public.athletes a
      where a.id = strava_activities.athlete_id and a.coach_id = auth.uid()
    )
  );
