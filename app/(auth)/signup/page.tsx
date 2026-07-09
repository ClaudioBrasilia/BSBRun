'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Activity, UserPlus } from 'lucide-react';
import { signup, type AuthResult } from '../actions';
import { isSupabaseConfigured } from '@/lib/supabase/config';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition-all"
    >
      <UserPlus className="w-5 h-5" />
      {pending ? 'Criando...' : 'Criar conta'}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState<AuthResult, FormData>(signup, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">BSBRun</h1>
            <p className="text-sm text-slate-400">Crie sua conta de coach</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          <form action={formAction} className="space-y-4">
            {!isSupabaseConfigured && (
              <p className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                O Supabase ainda não está configurado. Consulte o README para adicionar as chaves.
              </p>
            )}
            {state.error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {state.error}
              </p>
            )}
            {state.message && (
              <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                {state.message}
              </p>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Seu nome"
              />
            </div>
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
                minLength={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <SubmitButton />

            <p className="text-center text-sm text-slate-400">
              Já tem conta?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </form>
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
