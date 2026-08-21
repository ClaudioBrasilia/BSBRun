'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';
import { updateAthleteDetails, registerNewRace, type AthleteFormResult } from '@/app/coach/athletes/actions';
import { DISTANCES } from '@/lib/vdot';
import { RaceInputFields } from '@/components/RaceInputFields';
import type { AthleteRow } from '@/lib/supabase/types';

const distanceOptions = Object.keys(DISTANCES);

const inputClass =
  'w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary';

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition-all"
    >
      <Save className="w-5 h-5" />
      {pending ? pendingLabel : label}
    </button>
  );
}

export function EditAthleteForm({ athlete }: { athlete: AthleteRow }) {
  const updateAction = updateAthleteDetails.bind(null, athlete.id);
  const raceAction = registerNewRace.bind(null, athlete.id);

  const [detailsState, detailsFormAction] = useFormState<AthleteFormResult, FormData>(updateAction, {});
  const [raceState, raceFormAction] = useFormState<AthleteFormResult, FormData>(raceAction, {});

  return (
    <>
      <div className="mb-8">
        <Link href={`/coach/athletes/${athlete.id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-white">Editar {athlete.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <form action={detailsFormAction} className="space-y-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Dados do atleta</h2>

            {detailsState.error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {detailsState.error}
              </p>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome *</label>
              <input name="name" required defaultValue={athlete.name} className={inputClass} />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Sexo</label>
                <select name="sex" defaultValue={athlete.sex ?? ''} className={inputClass}>
                  <option value="">—</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Idade</label>
                <input name="age" type="number" min="0" defaultValue={athlete.age ?? ''} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Experiência</label>
                <select name="experience" defaultValue={athlete.experience ?? ''} className={inputClass}>
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
                <input
                  name="weekly_km"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue={athlete.weekly_km ?? ''}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Dias por semana</label>
                <input
                  name="days_per_week"
                  type="number"
                  min="0"
                  max="7"
                  defaultValue={athlete.days_per_week ?? ''}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Distância-alvo</label>
                <select name="goal_distance" defaultValue={athlete.goal_distance ?? ''} className={inputClass}>
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
                <input
                  name="goal_date"
                  type="date"
                  defaultValue={athlete.goal_date ?? ''}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Início do plano</label>
              <input
                name="plan_start_date"
                type="date"
                defaultValue={athlete.plan_start_date ?? new Date().toISOString().slice(0, 10)}
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-1">
                A semana atual do plano é contada a partir desta data. Alterar reinicia a periodização.
              </p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Observações</label>
              <textarea name="notes" rows={3} defaultValue={athlete.notes ?? ''} className={inputClass} />
            </div>
          </div>

          <SubmitButton label="Salvar dados" pendingLabel="Salvando..." />
        </form>

        <form action={raceFormAction} className="space-y-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-white">Registrar nova prova</h2>
            </div>
            <p className="text-xs text-slate-500">
              VDOT atual: <span className="text-primary font-semibold">{athlete.vdot ?? '—'}</span>. Registrar um novo
              resultado recalcula o VDOT e fica salvo no histórico.
            </p>

            {raceState.error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {raceState.error}
              </p>
            )}

            <RaceInputFields
              onChange={() => {}}
              hiddenNames={{ distanceM: 'race_distance_m', timeSeconds: 'race_time_seconds', label: 'race_distance_label' }}
            />
          </div>

          <SubmitButton label="Salvar nova prova" pendingLabel="Calculando..." />
        </form>
      </div>
    </>
  );
}
