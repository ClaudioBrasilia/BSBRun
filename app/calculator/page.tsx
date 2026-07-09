'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Calculator, TrendingUp } from 'lucide-react';
import { DISTANCES, calcVDOT, getTrainingPaces, getPerformanceEquivalences, type TrainingPaces } from '@/lib/vdot';
import { parseTimeToSeconds } from '@/lib/time';

interface Result {
  vdot: number;
  paces: TrainingPaces;
  equivalences: Record<string, string>;
}

const distanceOptions = Object.keys(DISTANCES);

export default function CalculatorPage() {
  const [distance, setDistance] = useState('5000m (5K)');
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    setError(null);
    const seconds = parseTimeToSeconds(time);
    if (seconds === null) {
      setError('Tempo inválido. Use o formato mm:ss ou hh:mm:ss (ex: 22:30 ou 1:45:00).');
      setResult(null);
      return;
    }
    const distanceM = DISTANCES[distance];
    const vdot = calcVDOT(distanceM, seconds);
    if (!Number.isFinite(vdot) || vdot <= 0) {
      setError('Não foi possível calcular o VDOT com esses valores.');
      setResult(null);
      return;
    }
    setResult({
      vdot,
      paces: getTrainingPaces(vdot),
      equivalences: getPerformanceEquivalences(vdot),
    });
  };

  const paceRows = result
    ? [
        { label: 'Easy (lento)', value: result.paces.easySlow, hint: 'Corrida fácil / regenerativa' },
        { label: 'Easy (rápido)', value: result.paces.easyFast, hint: 'Limite superior do fácil' },
        { label: 'Maratona (M)', value: result.paces.marathon, hint: 'Ritmo de maratona' },
        { label: 'Threshold (T)', value: result.paces.threshold, hint: 'Limiar / tempo run' },
        { label: 'Interval (I)', value: result.paces.interval, hint: 'VO₂max — tiros longos' },
        { label: 'Repetition 400 (R)', value: result.paces.repetition400, hint: 'Velocidade / economia' },
        { label: 'Repetition 200', value: result.paces.repetition200, hint: 'Tiros curtos' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="container mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">BSBRun</h1>
            <p className="text-xs text-slate-400">Calculadora de VDOT</p>
          </div>
        </Link>
        <Link href="/login" className="text-sm text-slate-300 hover:text-white">
          Entrar
        </Link>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Calculadora de VDOT</h2>
          <p className="text-slate-400">
            Informe o resultado de uma prova recente e descubra seu VDOT, ritmos de treino e tempos equivalentes.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Distância da prova</label>
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
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
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                placeholder="ex: 22:30"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          <button
            onClick={handleCalculate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
          >
            <Calculator className="w-5 h-5" />
            Calcular
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Seu VDOT</span>
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                {result.vdot}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Ritmos de Treino (por km)</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {paceRows.map((row) => (
                  <div key={row.label} className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-slate-400">{row.label}</span>
                      <span className="text-lg font-bold text-white">{row.value}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{row.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Tempos Equivalentes</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.equivalences).map(([name, t]) => (
                  <div key={name} className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">{name}</div>
                    <div className="text-lg font-bold text-white">{t}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Estimativas baseadas no seu VDOT atual, assumindo treino adequado para cada distância.
              </p>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="container mx-auto px-6 py-8 text-center text-slate-500 text-sm">
        <p>Baseado em &quot;Daniels&apos; Running Formula&quot; — Jack Daniels, 3ª Edição</p>
      </footer>
    </div>
  );
}
