import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchStravaActivity, refreshStravaToken } from '@/lib/integrations/strava';

interface StravaWebhookEvent {
  object_type?: string;
  object_id?: number;
  aspect_type?: 'create' | 'update' | 'delete';
  owner_id?: number;
  updates?: { authorized?: boolean; type?: string; private?: boolean };
}

function isValidEvent(event: StravaWebhookEvent): event is StravaWebhookEvent & Required<Pick<StravaWebhookEvent, 'object_type' | 'object_id' | 'aspect_type' | 'owner_id'>> {
  return (
    event.object_type === 'activity' &&
    Number.isSafeInteger(event.object_id) &&
    Number.isSafeInteger(event.owner_id) &&
    ['create', 'update', 'delete'].includes(event.aspect_type ?? '')
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;
  if (!verifyToken || url.searchParams.get('hub.verify_token') !== verifyToken) {
    return NextResponse.json({ error: 'invalid verification token' }, { status: 403 });
  }

  const challenge = url.searchParams.get('hub.challenge');
  if (!challenge || url.searchParams.get('hub.mode') !== 'subscribe') {
    return NextResponse.json({ error: 'invalid challenge' }, { status: 400 });
  }
  return NextResponse.json({ 'hub.challenge': challenge });
}

export async function POST(request: Request) {
  let event: StravaWebhookEvent;
  try {
    event = (await request.json()) as StravaWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  if (!isValidEvent(event)) return NextResponse.json({ error: 'ignored' }, { status: 200 });

  const admin = createAdminClient();
  if (!admin) {
    console.error('Strava webhook sem SUPABASE_SERVICE_ROLE_KEY configurada.');
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
  }

  const { data: connection, error: connectionError } = await admin
    .from('strava_connections')
    .select('athlete_id, strava_athlete_id, access_token, refresh_token, expires_at')
    .eq('strava_athlete_id', event.owner_id)
    .maybeSingle();

  if (connectionError || !connection) {
    // A atividade de um atleta não conectado a esta instalação não precisa ser retentada.
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (event.aspect_type === 'delete' || event.updates?.type && event.updates.type !== 'Run') {
    await admin
      .from('strava_activities')
      .delete()
      .eq('athlete_id', connection.athlete_id)
      .eq('strava_activity_id', event.object_id);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let accessToken = connection.access_token;
  if (connection.expires_at <= Math.floor(Date.now() / 1000)) {
    try {
      const refreshed = await refreshStravaToken(connection.refresh_token);
      accessToken = refreshed.access_token;
      await admin
        .from('strava_connections')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: refreshed.expires_at,
        })
        .eq('athlete_id', connection.athlete_id);
    } catch {
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }

  try {
    const activity = await fetchStravaActivity(accessToken, event.object_id);
    if (activity.type !== 'Run') {
      await admin
        .from('strava_activities')
        .delete()
        .eq('athlete_id', connection.athlete_id)
        .eq('strava_activity_id', event.object_id);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { error } = await admin.from('strava_activities').upsert(
      {
        athlete_id: connection.athlete_id,
        strava_activity_id: activity.id,
        name: activity.name,
        distance_m: activity.distance,
        moving_time_s: activity.moving_time,
        start_date: activity.start_date,
      },
      { onConflict: 'strava_activity_id' }
    );
    if (error) console.error('Falha ao persistir atividade recebida pelo webhook:', error.message);
  } catch (error) {
    console.error('Falha ao buscar atividade recebida pelo webhook:', error);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
