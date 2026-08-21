'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { RefreshCw, Save } from 'lucide-react';
import { savePlanToDatabase, type SavePlanResult } from '@/app/coach/athletes/actions';

function SubmitButton({ isSaved }: { isSaved: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shrink-0 disabled:opacity-60 ${
        isSaved ? 'bg-slate-700 hover:bg-slate-600' : 'bg-primary hover:bg-primary/90'
      }`}
    >
      {pending ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : isSaved ? (
        <RefreshCw className="w-4 h-4" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {pending ? (isSaved ? 'Regenerando...' : 'Salvando...') : isSaved ? 'Regenerar' : 'Salvar plano'}
    </button>
  );
}

interface PlanActionBarProps {
  athleteId: string;
  isSaved: boolean;
  hasVdot: boolean;
}

/** Barra de salvar/regenerar o plano, com feedback visível de progresso, sucesso e erro. */
export function PlanActionBar({ athleteId, isSaved, hasVdot }: PlanActionBarProps) {
  const action = savePlanToDatabase.bind(null, athleteId);
  const [state, formAction] = useFormState<SavePlanResult, FormData>(action, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          isSaved &&
          !confirm(
            'Regenerar o plano? Isso recalcula tudo com os dados atuais e apaga treinos marcados como concluídos e edições manuais.'
          )
        ) {
          e.preventDefault();
        }
      }}
      className="glass rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-semibold">{isSaved ? 'Regenerar plano' : 'Salvar plano no banco'}</p>
          <p className="text-xs text-slate-500">
            {isSaved
              ? 'Recalcula tudo a partir dos dados atuais do atleta. Substitui o plano salvo — edições manuais e treinos concluídos serão perdidos.'
              : 'Grava cada treino com data. Com o plano salvo, o atleta marca treinos como concluídos, envia arquivos e você edita sessões.'}
            {!hasVdot && !isSaved && ' Sem VDOT, salva o Programa Iniciante.'}
          </p>
        </div>
        <SubmitButton isSaved={isSaved} />
      </div>

      {state.error && (
        <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {state.error}
        </p>
      )}
      {state.savedAt && !state.error && (
        <p className="mt-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          ✓ Plano {isSaved ? 'regenerado' : 'salvo'} com sucesso! As semanas abaixo já refletem a versão nova.
        </p>
      )}
    </form>
  );
}
