'use client';

import { useEffect, useState } from 'react';
import { DISTANCES } from '@/lib/vdot';
import { parseTimeToSeconds } from '@/lib/time';

export type RaceMode = 'table' | 'custom' | 'cooper';

export interface RaceInputResult {
  distanceM: number | null;
  timeSeconds: number | null;
  label: string;
  error: string | null;
}

interface RaceInputFieldsProps {
  onChange: (result: RaceInputResult) => void;
  /** Se informado, renderiza inputs escondidos com esses nomes (para enviar via <form> a uma server action). */
  hiddenNames?: { distanceM: string; timeSeconds: string; label: string };
}

const distanceOptions = Object.keys(DISTANCES);
const COOPER_SECONDS = 12 * 60;

const inputClass =
  'w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary';

const tabClass = (active: boolean) =>
  `flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
    active ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
  }`;

export function RaceInputFields({ onChange, hiddenNames }: RaceInputFieldsProps) {
  const [mode, setMode] = useState<RaceMode>('table');

  const [tableDistance, setTableDistance] = useState(distanceOptions[3] ?? distanceOptions[0]);
  const [tableTime, setTableTime] = useState('');

  const [customKm, setCustomKm] = useState('');
  const [customTime, setCustomTime] = useState('');

  const [cooperMeters, setCooperMeters] = useState('');

  const [result, setResult] = useState<RaceInputResult>({
    distanceM: null,
    timeSeconds: null,
    label: '',
    error: null,
  });

  useEffect(() => {
    let next: RaceInputResult;

    if (mode === 'table') {
      const seconds = tableTime.trim() ? parseTimeToSeconds(tableTime) : null;
      if (!tableTime.trim()) {
        next = { distanceM: null, timeSeconds: null, label: '', error: null };
      } else if (seconds === null) {
        next = { distanceM: null, timeSeconds: null, label: '', error: 'Tempo inválido. Use mm:ss ou hh:mm:ss.' };
      } else {
        next = { distanceM: DISTANCES[tableDistance], timeSeconds: seconds, label: tableDistance, error: null };
      }
    } else if (mode === 'custom') {
      const km = Number(customKm.replace(',', '.'));
      const seconds = customTime.trim() ? parseTimeToSeconds(customTime) : null;
      if (!customKm.trim() && !customTime.trim()) {
        next = { distanceM: null, timeSeconds: null, label: '', error: null };
      } else if (!Number.isFinite(km) || km <= 0) {
        next = { distanceM: null, timeSeconds: null, label: '', error: 'Informe uma distância válida em km.' };
      } else if (seconds === null) {
        next = { distanceM: null, timeSeconds: null, label: '', error: 'Tempo inválido. Use mm:ss ou hh:mm:ss.' };
      } else {
        next = {
          distanceM: km * 1000,
          timeSeconds: seconds,
          label: `${km} km (distância livre)`,
          error: null,
        };
      }
    } else {
      const meters = Number(cooperMeters.replace(',', '.'));
      if (!cooperMeters.trim()) {
        next = { distanceM: null, timeSeconds: null, label: '', error: null };
      } else if (!Number.isFinite(meters) || meters <= 0) {
        next = { distanceM: null, timeSeconds: null, label: '', error: 'Informe a distância percorrida em metros.' };
      } else {
        next = {
          distanceM: meters,
          timeSeconds: COOPER_SECONDS,
          label: 'Teste de 12 minutos (Cooper)',
          error: null,
        };
      }
    }

    setResult(next);
    onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tableDistance, tableTime, customKm, customTime, cooperMeters]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('table')} className={tabClass(mode === 'table')}>
          Já corri essa distância
        </button>
        <button type="button" onClick={() => setMode('custom')} className={tabClass(mode === 'custom')}>
          Distância livre
        </button>
        <button type="button" onClick={() => setMode('cooper')} className={tabClass(mode === 'cooper')}>
          Teste de 12 min
        </button>
      </div>

      {mode === 'table' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Distância da prova</label>
            <select value={tableDistance} onChange={(e) => setTableDistance(e.target.value)} className={inputClass}>
              {distanceOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tempo (mm:ss ou hh:mm:ss)</label>
            <input
              value={tableTime}
              onChange={(e) => setTableTime(e.target.value)}
              placeholder="ex: 22:30"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {mode === 'custom' && (
        <div>
          <p className="text-xs text-slate-500 mb-3">
            Use quando você já correu forte (teste ou treino) numa distância que não é uma prova oficial — ex: 5,2 km no
            parque.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Distância percorrida (km)</label>
              <input
                value={customKm}
                onChange={(e) => setCustomKm(e.target.value)}
                placeholder="ex: 5.2"
                inputMode="decimal"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tempo (mm:ss ou hh:mm:ss)</label>
              <input
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="ex: 24:10"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {mode === 'cooper' && (
        <div>
          <p className="text-xs text-slate-500 mb-3">
            Ideal se você nunca correu nenhuma distância cronometrada: corra o mais forte que aguentar durante{' '}
            <strong className="text-slate-300">12 minutos</strong> (numa pista ou percurso plano) e informe quantos
            metros percorreu.
          </p>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Distância percorrida em 12 min (metros)</label>
            <input
              value={cooperMeters}
              onChange={(e) => setCooperMeters(e.target.value)}
              placeholder="ex: 2400"
              inputMode="numeric"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {result.error && <p className="text-sm text-red-400">{result.error}</p>}

      {hiddenNames && (
        <>
          <input type="hidden" name={hiddenNames.distanceM} value={result.distanceM ?? ''} />
          <input type="hidden" name={hiddenNames.timeSeconds} value={result.timeSeconds ?? ''} />
          <input type="hidden" name={hiddenNames.label} value={result.label} />
        </>
      )}
    </div>
  );
}
