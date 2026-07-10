'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createAthlete, type AthleteFormResult } from '../actions';
import { DISTANCES } from '@/lib/vdot';
import { RaceInputFields } from '@/components/RaceInputFields';

const distanceOptions = Object.keys(DISTANCES);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition-all"
    >
      <Save className="w-5 h-5" />
      {pending ? 'Salvando...' : 'Salvar atleta'}
    </button>
  );
}

const inputClass =
  'w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary';

export default function NewAthletePage() {
  const [state, formAction] = useFormState<AthleteFormResult, FormData>(createAthlete, {});

  return (
    <>
      <div className="mb-8">
        <Link href="/coach/athletes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-white">Novo Atleta</h1>
        <p className="text-slate-400 mt-1">
          Informe uma prova recente para calcularmos o VDOT automaticamente.
        </p>
      </div>

      <form action={formAction} className="max-w-2xl space-y-6">
        {state.error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {state.error}
          </p>
        )}

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Dados do atleta</h2>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Nome *</label>
            <input name="name" required className={inputClass} placeholder="Nome do atleta" />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sexo</label>
              <select name="sex" defaultValue="" className={inputClass}>
                <option value="">—</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Idade</label>
              <input name="age" type="number" min="0" className={inputClass} placeholder="Ex: 32" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Experiência</label>
              <select name="experience" defaultValue="" className={inputClass}>
                <option value="">—</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediário">Intermediário</option>
                <option value="avançado">Avançado</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Volume semanal (km)</label>
              <input name="weekly_km" type="number" min="0" step="0.1" className={inputClass} placeholder="Ex: 45" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Dias por semana</label>
              <input name="days_per_week" type="number" min="0" max="7" className={inputClass} placeholder="Ex: 5" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Objetivo</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Distância-alvo</label>
              <select name="goal_distance" defaultValue="" className={inputClass}>
                <option value="">—</option>
                {distanceOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Data da prova-alvo</label>
              <input name="goal_date" type="date" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Resultado recente (para o VDOT)</h2>
          <p className="text-xs text-slate-500">
            Não precisa ser a distância-alvo — pode ser qualquer prova, teste ou até um teste de 12 minutos.
            Deixe em branco se ainda não tiver um resultado; você pode adicionar depois.
          </p>
          <RaceInputFields
            onChange={() => {}}
            hiddenNames={{ distanceM: 'race_distance_m', timeSeconds: 'race_time_seconds', label: 'race_distance_label' }}
          />
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Observações</h2>
          <textarea name="notes" rows={3} className={inputClass} placeholder="Histórico de lesões, preferências, etc." />
        </div>

        <div className="flex gap-3">
          <SubmitButton />
          <Link
            href="/coach/athletes"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
