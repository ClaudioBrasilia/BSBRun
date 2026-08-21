import { createClient } from '@/lib/supabase/server';
import { formatSeconds } from '@/lib/time';
import type { StravaActivityRow, StravaConnectionRow } from '@/lib/supabase/types';

export async function getStravaConnection(athleteId: string): Promise<StravaConnectionRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('strava_connections')
    .select('*')
    .eq('athlete_id', athleteId)
    .single();

  if (error) return null;
  return data as StravaConnectionRow;
}

export async function getStravaActivities(athleteId: string, limit = 20): Promise<StravaActivityRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('strava_activities')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('start_date', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as StravaActivityRow[];
}

/** Resumo de uma atividade para exibir ao lado do treino planejado do dia. */
export interface DayActivitySummary {
  name: string | null;
  distanceKm: number;
  /** Pace médio "m:ss" por km, ou null se não der pra calcular. */
  pace: string | null;
}

/**
 * Atividades do Strava agrupadas por dia ("YYYY-MM-DD"), para cruzar
 * planejado × realizado no plano salvo.
 */
export async function getActivitiesByDay(
  athleteId: string,
  fromDay?: string
): Promise<Record<string, DayActivitySummary[]>> {
  const supabase = createClient();
  let query = supabase
    .from('strava_activities')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('start_date', { ascending: true });
  if (fromDay) query = query.gte('start_date', `${fromDay}T00:00:00Z`);

  const { data, error } = await query;
  if (error) return {};

  const byDay: Record<string, DayActivitySummary[]> = {};
  for (const a of (data ?? []) as StravaActivityRow[]) {
    if (!a.start_date || !a.distance_m || a.distance_m <= 0) continue;
    const day = a.start_date.slice(0, 10);
    const distanceKm = a.distance_m / 1000;
    const pace = a.moving_time_s ? formatSeconds(a.moving_time_s / distanceKm) : null;
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push({ name: a.name, distanceKm: Math.round(distanceKm * 10) / 10, pace });
  }
  return byDay;
}
