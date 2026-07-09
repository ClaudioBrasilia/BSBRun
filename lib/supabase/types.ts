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
  name: string;
  sex: Sex | null;
  age: number | null;
  experience: Experience | null;
  goal_distance: string | null;
  goal_date: string | null;
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
  description: string | null;
  distance_km: number | null;
  target_pace: string | null;
  duration_min: number | null;
  completed: boolean;
  created_at: string;
}

export type AthleteInsert = Omit<AthleteRow, 'id' | 'created_at' | 'updated_at'>;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
