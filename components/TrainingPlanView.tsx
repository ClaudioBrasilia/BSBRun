import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Route } from 'lucide-react';
import { generatePlan, weeksUntil, type WorkoutType, type PlannedWeek } from '@/lib/plan-generator';
import type { AthleteRow } from '@/lib/supabase/types';

const typeColors: Record<WorkoutType, string> = {
  E: 'bg-green-500/20 text-green-400',
  L: 'bg-emerald-500/20 text-emerald-300',
  M: 'bg-blue-500/20 text-blue-400',
  T: 'bg-yellow-500/20 text-yellow-400',
  I: 'bg-orange-500/20 text-orange-400',
  R: 'bg-red-500/20 text-red-400',
  Rest: 'bg-slate-600/30 text-slate-400',
};

function WeekCard({ week }: { week: PlannedWeek }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">Semana {week.weekNumber}</span>
          {week.isRecovery && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">recuperação</span>
          )}
          {week.isTaper && (
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">polimento</span>
          )}
        </div>
        <span className="text-sm text-slate-400">{week.totalKm} km</span>
      </div>

      <div className="space-y-2">
        {week.workouts.map((w) => (
          <div
            key={w.day}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              w.type === 'Rest' ? 'bg-slate-800/30' : 'bg-slate-800/50'
            }`}
          >
            <div className="w-20 shrink-0">
              <div className="text-xs text-slate-400">{w.dayName}</div>
            </div>
            <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${typeColors[w.type]}`}>{w.type}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{w.title}</div>
              {w.type !== 'Rest' && <div className="text-xs text-slate-400 mt-0.5">{w.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrainingPlanViewProps {
  athlete: AthleteRow;
  backHref: string;
  backLabel: string;
  title: string;
  /**
   * "full" mostra a periodização inteira (uso do coach).
   * "currentWeek" mostra só a semana atual, sem revelar o plano completo
   * (uso do atleta — evita que ele copie tudo e não precise mais do coach).
   */
  scope?: 'full' | 'currentWeek';
}

export function TrainingPlanView({ athlete, backHref, backLabel, title, scope = 'full' }: TrainingPlanViewProps) {
  if (!athlete.vdot) {
    return (
      <>
        <Link href={backHref} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-slate-400">
            Ainda não há VDOT calculado. É preciso informar uma prova recente para gerar o plano.
          </p>
        </div>
      </>
    );
  }

  const totalWeeks = weeksUntil(athlete.goal_date);
  const plan = generatePlan({
    vdot: athlete.vdot,
    goalDistance: athlete.goal_distance ?? '10000m (10K)',
    weeklyKm: athlete.weekly_km,
    daysPerWeek: athlete.days_per_week,
    experience: athlete.experience,
    totalWeeks,
  });

  const currentWeek = plan.weeks[0];

  const paceRows: { label: string; value: string; note?: string }[] = [
    { label: 'E (fácil)', value: `${plan.paces.easySlow}–${plan.paces.easyFast}/km` },
    { label: 'M (maratona)', value: `${plan.paces.marathon}/km` },
    { label: 'T (limiar)', value: `${plan.paces.threshold}/km` },
    { label: 'I (intervalo)', value: `${plan.paces.interval}/km` },
    { label: 'R (repetição)', value: plan.paces.repetition400, note: 'p/ 400m, não min/km' },
  ];

  const statsCards =
    scope === 'currentWeek'
      ? [
          { icon: TrendingUp, label: 'VDOT', value: plan.vdot },
          { icon: Route, label: 'Objetivo', value: plan.goalDistance },
          { icon: Calendar, label: 'Semana', value: `${currentWeek.weekNumber} de ${plan.totalWeeks}` },
          { icon: TrendingUp, label: 'Volume desta semana', value: `${currentWeek.totalKm}km` },
        ]
      : [
          { icon: TrendingUp, label: 'VDOT', value: plan.vdot },
          { icon: Route, label: 'Objetivo', value: plan.goalDistance },
          { icon: Calendar, label: 'Duração', value: `${plan.totalWeeks} sem` },
          { icon: TrendingUp, label: 'Volume', value: `${plan.weeklyKmStart}→${plan.weeklyKmPeak}km` },
        ];

  // Agrupa semanas por fase para exibição (só usado no modo "full").
  const phaseGroups: { phase: number; name: string; focus: string; weeks: typeof plan.weeks }[] = [];
  if (scope === 'full') {
    for (const week of plan.weeks) {
      const last = phaseGroups[phaseGroups.length - 1];
      if (last && last.phase === week.phase) {
        last.weeks.push(week);
      } else {
        phaseGroups.push({ phase: week.phase, name: week.phaseName, focus: week.focus, weeks: [week] });
      }
    }
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
          {scope === 'currentWeek'
            ? 'Seu treino da semana, atualizado conforme seu progresso.'
            : 'Periodização em 4 fases, gerada a partir do VDOT e do objetivo.'}
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

      {scope === 'currentWeek' ? (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">{currentWeek.phaseName}</h2>
            <p className="text-sm text-slate-400">{currentWeek.focus}</p>
          </div>
          <WeekCard week={currentWeek} />
          <p className="text-xs text-slate-500 mt-6 text-center">
            As próximas semanas aparecem aqui conforme você avança no treinamento.
          </p>
        </section>
      ) : (
        <div className="space-y-8">
          {phaseGroups.map((group) => (
            <section key={`${group.phase}-${group.weeks[0].weekNumber}`}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">{group.name}</h2>
                <p className="text-sm text-slate-400">{group.focus}</p>
              </div>
              <div className="space-y-4">
                {group.weeks.map((week) => (
                  <WeekCard key={week.weekNumber} week={week} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 mt-8">
        Plano gerado automaticamente pela metodologia VDOT (limites: T ≤ 10% do volume semanal, I ≤ 8%,
        R ≤ 5%; ~80% do volume em ritmo fácil). Ajuste conforme a resposta do atleta.
      </p>
    </>
  );
}
