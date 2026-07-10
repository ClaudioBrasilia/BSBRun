import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getMyAthleteProfile } from '@/lib/data/athletes';
import { exchangeStravaCode } from '@/lib/integrations/strava';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/athlete/integrations?error=denied`);
  }

  const expectedState = cookies().get('strava_oauth_state')?.value;
  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(`${origin}/athlete/integrations?error=invalid_state`);
  }

  const athlete = await getMyAthleteProfile();
  if (!athlete) {
    return NextResponse.redirect(`${origin}/athlete/integrations?error=no_profile`);
  }

  try {
    const tokenData = await exchangeStravaCode(code);
    const supabase = createClient();
    const { error: dbError } = await supabase.from('strava_connections').upsert(
      {
        athlete_id: athlete.id,
        strava_athlete_id: tokenData.athlete?.id ?? 0,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
      },
      { onConflict: 'athlete_id' }
    );
    if (dbError) throw dbError;
  } catch {
    return NextResponse.redirect(`${origin}/athlete/integrations?error=token_exchange`);
  }

  const response = NextResponse.redirect(`${origin}/athlete/integrations?connected=1`);
  response.cookies.delete('strava_oauth_state');
  return response;
}
