-- ============================================================================
-- Registro manual do treino realizado (alternativa gratuita ao Strava).
-- Ao marcar um treino como concluído, o atleta pode informar distância e
-- tempo; o app calcula o pace e mostra planejado × realizado.
-- ============================================================================

alter table public.workouts
  add column if not exists realized_distance_km numeric,
  add column if not exists realized_duration_min numeric;
