'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parseTimeToSeconds } from '@/lib/time';
import { parseActivityFile } from '@/lib/activity-file';

function revalidatePlan() {
  revalidatePath('/athlete/plan');
  revalidatePath('/athlete/dashboard');
  revalidatePath('/coach/dashboard');
}

/**
 * Conclui um treino, com dados opcionais do realizado (distância km e tempo
 * "mm" ou "hh:mm:ss"). RLS garante que o treino é do atleta logado.
 */
export async function completeWorkout(workoutId: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createClient();

  const distanceStr = String(formData.get('distance_km') ?? '').trim();
  const distance = distanceStr ? Number(distanceStr.replace(',', '.')) : null;
  const durationStr = String(formData.get('duration') ?? '').trim();
  const seconds = durationStr ? parseTimeToSeconds(durationStr) : null;
  const rpeStr = String(formData.get('session_rpe') ?? '').trim();
  const painStr = String(formData.get('pain_score') ?? '').trim();
  const sessionRpe = rpeStr ? Number(rpeStr) : null;
  const painScore = painStr ? Number(painStr) : 0;
  const changedMechanics = formData.get('pain_changed_mechanics') === 'on';
  const notes = String(formData.get('feedback_notes') ?? '').trim() || null;

  if (sessionRpe != null && (!Number.isInteger(sessionRpe) || sessionRpe < 0 || sessionRpe > 10)) {
    return { error: 'O RPE deve ser um número inteiro entre 0 e 10.' };
  }
  if (!Number.isInteger(painScore) || painScore < 0 || painScore > 10) {
    return { error: 'A dor deve ser um número inteiro entre 0 e 10.' };
  }

  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select('athlete_id, realized_duration_min')
    .eq('id', workoutId)
    .single();
  if (workoutError || !workout) return { error: 'Treino não encontrado ou sem permissão.' };

  const realizedDurationMin = seconds
    ? Math.round((seconds / 60) * 10) / 10
    : workout.realized_duration_min;
  const { error: updateError } = await supabase
    .from('workouts')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      realized_distance_km: Number.isFinite(distance) && distance! > 0 ? distance : null,
      realized_duration_min: realizedDurationMin,
    })
    .eq('id', workoutId);
  if (updateError) return { error: 'Não foi possível salvar a conclusão do treino.' };

  if (sessionRpe != null) {
    const internalLoad = Math.round((Number(realizedDurationMin ?? 0) * sessionRpe) * 10) / 10;
    const { error: feedbackError } = await supabase.from('workout_feedback').upsert(
      {
        workout_id: workoutId,
        athlete_id: workout.athlete_id,
        session_rpe: sessionRpe,
        pain_score: painScore,
        pain_changed_mechanics: changedMechanics,
        internal_load: internalLoad,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'workout_id' }
    );
    if (feedbackError) return { error: 'Treino concluído, mas não foi possível salvar o feedback.' };
  }

  revalidatePlan();
  return {};
}

/**
 * Conclui um treino a partir de um arquivo GPX/TCX exportado de qualquer
 * app ou relógio: extrai distância e duração e preenche o realizado.
 */
export async function completeWorkoutFromFile(
  workoutId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Selecione um arquivo .gpx ou .tcx.' };
  }
  if (file.size > 15 * 1024 * 1024) {
    return { error: 'Arquivo grande demais (máximo 15 MB).' };
  }

  const parsed = parseActivityFile(await file.text());
  if (!parsed) {
    return { error: 'Não consegui ler este arquivo. Exporte o treino como GPX ou TCX e tente de novo.' };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('workouts')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      realized_distance_km: parsed.distanceKm,
      realized_duration_min: parsed.durationMin,
    })
    .eq('id', workoutId);

  if (error) {
    return { error: 'Não foi possível salvar. Tente novamente.' };
  }

  revalidatePlan();
  return {};
}

/** Desmarca um treino concluído (limpa também os dados do realizado). */
export async function uncompleteWorkout(workoutId: string) {
  const supabase = createClient();
  await supabase
    .from('workouts')
    .update({ completed: false, completed_at: null, realized_distance_km: null, realized_duration_min: null })
    .eq('id', workoutId);
  await supabase.from('workout_feedback').delete().eq('workout_id', workoutId);

  revalidatePlan();
}
