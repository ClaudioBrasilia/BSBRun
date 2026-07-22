import { createClient } from '@/lib/supabase/server';
import { generatePlan, getPlanPosition, type GeneratedPlan } from '@/lib/plan-generator';
import { generateBeginnerPlan, BEGINNER_TOTAL_WEEKS } from '@/lib/beginner-plan';
import { addDaysISO, mondayOfISO, todayISO } from '@/lib/time';
import type { AthleteRow, WorkoutRow } from '@/lib/supabase/types';

/** Treinos salvos de um atleta, em ordem de data. RLS garante o acesso. */
export async function getSavedWorkouts(athleteId: string): Promise<WorkoutRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('day', { ascending: true });

  if (error) {
    console.error('Erro ao buscar treinos salvos:', error.message);
    return [];
  }
  return (data ?? []) as WorkoutRow[];
}

/**
 * Segunda-feira da semana 1 do plano. Quando há prova-alvo, ancora o FIM do
 * plano na semana da prova (mesma convenção de getPlanPosition, que conta a
 * semana atual de trás pra frente); sem prova, ancora no início do plano.
 */
export function planFirstMonday(
  planStartDate: string | null,
  goalDate: string | null,
  totalWeeks: number
): string {
  if (goalDate && !Number.isNaN(new Date(goalDate).getTime())) {
    return addDaysISO(mondayOfISO(goalDate), -(totalWeeks - 1) * 7);
  }
  const start = planStartDate && !Number.isNaN(new Date(planStartDate).getTime()) ? planStartDate : todayISO();
  return mondayOfISO(start);
}

/** Converte um plano gerado em linhas da tabela workouts, com datas reais. */
export function planToWorkoutRows(
  plan: Pick<GeneratedPlan, 'weeks'>,
  athleteId: string,
  firstMonday: string,
  goalDate?: string | null,
  goalDistance?: string | null
): Omit<WorkoutRow, 'id' | 'created_at'>[] {
  const rows: Omit<WorkoutRow, 'id' | 'created_at'>[] = [];
  const goal = goalDate && !Number.isNaN(new Date(goalDate).getTime()) ? goalDate : null;

  for (const week of plan.weeks) {
    const weekMonday = addDaysISO(firstMonday, (week.weekNumber - 1) * 7);
    for (const w of week.workouts) {
      const day = addDaysISO(weekMonday, w.day - 1);

      // Dia da prova: substitui o que estiver agendado por um card especial.
      if (goal && day === goal) {
        rows.push({
          athlete_id: athleteId,
          day,
          type: 'Race',
          title: `🏁 Dia da Prova${goalDistance ? ` — ${goalDistance}` : ''}`,
          description:
            'É pra isso que você treinou! Aqueça com 10–15 min de trote leve e 2–3 strides, confie no ritmo treinado e boa prova!',
          distance_km: 0,
          target_pace: null,
          duration_min: null,
          week_number: week.weekNumber,
          phase: week.phase,
          quality: true,
          strength: false,
          completed: false,
          realized_distance_km: null,
          realized_duration_min: null,
        });
        continue;
      }

      // Dias depois da prova viram recuperação — nada de longão pós-prova.
      if (goal && day > goal) {
        rows.push({
          athlete_id: athleteId,
          day,
          type: 'Rest',
          title: 'Descanso — pós-prova',
          description:
            'Prova concluída! Descanso total ou caminhada leve. Retome trotes leves só depois de alguns dias, conforme o corpo pedir.',
          distance_km: 0,
          target_pace: null,
          duration_min: null,
          week_number: week.weekNumber,
          phase: week.phase,
          quality: false,
          strength: false,
          completed: false,
          realized_distance_km: null,
          realized_duration_min: null,
        });
        continue;
      }

      rows.push({
        athlete_id: athleteId,
        day,
        type: w.type,
        title: w.title,
        description: w.description,
        distance_km: w.distanceKm,
        target_pace: null,
        duration_min: w.durationMin ?? null,
        week_number: week.weekNumber,
        phase: week.phase,
        quality: w.quality,
        strength: w.strength,
        completed: false,
        realized_distance_km: null,
        realized_duration_min: null,
      });
    }
  }
  return rows;
}

/**
 * Gera o plano do atleta e o salva na tabela workouts, substituindo qualquer
 * plano salvo anterior. Retorna mensagem de erro ou null em caso de sucesso.
 */
export async function regenerateSavedPlan(athlete: AthleteRow): Promise<string | null> {
  let rows: Omit<WorkoutRow, 'id' | 'created_at'>[];

  if (athlete.vdot) {
    const { totalWeeks } = getPlanPosition(athlete.plan_start_date, athlete.goal_date);
    const plan = generatePlan({
      vdot: athlete.vdot,
      goalDistance: athlete.goal_distance ?? '10000m (10K)',
      weeklyKm: athlete.weekly_km,
      daysPerWeek: athlete.days_per_week,
      experience: athlete.experience,
      totalWeeks,
    });
    const firstMonday = planFirstMonday(athlete.plan_start_date, athlete.goal_date, totalWeeks);
    rows = planToWorkoutRows(plan, athlete.id, firstMonday, athlete.goal_date, athlete.goal_distance);
  } else {
    // Sem VDOT: programa iniciante (do zero à corrida), ancorado no início
    // do plano — a prova-alvo não guia este programa.
    const plan = generateBeginnerPlan(athlete.days_per_week);
    const firstMonday = planFirstMonday(athlete.plan_start_date, null, BEGINNER_TOTAL_WEEKS);
    rows = planToWorkoutRows(plan, athlete.id, firstMonday);
  }

  const supabase = createClient();
  const { error: deleteError } = await supabase.from('workouts').delete().eq('athlete_id', athlete.id);
  if (deleteError) {
    console.error('Erro ao limpar plano anterior:', deleteError.message);
    return `Não foi possível substituir o plano anterior (${deleteError.message}). Tente novamente.`;
  }

  const { error: insertError } = await supabase.from('workouts').insert(rows);
  if (insertError) {
    console.error('Erro ao salvar plano:', insertError.message);
    return `Não foi possível salvar o plano (${insertError.message}). Se o erro citar uma coluna inexistente, rode a migração mais recente do banco e tente de novo.`;
  }
  return null;
}
