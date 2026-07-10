import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';

/**
 * Atualiza a sessão do usuário e protege as rotas privadas.
 * Se o Supabase não estiver configurado, deixa a requisição passar
 * (as próprias páginas protegidas mostram o aviso de configuração).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAthleteJoin = pathname.startsWith('/athlete/join');
  const isProtected = (pathname.startsWith('/coach') || pathname.startsWith('/athlete')) && !isAthleteJoin;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const url = request.nextUrl.clone();
    url.pathname = profile?.role === 'athlete' ? '/athlete/dashboard' : '/coach/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
