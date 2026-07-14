-- ============================================================================
-- Data de início do plano de treino.
--
-- Sem uma âncora fixa, o plano era regenerado a cada acesso com o horizonte
-- encolhendo até a prova — e a "semana atual" era sempre a semana 1 (Fase
-- Base). Com plan_start_date, o plano fica estável e a semana atual avança
-- de verdade conforme o tempo passa.
-- ============================================================================

alter table public.athletes
  add column if not exists plan_start_date date;

-- Atletas existentes: assume que o treino começou quando foram cadastrados.
update public.athletes
  set plan_start_date = created_at::date
  where plan_start_date is null;
