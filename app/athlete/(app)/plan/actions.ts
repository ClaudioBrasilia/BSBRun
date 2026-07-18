'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parseTimeToSeconds } from '@/lib/time';

function revalidatePlan() {
  revalidatePath('/athlete/plan');
  revalidatePath('/athlete/dashboard');
}

/**
 * Conclui um treino, com dados opcionais do realizado (distância km e tempo
 * "mm" ou "hh:mm:ss"). RLS garante que o treino é do atleta logado.
 */
export async function completeWorkout(workoutId: string, formData: FormData) {
  const supabase = createClient();

  const distanceStr = String(formData.get('distance_km') ?? '').trim();
  const distance = distanceStr ? Number(distanceStr.replace(',', '.')) : null;
  const durationStr = String(formData.get('duration') ?? '').trim();
  const seconds = durationStr ? parseTimeToSeconds(durationStr) : null;

  await supabase
    .from('workouts')
    .update({
      completed: true,
      realized_distance_km: Number.isFinite(distance) && distance! > 0 ? distance : null,
      realized_duration_min: seconds ? Math.round((seconds / 60) * 10) / 10 : null,
    })
    .eq('id', workoutId);

  revalidatePlan();
}

/** Desmarca um treino concluído (limpa também os dados do realizado). */
export async function uncompleteWorkout(workoutId: string) {
  const supabase = createClient();
  await supabase
    .from('workouts')
    .update({ completed: false, realized_distance_km: null, realized_duration_min: null })
    .eq('id', workoutId);

  revalidatePlan();
}

/** Marca/desmarca um treino como concluído. RLS garante que o treino é do atleta logado. */
export async function toggleWorkoutCompleted(workoutId: string, completed: boolean) {
  const supabase = createClient();
  await supabase.from('workouts').update({ completed }).eq('id', workoutId);

  revalidatePlan();
}
