import { createClient } from '@/lib/supabase/server';
import type { AthleteRow, VdotHistoryRow } from '@/lib/supabase/types';

/** Lista os atletas do coach logado. */
export async function getAthletes(): Promise<AthleteRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar atletas:', error.message);
    return [];
  }
  return (data ?? []) as AthleteRow[];
}

/** Busca um atleta específico do coach logado (RLS garante a posse). */
export async function getAthlete(id: string): Promise<AthleteRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('athletes').select('*').eq('id', id).single();

  if (error) {
    return null;
  }
  return data as AthleteRow;
}

/** Histórico de VDOT de um atleta, mais recente primeiro. */
export async function getVdotHistory(athleteId: string): Promise<VdotHistoryRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vdot_history')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('recorded_at', { ascending: false });

  if (error) {
    return [];
  }
  return (data ?? []) as VdotHistoryRow[];
}
