'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getMyAthleteProfile } from '@/lib/data/athletes';
import { getStravaConnection } from '@/lib/data/strava';
import { fetchStravaActivities, refreshStravaToken } from '@/lib/integrations/strava';

export interface SyncResult {
  error?: string;
  synced?: number;
}

export async function disconnectStrava() {
  const athlete = await getMyAthleteProfile();
  if (!athlete) return;

  const supabase = createClient();
  await supabase.from('strava_connections').delete().eq('athlete_id', athlete.id);

  revalidatePath('/athlete/integrations');
}

export async function syncStravaActivities(_prev: SyncResult, _formData: FormData): Promise<SyncResult> {
  const athlete = await getMyAthleteProfile();
  if (!athlete) {
    return { error: 'Perfil de atleta não encontrado.' };
  }

  const connection = await getStravaConnection(athlete.id);
  if (!connection) {
    return { error: 'Conecte sua conta Strava primeiro.' };
  }

  const supabase = createClient();
  let accessToken = connection.access_token;
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (connection.expires_at <= nowSeconds) {
    try {
      const refreshed = await refreshStravaToken(connection.refresh_token);
      accessToken = refreshed.access_token;
      await supabase
        .from('strava_connections')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: refreshed.expires_at,
        })
        .eq('athlete_id', athlete.id);
    } catch {
      return { error: 'Não foi possível renovar o acesso ao Strava. Tente reconectar.' };
    }
  }

  let activities;
  try {
    activities = await fetchStravaActivities(accessToken, 30);
  } catch {
    return { error: 'Não foi possível buscar atividades do Strava agora. Tente novamente.' };
  }

  const runs = activities.filter((a) => a.type === 'Run');

  for (const run of runs) {
    await supabase.from('strava_activities').upsert(
      {
        athlete_id: athlete.id,
        strava_activity_id: run.id,
        name: run.name,
        distance_m: run.distance,
        moving_time_s: run.moving_time,
        start_date: run.start_date,
      },
      { onConflict: 'strava_activity_id' }
    );
  }

  revalidatePath('/athlete/integrations');
  return { synced: runs.length };
}
