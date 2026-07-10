import { NextResponse } from 'next/server';
import { getMyAthleteProfile } from '@/lib/data/athletes';
import { getStravaAuthorizeUrl, isStravaConfigured } from '@/lib/integrations/strava';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isStravaConfigured()) {
    return NextResponse.redirect(`${origin}/athlete/integrations?error=not_configured`);
  }

  const athlete = await getMyAthleteProfile();
  if (!athlete) {
    return NextResponse.redirect(`${origin}/athlete/integrations?error=no_profile`);
  }

  const redirectUri = `${origin}/api/integrations/strava/callback`;
  const state = crypto.randomUUID();

  const response = NextResponse.redirect(getStravaAuthorizeUrl(redirectUri, state));
  response.cookies.set('strava_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
