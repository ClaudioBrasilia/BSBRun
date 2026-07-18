'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/** Marca/desmarca um treino como concluído. RLS garante que o treino é do atleta logado. */
export async function toggleWorkoutCompleted(workoutId: string, completed: boolean) {
  const supabase = createClient();
  await supabase.from('workouts').update({ completed }).eq('id', workoutId);

  revalidatePath('/athlete/plan');
  revalidatePath('/athlete/dashboard');
}
