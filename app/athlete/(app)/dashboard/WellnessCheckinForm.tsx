'use client';

import { useState, useTransition } from 'react';
import { saveAthleteCheckin } from './actions';

const scales = [
  ['sleep_quality', 'Sono', '1 = péssimo · 5 = excelente'],
  ['energy', 'Energia', '1 = muito baixa · 5 = excelente'],
  ['muscle_soreness', 'Dor muscular', '1 = nenhuma · 5 = muito alta'],
  ['stress', 'Estresse', '1 = baixo · 5 = muito alto'],
  ['motivation', 'Motivação', '1 = muito baixa · 5 = excelente'],
] as const;

export default function WellnessCheckinForm({ athleteId }: { athleteId: string }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setSaved(false);
          setError(null);
          const result = await saveAthleteCheckin(athleteId, formData);
          if (result.error) setError(result.error);
          else setSaved(true);
        });
      }}
      className="glass rounded-2xl p-6"
    >
      <div className="mb-4">
        <h2 className="font-bold text-white">Como você está hoje?</h2>
        <p className="text-xs text-slate-400 mt-1">Um check-in rápido ajuda o coach a interpretar sua resposta aos treinos. Não é diagnóstico.</p>
      </div>
      <div className="space-y-3">
        {scales.map(([name, label, hint]) => (
          <label key={name} className="block">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{label}</span><span className="text-[10px] text-slate-500">{hint}</span>
            </div>
            <select name={name} defaultValue="3" className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white">
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 mt-4 text-xs text-slate-300">
        <input name="illness_symptoms" type="checkbox" className="accent-red-500" /> Estou com sintomas de doença hoje
      </label>
      <textarea name="notes" rows={2} placeholder="Observação opcional" className="mt-3 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-600" />
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {saved && <p className="text-xs text-emerald-400 mt-2">Check-in salvo. O coach poderá considerar estas informações.</p>}
      <button type="submit" disabled={pending} className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold rounded-lg">
        {pending ? 'Salvando...' : 'Salvar check-in'}
      </button>
    </form>
  );
}
