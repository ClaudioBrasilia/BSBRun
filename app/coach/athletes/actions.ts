'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { calcVDOT, DISTANCES } from '@/lib/vdot';
import { parseTimeToSeconds } from '@/lib/time';
import type { AthleteInsert, Experience, Sex } from '@/lib/supabase/types';

export interface AthleteFormResult {
  error?: string;
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function createAthlete(
  _prev: AthleteFormResult,
  formData: FormData
): Promise<AthleteFormResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    return { error: 'O nome do atleta é obrigatório.' };
  }

  const raceDistance = String(formData.get('race_distance') ?? '').trim();
  const raceTimeRaw = String(formData.get('race_time') ?? '').trim();

  let vdot: number | null = null;
  let raceTimeSeconds: number | null = null;

  if (raceDistance && raceTimeRaw) {
    const seconds = parseTimeToSeconds(raceTimeRaw);
    if (seconds === null) {
      return { error: 'Tempo da prova inválido. Use mm:ss ou hh:mm:ss.' };
    }
    const distanceM = DISTANCES[raceDistance];
    if (!distanceM) {
      return { error: 'Distância de prova inválida.' };
    }
    raceTimeSeconds = seconds;
    vdot = calcVDOT(distanceM, seconds);
  }

  const sexValue = String(formData.get('sex') ?? '').trim();
  const experienceValue = String(formData.get('experience') ?? '').trim();

  const insert: AthleteInsert = {
    coach_id: user.id,
    name,
    sex: sexValue === 'M' || sexValue === 'F' ? (sexValue as Sex) : null,
    age: optionalNumber(formData.get('age')),
    experience: experienceValue ? (experienceValue as Experience) : null,
    goal_distance: String(formData.get('goal_distance') ?? '').trim() || null,
    goal_date: String(formData.get('goal_date') ?? '').trim() || null,
    weekly_km: optionalNumber(formData.get('weekly_km')),
    days_per_week: optionalNumber(formData.get('days_per_week')),
    race_distance: raceDistance || null,
    race_time_seconds: raceTimeSeconds,
    vdot,
    notes: String(formData.get('notes') ?? '').trim() || null,
  };

  const { data, error } = await supabase.from('athletes').insert(insert).select('id').single();

  if (error || !data) {
    return { error: 'Não foi possível salvar o atleta. Tente novamente.' };
  }

  if (vdot !== null && raceTimeSeconds !== null) {
    await supabase.from('vdot_history').insert({
      athlete_id: data.id,
      vdot,
      race_distance: raceDistance,
      race_time_seconds: raceTimeSeconds,
    });
  }

  revalidatePath('/coach/dashboard');
  revalidatePath('/coach/athletes');
  redirect(`/coach/athletes/${data.id}`);
}

export async function deleteAthlete(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = createClient();
  await supabase.from('athletes').delete().eq('id', id);

  revalidatePath('/coach/dashboard');
  revalidatePath('/coach/athletes');
  redirect('/coach/athletes');
}
