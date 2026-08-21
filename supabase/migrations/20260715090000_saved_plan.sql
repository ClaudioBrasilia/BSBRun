-- ============================================================================
-- Plano salvo treino a treino na tabela workouts.
--
-- Permite: marcar treino como concluído (atleta), editar treinos individuais
-- (coach), congelar o plano mesmo que os dados do atleta mudem depois, e
-- futuramente cruzar planejado × realizado com o Strava.
-- ============================================================================

-- Colunas extras para guardar o plano gerado por completo.
alter table public.workouts
  add column if not exists title       text,
  add column if not exists week_number int,
  add column if not exists phase       int,
  add column if not exists quality     boolean not null default false,
  add column if not exists strength    boolean not null default false;

create index if not exists workouts_athlete_day_idx on public.workouts (athlete_id, day);

-- Atleta lê os próprios treinos (o coach já tem acesso total via policy existente).
drop policy if exists "Atleta lê os próprios treinos" on public.workouts;
create policy "Atleta lê os próprios treinos"
  on public.workouts for select
  using (
    exists (
      select 1 from public.athletes a
      where a.id = workouts.athlete_id and a.user_id = auth.uid()
    )
  );

-- Atleta atualiza os próprios treinos (usado para marcar como concluído).
drop policy if exists "Atleta atualiza os próprios treinos" on public.workouts;
create policy "Atleta atualiza os próprios treinos"
  on public.workouts for update
  using (
    exists (
      select 1 from public.athletes a
      where a.id = workouts.athlete_id and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.athletes a
      where a.id = workouts.athlete_id and a.user_id = auth.uid()
    )
  );
