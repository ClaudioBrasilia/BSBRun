/**
 * Tipos do banco de dados. Espelham supabase/schema.sql.
 * Se você alterar o schema, atualize estes tipos (ou gere com a CLI do Supabase).
 */

export type Sex = 'M' | 'F';
export type Experience = 'iniciante' | 'intermediário' | 'avançado';
export type Role = 'coach' | 'athlete';

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface AthleteRow {
  id: string;
  coach_id: string;
  /** Preenchido quando o atleta cria a própria conta e vincula via convite. */
  user_id: string | null;
  /** Código de convite pendente (nulo depois que o atleta vincula a conta). */
  invite_code: string | null;
  name: string;
  sex: Sex | null;
  age: number | null;
  experience: Experience | null;
  goal_distance: string | null;
  goal_date: string | null;
  /** Âncora do plano de treino: a semana atual é contada a partir daqui. */
  plan_start_date: string | null;
  weekly_km: number | null;
  days_per_week: number | null;
  race_distance: string | null;
  race_time_seconds: number | null;
  vdot: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VdotHistoryRow {
  id: string;
  athlete_id: string;
  vdot: number;
  race_distance: string;
  race_time_seconds: number;
  recorded_at: string;
}

export interface WorkoutRow {
  id: string;
  athlete_id: string;
  day: string;
  type: string;
  title: string | null;
  description: string | null;
  distance_km: number | null;
  target_pace: string | null;
  duration_min: number | null;
  week_number: number | null;
  phase: number | null;
  quality: boolean;
  strength: boolean;
  completed: boolean;
  /** Distância/tempo informados pelo atleta ao concluir (planejado × realizado). */
  realized_distance_km: number | null;
  realized_duration_min: number | null;
  created_at: string;
}

export interface StravaConnectionRow {
  id: string;
  athlete_id: string;
  strava_athlete_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  created_at: string;
  updated_at: string;
}

export interface StravaActivityRow {
  id: string;
  athlete_id: string;
  strava_activity_id: number;
  name: string | null;
  distance_m: number | null;
  moving_time_s: number | null;
  start_date: string | null;
  created_at: string;
}

export type AthleteInsert = Omit<
  AthleteRow,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'invite_code' | 'plan_start_date'
> & {
  user_id?: string | null;
  invite_code?: string | null;
  plan_start_date?: string | null;
};
export type AthleteUpdate = Partial<AthleteInsert>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      athletes: {
        Row: AthleteRow;
        Insert: AthleteInsert;
        Update: AthleteUpdate;
        Relationships: [];
      };
      vdot_history: {
        Row: VdotHistoryRow;
        Insert: Omit<VdotHistoryRow, 'id' | 'recorded_at'> & { recorded_at?: string };
        Update: Partial<VdotHistoryRow>;
        Relationships: [];
      };
      workouts: {
        Row: WorkoutRow;
        Insert: Omit<WorkoutRow, 'id' | 'created_at'>;
        Update: Partial<WorkoutRow>;
        Relationships: [];
      };
      strava_connections: {
        Row: StravaConnectionRow;
        Insert: Omit<StravaConnectionRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StravaConnectionRow, 'id' | 'athlete_id'>>;
        Relationships: [];
      };
      strava_activities: {
        Row: StravaActivityRow;
        Insert: Omit<StravaActivityRow, 'id' | 'created_at'>;
        Update: Partial<StravaActivityRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
