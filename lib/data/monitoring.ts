import { createClient } from '@/lib/supabase/server';
import type { AthleteCheckinRow, AthleteRow, WorkoutFeedbackRow } from '@/lib/supabase/types';

export type MonitoringStatus = 'normal' | 'atencao' | 'prioritario' | 'sem_dados';

export interface AthleteMonitoringSummary {
  athlete: AthleteRow;
  load7d: number;
  baselineWeekly28d: number;
  loadRatio: number | null;
  recoveryScore: number | null;
  latestCheckinDate: string | null;
  latestRpe: number | null;
  latestPain: number | null;
  painChangedMechanics: boolean;
  illnessSymptoms: boolean;
  feedbackCount28d: number;
  status: MonitoringStatus;
  statusReason: string;
}

function isoDateDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function recoveryScore(checkin: AthleteCheckinRow): number {
  return (checkin.sleep_quality + checkin.energy + checkin.motivation + (6 - checkin.muscle_soreness) + (6 - checkin.stress)) / 5;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export async function getAthleteMonitoringSummaries(athletes: AthleteRow[]): Promise<AthleteMonitoringSummary[]> {
  if (athletes.length === 0) return [];
  const supabase = createClient();
  const ids = athletes.map((athlete) => athlete.id);
  const since28d = isoDateDaysAgo(28);
  const since7d = isoDateDaysAgo(7);

  const [{ data: feedbackRows }, { data: checkinRows }] = await Promise.all([
    supabase.from('workout_feedback').select('*').in('athlete_id', ids).gte('created_at', since28d),
    supabase.from('athlete_checkins').select('*').in('athlete_id', ids).gte('checkin_date', since28d.slice(0, 10)).order('checkin_date', { ascending: false }),
  ]);

  const feedback = (feedbackRows ?? []) as WorkoutFeedbackRow[];
  const checkins = (checkinRows ?? []) as AthleteCheckinRow[];
  const result = athletes.map((athlete) => {
    const athleteFeedback = feedback.filter((row) => row.athlete_id === athlete.id);
    const athleteCheckins = checkins.filter((row) => row.athlete_id === athlete.id);
    const load7d = athleteFeedback
      .filter((row) => row.created_at >= since7d)
      .reduce((sum, row) => sum + Number(row.internal_load || 0), 0);
    const load28d = athleteFeedback.reduce((sum, row) => sum + Number(row.internal_load || 0), 0);
    const baselineWeekly28d = load28d / 4;
    const latestFeedback = [...athleteFeedback].sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;
    const latestCheckin = athleteCheckins[0] ?? null;
    const currentRecovery = latestCheckin ? recoveryScore(latestCheckin) : null;
    const loadRatio = baselineWeekly28d > 0 ? load7d / baselineWeekly28d : null;
    const hasPrioritySignal = Boolean(latestCheckin?.illness_symptoms || latestFeedback?.pain_changed_mechanics);
    const hasAttentionSignal = Boolean(
      (currentRecovery != null && currentRecovery < 2.8) ||
      (loadRatio != null && loadRatio > 1.3) ||
      (latestFeedback?.pain_score ?? 0) >= 5
    );
    const status: MonitoringStatus = athleteFeedback.length === 0 && athleteCheckins.length === 0
      ? 'sem_dados'
      : hasPrioritySignal
        ? 'prioritario'
        : hasAttentionSignal
          ? 'atencao'
          : 'normal';

    let statusReason = 'Sem sinal relevante nos dados recentes.';
    if (status === 'sem_dados') statusReason = 'Ainda não há feedback ou check-in suficiente.';
    else if (latestCheckin?.illness_symptoms) statusReason = 'Atleta registrou sintomas de doença.';
    else if (latestFeedback?.pain_changed_mechanics) statusReason = 'Dor relatada alterou a passada ou o movimento.';
    else if (currentRecovery != null && currentRecovery < 2.8) statusReason = 'Bem-estar recente abaixo da linha de atenção.';
    else if (loadRatio != null && loadRatio > 1.3) statusReason = 'Carga de 7 dias acima da linha de base individual.';
    else if ((latestFeedback?.pain_score ?? 0) >= 5) statusReason = 'Dor relatada exige revisão do coach.';

    return {
      athlete,
      load7d: round(load7d),
      baselineWeekly28d: round(baselineWeekly28d),
      loadRatio: loadRatio == null ? null : round(loadRatio),
      recoveryScore: currentRecovery == null ? null : round(currentRecovery),
      latestCheckinDate: latestCheckin?.checkin_date ?? null,
      latestRpe: latestFeedback?.session_rpe ?? null,
      latestPain: latestFeedback?.pain_score ?? null,
      painChangedMechanics: latestFeedback?.pain_changed_mechanics ?? false,
      illnessSymptoms: latestCheckin?.illness_symptoms ?? false,
      feedbackCount28d: athleteFeedback.length,
      status,
      statusReason,
    };
  });

  return result;
}
