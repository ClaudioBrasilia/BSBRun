-- ============================================================================
-- Timestamp de quando o treino foi marcado como concluído.
-- Necessário para o feed de "Atividade recente" no painel do coach — sem
-- isso não dá pra saber quando (nem ordenar por mais recente).
-- ============================================================================

alter table public.workouts
  add column if not exists completed_at timestamptz;

create index if not exists workouts_completed_at_idx on public.workouts (completed_at desc);
