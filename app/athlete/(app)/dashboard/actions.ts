'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const fields = ['sleep_quality', 'energy', 'muscle_soreness', 'stress', 'motivation'] as const;

export async function saveAthleteCheckin(athleteId: string, formData: FormData): Promise<{ error?: string }> {
  const values = Object.fromEntries(fields.map((field) => [field, Number(formData.get(field))]));
  if (fields.some((field) => !Number.isInteger(values[field]) || values[field] < 1 || values[field] > 5)) {
    return { error: 'Responda todas as escalas de 1 a 5.' };
  }

  const notes = String(formData.get('notes') ?? '').trim() || null;
  const illnessSymptoms = formData.get('illness_symptoms') === 'on';
  const supabase = createClient();
  const { error } = await supabase.from('athlete_checkins').upsert(
    {
      athlete_id: athleteId,
      checkin_date: new Date().toISOString().slice(0, 10),
      ...values,
      illness_symptoms: illnessSymptoms,
      notes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'athlete_id,checkin_date' }
  );

  if (error) return { error: 'Não foi possível salvar o check-in. Tente novamente.' };
  revalidatePath('/athlete/dashboard');
  revalidatePath('/coach/dashboard');
  return {};
}
