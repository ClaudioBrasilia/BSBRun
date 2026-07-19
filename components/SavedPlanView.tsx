'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Check, Pencil, Route, TrendingUp, X } from 'lucide-react';
import { PHASE_NAMES } from '@/lib/plan-generator';
import { getTrainingPaces, type TrainingPaces } from '@/lib/vdot';
import { formatSeconds, mondayOfISO, todayISO } from '@/lib/time';
import { completeWorkout, uncompleteWorkout } from '@/app/athlete/(app)/plan/actions';
import { updateSavedWorkout } from '@/app/coach/athletes/actions';
import type { AthleteRow, WorkoutRow } from '@/lib/supabase/types';
import type { DayActivitySummary } from '@/lib/data/strava';

const typeColors: Record<string, string> = {
  E: 'bg-green-500/20 text-green-400',
  L: 'bg-emerald-500/20 text-emerald-300',
  M: 'bg-blue-500/20 text-blue-400',
  T: 'bg-yellow-500/20 text-yellow-400',
  I: 'bg-orange-500/20 text-orange-400',
  R: 'bg-red-500/20 text-red-400',
  Rest: 'bg-slate-600/30 text-slate-400',
};

const DAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function dayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  return DAY_LABELS[dow];
}

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

/**
 * Ritmo alvo calculado com o VDOT ATUAL do atleta (não o da época em que o
 * plano foi salvo): a estrutura do plano fica congelada, mas os ritmos
 * acompanham a evolução — Daniels manda atualizar os paces quando o VDOT
 * muda, sem refazer a periodização.
 */
function targetPace(workout: WorkoutRow, paces: TrainingPaces): string | null {
  switch (workout.type) {
    case 'E':
      return `${paces.easySlow}–${paces.easyFast}/km`;
    case 'L':
      // Longão com bloco M (marcado como qualidade) mostra os dois ritmos.
      return workout.quality
        ? `${paces.easySlow}–${paces.easyFast}/km + bloco M em ${paces.marathon}/km`
        : `${paces.easySlow}–${paces.easyFast}/km`;
    case 'M':
      return `${paces.marathon}/km`;
    case 'T':
      return `${paces.threshold}/km`;
    case 'I':
      return `${paces.interval}/km`;
    case 'R':
      return `${paces.repetition400} por 400m`;
    default:
      return null;
  }
}

function WorkoutRowItem({
  workout,
  mode,
  athleteId,
  paces,
  vdot,
  activities,
}: {
  workout: WorkoutRow;
  mode: 'coach' | 'athlete';
  athleteId: string;
  paces: TrainingPaces | null;
  vdot: number | null;
  activities?: DayActivitySummary[];
}) {
  const [editing, setEditing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [pending, startTransition] = useTransition();
  const isRest = workout.type === 'Rest';

  // Pace do realizado informado manualmente (min/km).
  const realizedPace =
    workout.realized_distance_km && workout.realized_distance_km > 0 && workout.realized_duration_min
      ? formatSeconds((workout.realized_duration_min * 60) / workout.realized_distance_km)
      : null;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg ${isRest ? 'bg-slate-800/30' : 'bg-slate-800/50'} ${
        workout.completed ? 'opacity-70' : ''
      }`}
    >
      <div className="w-20 shrink-0">
        <div className="text-xs text-slate-400">{dayLabel(workout.day)}</div>
        <div className="text-[10px] text-slate-500">{formatShortDate(workout.day)}</div>
      </div>
      <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${typeColors[workout.type] ?? typeColors.Rest}`}>
        {workout.type}
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateSavedWorkout(workout.id, athleteId, formData);
                setEditing(false);
              });
            }}
            className="space-y-2"
          >
            <input
              name="title"
              defaultValue={workout.title ?? ''}
              placeholder="Título"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
            />
            <textarea
              name="description"
              defaultValue={workout.description ?? ''}
              rows={3}
              placeholder="Descrição"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
            <div className="flex items-center gap-2">
              <input
                name="distance_km"
                type="number"
                min="0"
                step="0.5"
                defaultValue={workout.distance_km ?? ''}
                className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
              />
              <span className="text-xs text-slate-500">km</span>
              <button
                type="submit"
                disabled={pending}
                className="ml-auto px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-xs font-semibold rounded-lg"
              >
                {pending ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-2 py-1.5 text-slate-400 hover:text-white"
                aria-label="Cancelar edição"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className={`text-sm font-semibold text-white ${workout.completed ? 'line-through' : ''}`}>
              {workout.title ?? (isRest ? 'Descanso' : 'Treino')}
            </div>
            {!isRest && workout.description && (
              <div className="text-xs text-slate-400 mt-0.5">{workout.description}</div>
            )}
            {!isRest && paces && targetPace(workout, paces) && (
              <div className="text-xs text-sky-300 mt-1">
                Ritmo alvo (VDOT atual {vdot}): {targetPace(workout, paces)}
              </div>
            )}
            {workout.strength && (
              <div className="text-xs text-purple-300 mt-1">
                + Força &amp; prevenção (20–30 min) — exercícios na aba Fortalecimento.
              </div>
            )}
            {workout.realized_distance_km != null && (
              <div className="text-xs text-emerald-300 mt-1">
                ✓ Realizado: {workout.realized_distance_km} km
                {realizedPace ? ` @ ${realizedPace}/km` : ''}
              </div>
            )}
            {activities?.map((a, idx) => (
              <div key={idx} className="text-xs text-emerald-300 mt-1">
                ✓ Realizado (Strava): {a.distanceKm} km{a.pace ? ` @ ${a.pace}/km` : ''}
                {a.name ? ` — ${a.name}` : ''}
              </div>
            ))}
            {completing && (
              <form
                action={(formData) => {
                  startTransition(async () => {
                    await completeWorkout(workout.id, formData);
                    setCompleting(false);
                  });
                }}
                className="mt-2 p-3 bg-slate-900/70 border border-slate-700 rounded-lg space-y-2"
              >
                <p className="text-xs text-slate-400">
                  Como foi o treino? (opcional — deixe em branco para só marcar como concluído)
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    name="distance_km"
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="km"
                    className="w-20 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                  />
                  <input
                    name="duration"
                    placeholder="tempo (ex: 45:30)"
                    className="w-36 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg"
                  >
                    {pending ? 'Salvando...' : 'Concluir treino'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompleting(false)}
                    className="px-2 py-2 text-slate-400 hover:text-white"
                    aria-label="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
      {!editing && mode === 'coach' && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="shrink-0 p-1.5 text-slate-500 hover:text-white"
          aria-label="Editar treino"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {mode === 'athlete' && !isRest && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (workout.completed) {
              startTransition(async () => {
                await uncompleteWorkout(workout.id);
              });
            } else {
              setCompleting(true);
            }
          }}
          className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
            workout.completed
              ? 'bg-green-500/30 border-green-500 text-green-400'
              : 'border-slate-600 text-slate-600 hover:border-green-500 hover:text-green-500'
          } ${pending ? 'opacity-50' : ''}`}
          aria-label={workout.completed ? 'Desmarcar treino concluído' : 'Marcar treino como concluído'}
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface SavedPlanViewProps {
  athlete: AthleteRow;
  workouts: WorkoutRow[];
  mode: 'coach' | 'athlete';
  backHref: string;
  backLabel: string;
  title: string;
  /** Atividades do Strava por dia ("YYYY-MM-DD") para o planejado × realizado. */
  activitiesByDay?: Record<string, DayActivitySummary[]>;
}

export function SavedPlanView({
  athlete,
  workouts,
  mode,
  backHref,
  backLabel,
  title,
  activitiesByDay = {},
}: SavedPlanViewProps) {
  // Agrupa por semana (as linhas já vêm ordenadas por data).
  const weekMap = new Map<number, WorkoutRow[]>();
  for (const w of workouts) {
    const n = w.week_number ?? 0;
    if (!weekMap.has(n)) weekMap.set(n, []);
    weekMap.get(n)!.push(w);
  }
  const weekNumbers = Array.from(weekMap.keys()).sort((a, b) => a - b);
  const totalWeeks = weekNumbers.length > 0 ? Math.max(...weekNumbers) : 0;

  // Semana atual pela data de hoje (segunda a domingo).
  const thisMonday = mondayOfISO(todayISO());
  const currentWeekNumber =
    weekNumbers.find((n) => {
      const first = weekMap.get(n)![0];
      return mondayOfISO(first.day) === thisMonday;
    }) ??
    // Antes do plano começar mostra a 1ª semana; depois do fim, a última.
    (workouts.length > 0 && todayISO() < workouts[0].day ? weekNumbers[0] : weekNumbers[weekNumbers.length - 1]);

  const paces = athlete.vdot ? getTrainingPaces(athlete.vdot) : null;
  const weeklyKm = (n: number) => weekMap.get(n)!.reduce((sum, w) => sum + (w.distance_km ?? 0), 0);
  const weeklyMin = (n: number) => weekMap.get(n)!.reduce((sum, w) => sum + (w.duration_min ?? 0), 0);
  // Semanas medidas por tempo (programa iniciante) mostram minutos, não km.
  const weekTotalLabel = (n: number) => {
    const km = Math.round(weeklyKm(n));
    if (km > 0) return `${km} km`;
    const min = Math.round(weeklyMin(n));
    return min > 0 ? `${min} min` : '';
  };

  const visibleWeeks = mode === 'athlete' ? weekNumbers.filter((n) => n === currentWeekNumber) : weekNumbers;

  const statsCards =
    mode === 'athlete'
      ? [
          { icon: TrendingUp, label: 'VDOT', value: athlete.vdot ?? '—' },
          { icon: Route, label: 'Objetivo', value: athlete.goal_distance ?? '—' },
          { icon: Calendar, label: 'Semana', value: `${currentWeekNumber} de ${totalWeeks}` },
          {
            icon: TrendingUp,
            label: 'Volume desta semana',
            value: currentWeekNumber ? weekTotalLabel(currentWeekNumber) || '—' : '—',
          },
        ]
      : [
          { icon: TrendingUp, label: 'VDOT', value: athlete.vdot ?? '—' },
          { icon: Route, label: 'Objetivo', value: athlete.goal_distance ?? '—' },
          { icon: Calendar, label: 'Duração', value: `${totalWeeks} sem` },
          { icon: Calendar, label: 'Semana atual', value: currentWeekNumber ? `${currentWeekNumber}` : '—' },
        ];

  const paceRows = paces
    ? [
        { label: 'E (fácil)', value: `${paces.easySlow}–${paces.easyFast}/km` },
        { label: 'M (maratona)', value: `${paces.marathon}/km` },
        { label: 'T (limiar)', value: `${paces.threshold}/km` },
        { label: 'I (intervalo)', value: `${paces.interval}/km` },
        { label: 'R (repetição)', value: paces.repetition400, note: 'p/ 400m, não min/km' },
      ]
    : [];

  // Agrupa semanas visíveis por fase para os cabeçalhos.
  const phaseGroups: { phase: number; weeks: number[] }[] = [];
  for (const n of visibleWeeks) {
    const phase = weekMap.get(n)![0].phase ?? 0;
    const last = phaseGroups[phaseGroups.length - 1];
    if (last && last.phase === phase) last.weeks.push(n);
    else phaseGroups.push({ phase, weeks: [n] });
  }

  return (
    <>
      <div className="mb-8">
        <Link href={backHref} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-slate-400 mt-1">
          {mode === 'athlete'
            ? 'Seu treino da semana. Toque no círculo para marcar como concluído.'
            : 'Plano salvo treino a treino — edite qualquer sessão pelo ícone de lápis.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsCards.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xs text-slate-400 mb-1">{s.label}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {paceRows.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Ritmos de treino</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {paceRows.map((p) => (
              <div key={p.label} className="bg-slate-800/50 rounded-xl p-3">
                <div className="text-xs text-slate-400">{p.label}</div>
                <div className="text-sm font-bold text-white">{p.value}</div>
                {p.note && <div className="text-[10px] text-slate-500 mt-0.5">{p.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {phaseGroups.map((group) => (
          <section key={`${group.phase}-${group.weeks[0]}`}>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">
                {group.phase === 0
                  ? 'Programa Iniciante — do zero à corrida contínua'
                  : PHASE_NAMES[group.phase] ?? `Fase ${group.phase}`}
              </h2>
            </div>
            <div className="space-y-4">
              {group.weeks.map((n) => (
                <div
                  key={n}
                  className={`glass rounded-2xl p-5 ${n === currentWeekNumber ? 'ring-1 ring-primary/60' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">Semana {n}</span>
                      {n === currentWeekNumber && (
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">semana atual</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">{weekTotalLabel(n)}</span>
                  </div>
                  <div className="space-y-2">
                    {weekMap.get(n)!.map((w) => (
                      <WorkoutRowItem
                        key={w.id}
                        workout={w}
                        mode={mode}
                        athleteId={athlete.id}
                        paces={paces}
                        vdot={athlete.vdot}
                        activities={activitiesByDay[w.day]}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {mode === 'athlete' && (
        <p className="text-xs text-slate-500 mt-6 text-center">
          As próximas semanas aparecem aqui conforme você avança no treinamento.
        </p>
      )}
    </>
  );
}
