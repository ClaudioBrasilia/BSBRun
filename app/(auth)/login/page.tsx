'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Activity, LogIn } from 'lucide-react';
import { login, type AuthResult } from '../actions';
import { isSupabaseConfigured } from '@/lib/supabase/config';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition-all"
    >
      <LogIn className="w-5 h-5" />
      {pending ? 'Entrando...' : 'Entrar'}
    </button>
  );
}

function LoginForm() {
  const [state, formAction] = useFormState<AuthResult, FormData>(login, {});
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '';

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {!isSupabaseConfigured && (
        <p className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          O Supabase ainda não está configurado. Consulte o README para adicionar as chaves e habilitar o login.
        </p>
      )}
      {state.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {state.error}
        </p>
      )}

      <div>
        <label className="block text-sm text-slate-400 mb-1">E-mail</label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="voce@email.com"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Senha</label>
        <input
          name="password"
          type="password"
          required
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="••••••••"
        />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-slate-400">
        Não tem conta?{' '}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">BSBRun</h1>
            <p className="text-sm text-slate-400">Entre na sua conta</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
            ← Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}
