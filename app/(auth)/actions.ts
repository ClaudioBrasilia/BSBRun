'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export interface AuthResult {
  error?: string;
  message?: string;
}

export async function login(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase ainda não está configurado. Veja o README para adicionar as chaves.' };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const explicitRedirect = String(formData.get('redirectTo') ?? '').trim();

  if (!email || !password) {
    return { error: 'Informe e-mail e senha.' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'E-mail ou senha inválidos.' };
  }

  let redirectTo = explicitRedirect;
  if (!redirectTo) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    redirectTo = profile?.role === 'athlete' ? '/athlete/dashboard' : '/coach/dashboard';
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}

export async function signup(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase ainda não está configurado. Veja o README para adicionar as chaves.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) {
    return { error: 'Preencha nome, e-mail e senha.' };
  }
  if (password.length < 6) {
    return { error: 'A senha precisa ter pelo menos 6 caracteres.' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, role: 'coach' } },
  });

  if (error) {
    return { error: error.message };
  }

  // Se a confirmação de e-mail estiver ligada, não há sessão ainda.
  if (!data.session) {
    return { message: 'Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login.' };
  }

  revalidatePath('/', 'layout');
  redirect('/coach/dashboard');
}

export async function logout() {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
