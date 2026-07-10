'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { AuthResult } from '@/app/(auth)/actions';

export async function joinAsAthlete(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase ainda não está configurado.' };
  }

  const code = String(formData.get('code') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!code) {
    return { error: 'Convite inválido ou expirado.' };
  }
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
    options: { data: { full_name: name, role: 'athlete', invite_code: code } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message: 'Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login — seu perfil já estará vinculado.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/athlete/dashboard');
}
