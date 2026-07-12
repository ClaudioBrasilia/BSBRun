'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Calculator, TrendingUp } from 'lucide-react';
import { calcVDOT, getTrainingPaces, getPerformanceEquivalences, type TrainingPaces } from '@/lib/vdot';
import { RaceInputFields, type RaceInputResult } from '@/components/RaceInputFields';

interface Result {
  vdot: number;
  paces: TrainingPaces;
  equivalences: Record<string, string>;
}

export default function CalculatorPage() {
  const [race, setRace] = useState<RaceInputResult>({ distanceM: null, timeSeconds: null, label: '', error: null });
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    if (!race.distanceM || !race.timeSeconds) return;
    const vdot = calcVDOT(race.distanceM, race.timeSeconds);
    if (!Number.isFinite(vdot) || vdot <= 0) {
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
        { label: 'Easy (lento)', value: `${result.paces.easySlow}/km`, hint: 'Corrida fácil / regenerativa' },
        { label: 'Easy (rápido)', value: `${result.paces.easyFast}/km`, hint: 'Limite superior do fácil' },
        { label: 'Maratona (M)', value: `${result.paces.marathon}/km`, hint: 'Ritmo de maratona' },
        { label: 'Threshold (T)', value: `${result.paces.threshold}/km`, hint: 'Limiar / tempo run' },
        { label: 'Interval (I)', value: `${result.paces.interval}/km`, hint: 'VO₂max — tiros longos' },
        { label: 'Repetition (R)', value: result.paces.repetition400, hint: 'Velocidade / economia — tempo p/ 400m, não min/km' },
        { label: 'Repetition 200', value: result.paces.repetition200, hint: 'Tiros curtos — tempo p/ 200m, não min/km' },
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
            Nunca correu a distância que você quer treinar? Sem problema — calcule seu VDOT a partir de qualquer
            corrida forte que você já fez, ou de um teste rápido de 12 minutos.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 mb-8">
          <RaceInputFields onChange={setRace} />

          <button
            onClick={handleCalculate}
            disabled={!race.distanceM || !race.timeSeconds}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
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
              <h3 className="text-xl font-bold text-white mb-4">Ritmos de Treino</h3>
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
        <p>Calculadora baseada na metodologia VDOT</p>
      </footer>
    </div>
  );
}
