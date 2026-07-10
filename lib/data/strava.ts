import { createClient } from '@/lib/supabase/server';
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
