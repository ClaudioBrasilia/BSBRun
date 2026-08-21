-- BSBRun — feedback pós-treino e carga interna por session-RPE
-- A carga é calculada no servidor: duração realizada (min) × RPE (0–10).

create table if not exists public.workout_feedback (
  id                    uuid primary key default uuid_generate_v4(),
  workout_id            uuid not null unique references public.workouts (id) on delete cascade,
  athlete_id            uuid not null references public.athletes (id) on delete cascade,
  session_rpe           smallint not null check (session_rpe between 0 and 10),
  pain_score            smallint not null default 0 check (pain_score between 0 and 10),
  pain_changed_mechanics boolean not null default false,
  internal_load         numeric not null default 0 check (internal_load >= 0),
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists workout_feedback_athlete_created_idx
  on public.workout_feedback (athlete_id, created_at desc);

create index if not exists workout_feedback_workout_idx
  on public.workout_feedback (workout_id);

alter table public.workout_feedback enable row level security;

-- O vínculo athlete_id precisa corresponder ao atleta do treino.
create or replace function public.workout_feedback_athlete_matches_workout()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.workouts w
    where w.id = new.workout_id and w.athlete_id = new.athlete_id
  ) then
    raise exception 'O feedback não corresponde ao atleta do treino';
  end if;
  return new;
end;
$$;

drop trigger if exists workout_feedback_athlete_matches_workout_trigger on public.workout_feedback;
create trigger workout_feedback_athlete_matches_workout_trigger
before insert or update on public.workout_feedback
for each row execute function public.workout_feedback_athlete_matches_workout();

drop policy if exists "Atleta lê seus feedbacks" on public.workout_feedback;
create policy "Atleta lê seus feedbacks"
  on public.workout_feedback for select
  using (
    exists (
      select 1 from public.athletes a
      where a.id = workout_feedback.athlete_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Atleta registra seus feedbacks" on public.workout_feedback;
create policy "Atleta registra seus feedbacks"
  on public.workout_feedback for insert
  with check (
    exists (
      select 1 from public.athletes a
      where a.id = workout_feedback.athlete_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Atleta atualiza seus feedbacks" on public.workout_feedback;
create policy "Atleta atualiza seus feedbacks"
  on public.workout_feedback for update
  using (
    exists (
      select 1 from public.athletes a
      where a.id = workout_feedback.athlete_id and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.athletes a
      where a.id = workout_feedback.athlete_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Coach acessa feedbacks dos seus atletas" on public.workout_feedback;
create policy "Coach acessa feedbacks dos seus atletas"
  on public.workout_feedback for all
  using (
    exists (
      select 1 from public.athletes a
      where a.id = workout_feedback.athlete_id and a.coach_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.athletes a
      where a.id = workout_feedback.athlete_id and a.coach_id = auth.uid()
    )
  );


drop policy if exists "Atleta exclui seus feedbacks" on public.workout_feedback;
create policy "Atleta exclui seus feedbacks"
  on public.workout_feedback for delete
  using (
    exists (
      select 1 from public.athletes a
      where a.id = workout_feedback.athlete_id and a.user_id = auth.uid()
    )
  );
