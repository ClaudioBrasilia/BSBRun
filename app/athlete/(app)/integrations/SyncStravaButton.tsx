'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { RefreshCw } from 'lucide-react';
import { syncStravaActivities, type SyncResult } from './actions';

function Button() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm"
    >
      <RefreshCw className={`w-4 h-4 ${pending ? 'animate-spin' : ''}`} />
      {pending ? 'Sincronizando...' : 'Sincronizar'}
    </button>
  );
}

export function SyncStravaButton() {
  const [state, formAction] = useFormState<SyncResult, FormData>(syncStravaActivities, {});

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <Button />
      </form>
      {state.error && <span className="text-xs text-red-400">{state.error}</span>}
      {typeof state.synced === 'number' && (
        <span className="text-xs text-green-400">{state.synced} corrida(s) sincronizada(s)</span>
      )}
    </div>
  );
}
