'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { UserPlus } from 'lucide-react';
import { joinAsAthlete } from './actions';
import type { AuthResult } from '@/app/(auth)/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition-all"
    >
      <UserPlus className="w-5 h-5" />
      {pending ? 'Criando...' : 'Criar minha conta'}
    </button>
  );
}

export function JoinForm({ code, athleteName }: { code: string; athleteName: string }) {
  const [state, formAction] = useFormState<AuthResult, FormData>(joinAsAthlete, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="name" value={athleteName} />

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
    </form>
  );
}
