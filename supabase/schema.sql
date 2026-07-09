-- ============================================================================
-- BSBRun — schema do banco de dados (PostgreSQL / Supabase)
-- Rode este arquivo no SQL Editor do seu projeto Supabase.
-- ============================================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- profiles: 1 linha por usuário autenticado (espelha auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'coach' check (role in ('coach', 'athlete')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Usuários leem o próprio profile" on public.profiles;
create policy "Usuários leem o próprio profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Usuários atualizam o próprio profile" on public.profiles;
create policy "Usuários atualizam o próprio profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Cria o profile automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'coach')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- athletes: atletas gerenciados por um coach
-- ----------------------------------------------------------------------------
create table if not exists public.athletes (
  id                 uuid primary key default uuid_generate_v4(),
  coach_id           uuid not null references auth.users (id) on delete cascade,
  name               text not null,
  sex                text check (sex in ('M', 'F')),
  age                int,
  experience         text check (experience in ('iniciante', 'intermediário', 'avançado')),
  goal_distance      text,
  goal_date          date,
  weekly_km          numeric,
  days_per_week      int,
  race_distance      text,
  race_time_seconds  int,
  vdot               numeric,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists athletes_coach_id_idx on public.athletes (coach_id);

alter table public.athletes enable row level security;

drop policy if exists "Coach gerencia seus atletas" on public.athletes;
create policy "Coach gerencia seus atletas"
  on public.athletes for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

-- ----------------------------------------------------------------------------
-- vdot_history: histórico de VDOT por atleta
-- ----------------------------------------------------------------------------
create table if not exists public.vdot_history (
  id                 uuid primary key default uuid_generate_v4(),
  athlete_id         uuid not null references public.athletes (id) on delete cascade,
  vdot               numeric not null,
  race_distance      text not null,
  race_time_seconds  int not null,
  recorded_at        timestamptz not null default now()
);

create index if not exists vdot_history_athlete_idx on public.vdot_history (athlete_id);

alter table public.vdot_history enable row level security;

drop policy if exists "Coach acessa histórico dos seus atletas" on public.vdot_history;
create policy "Coach acessa histórico dos seus atletas"
  on public.vdot_history for all
  using (
    exists (
      select 1 from public.athletes a
      where a.id = vdot_history.athlete_id and a.coach_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.athletes a
      where a.id = vdot_history.athlete_id and a.coach_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- workouts: treinos planejados/registrados por atleta
-- ----------------------------------------------------------------------------
create table if not exists public.workouts (
  id            uuid primary key default uuid_generate_v4(),
  athlete_id    uuid not null references public.athletes (id) on delete cascade,
  day           date not null,
  type          text not null,
  description   text,
  distance_km   numeric,
  target_pace   text,
  duration_min  int,
  completed     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists workouts_athlete_idx on public.workouts (athlete_id);

alter table public.workouts enable row level security;

drop policy if exists "Coach acessa treinos dos seus atletas" on public.workouts;
create policy "Coach acessa treinos dos seus atletas"
  on public.workouts for all
  using (
    exists (
      select 1 from public.athletes a
      where a.id = workouts.athlete_id and a.coach_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.athletes a
      where a.id = workouts.athlete_id and a.coach_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- updated_at automático em athletes
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists athletes_set_updated_at on public.athletes;
create trigger athletes_set_updated_at
  before update on public.athletes
  for each row execute function public.set_updated_at();
