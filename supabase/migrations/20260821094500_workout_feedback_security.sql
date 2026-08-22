-- Hardening: a função abaixo é usada apenas internamente pelo trigger.
revoke execute on function public.workout_feedback_athlete_matches_workout() from public, anon, authenticated;
