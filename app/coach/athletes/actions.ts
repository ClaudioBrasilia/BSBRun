'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { calcVDOT } from '@/lib/vdot';
import { regenerateSavedPlan } from '@/lib/data/workouts';
import type { AthleteInsert, AthleteUpdate, Experience, Sex } from '@/lib/supabase/types';

export interface AthleteFormResult {
  error?: string;
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Data de início do plano: a informada no form, ou hoje (o plano precisa de âncora). */
function planStartDate(value: FormDataEntryValue | null): string {
  const s = String(value ?? '').trim();
  if (s && !Number.isNaN(new Date(s).getTime())) return s;
  return new Date().toISOString().slice(0, 10);
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

  const raceDistanceM = optionalNumber(formData.get('race_distance_m'));
  const raceTimeSeconds = optionalNumber(formData.get('race_time_seconds'));
  const raceDistanceLabel = String(formData.get('race_distance_label') ?? '').trim();

  let vdot: number | null = null;

  if (raceDistanceM !== null && raceTimeSeconds !== null) {
    if (raceDistanceM <= 0 || raceTimeSeconds <= 0) {
      return { error: 'Resultado da prova inválido.' };
    }
    vdot = calcVDOT(raceDistanceM, raceTimeSeconds);
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
    plan_start_date: planStartDate(formData.get('plan_start_date')),
    weekly_km: optionalNumber(formData.get('weekly_km')),
    days_per_week: optionalNumber(formData.get('days_per_week')),
    race_distance: raceDistanceLabel || null,
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
      race_distance: raceDistanceLabel,
      race_time_seconds: raceTimeSeconds,
    });
  }

  revalidatePath('/coach/dashboard');
  revalidatePath('/coach/athletes');
  redirect(`/coach/athletes/${data.id}`);
}

export async function updateAthleteDetails(
  id: string,
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

  const sexValue = String(formData.get('sex') ?? '').trim();
  const experienceValue = String(formData.get('experience') ?? '').trim();

  const update: AthleteUpdate = {
    name,
    sex: sexValue === 'M' || sexValue === 'F' ? (sexValue as Sex) : null,
    age: optionalNumber(formData.get('age')),
    experience: experienceValue ? (experienceValue as Experience) : null,
    goal_distance: String(formData.get('goal_distance') ?? '').trim() || null,
    goal_date: String(formData.get('goal_date') ?? '').trim() || null,
    plan_start_date: planStartDate(formData.get('plan_start_date')),
    weekly_km: optionalNumber(formData.get('weekly_km')),
    days_per_week: optionalNumber(formData.get('days_per_week')),
    notes: String(formData.get('notes') ?? '').trim() || null,
  };

  const { error } = await supabase.from('athletes').update(update).eq('id', id);

  if (error) {
    return { error: 'Não foi possível salvar as alterações. Tente novamente.' };
  }

  revalidatePath('/coach/dashboard');
  revalidatePath('/coach/athletes');
  revalidatePath(`/coach/athletes/${id}`);
  redirect(`/coach/athletes/${id}`);
}

export async function registerNewRace(
  id: string,
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

  const raceDistanceM = optionalNumber(formData.get('race_distance_m'));
  const raceTimeSeconds = optionalNumber(formData.get('race_time_seconds'));
  const raceDistanceLabel = String(formData.get('race_distance_label') ?? '').trim();

  if (raceDistanceM === null || raceTimeSeconds === null || raceDistanceM <= 0 || raceTimeSeconds <= 0) {
    return { error: 'Informe um resultado válido de prova ou teste.' };
  }

  const vdot = calcVDOT(raceDistanceM, raceTimeSeconds);

  const { error } = await supabase
    .from('athletes')
    .update({ vdot, race_distance: raceDistanceLabel, race_time_seconds: raceTimeSeconds })
    .eq('id', id);

  if (error) {
    return { error: 'Não foi possível salvar o resultado. Tente novamente.' };
  }

  await supabase.from('vdot_history').insert({
    athlete_id: id,
    vdot,
    race_distance: raceDistanceLabel,
    race_time_seconds: raceTimeSeconds,
  });

  revalidatePath('/coach/dashboard');
  revalidatePath('/coach/athletes');
  revalidatePath(`/coach/athletes/${id}`);
  redirect(`/coach/athletes/${id}`);
}

/** Gera (ou renova) o link de convite do atleta para criar a própria conta. */
export async function generateInviteLink(id: string, _formData: FormData) {
  const supabase = createClient();
  const code = crypto.randomUUID();

  await supabase.from('athletes').update({ invite_code: code }).eq('id', id);

  revalidatePath(`/coach/athletes/${id}`);
}

/**
 * Desvincula a conta de login do atleta e já gera um novo convite. Usado
 * quando a conta ficou presa/errada — o plano e os dados do atleta são
 * mantidos (ligados ao athlete_id, não ao login); só a conta de acesso é
 * desconectada, e o atleta entra de novo com o link novo.
 */
export async function unlinkAthleteAccount(id: string, _formData: FormData) {
  const supabase = createClient();
  const code = crypto.randomUUID();

  await supabase.from('athletes').update({ user_id: null, invite_code: code }).eq('id', id);

  revalidatePath(`/coach/athletes/${id}`);
}

export interface SavePlanResult {
  error?: string;
  savedAt?: string;
}

/**
 * Gera o plano do atleta e o salva treino a treino (substitui o anterior).
 * Retorna o resultado para a UI mostrar sucesso ou o erro real — sem engolir
 * falhas silenciosamente.
 */
export async function savePlanToDatabase(
  id: string,
  _prev: SavePlanResult,
  _formData: FormData
): Promise<SavePlanResult> {
  const supabase = createClient();
  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single();
  if (!athlete) {
    return { error: 'Atleta não encontrado. Recarregue a página e tente de novo.' };
  }

  const error = await regenerateSavedPlan(athlete);
  if (error) {
    return { error };
  }

  revalidatePath(`/coach/athletes/${id}/plan`);
  revalidatePath('/athlete/plan');
  return { savedAt: new Date().toISOString() };
}

/** Edita um treino salvo (título, descrição, distância). */
export async function updateSavedWorkout(workoutId: string, athleteId: string, formData: FormData) {
  const supabase = createClient();

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const distance = optionalNumber(formData.get('distance_km'));

  await supabase
    .from('workouts')
    .update({
      title: title || null,
      description: description || null,
      distance_km: distance,
    })
    .eq('id', workoutId);

  revalidatePath(`/coach/athletes/${athleteId}/plan`);
  revalidatePath('/athlete/plan');
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
