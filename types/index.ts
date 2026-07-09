export interface User {
  id: string;
  name: string;
  email: string;
  role: 'coach' | 'athlete';
  avatar?: string;
  createdAt: Date;
}

export interface Athlete extends User {
  role: 'athlete';
  coachId: string;
  age: number;
  sex: 'M' | 'F';
  experience: 'iniciante' | 'intermediário' | 'avançado';
  currentWeeklyKm: number;
  goalDistance: string;
  goalDate: Date;
  recentRaceDistance: string;
  recentRaceTimeSeconds: number;
  daysPerWeek: number;
  vdot: number;
  vdotHistory: VDOTHistory[];
}

export interface VDOTHistory {
  id: string;
  date: Date;
  vdot: number;
  raceDistance: string;
  raceTimeSeconds: number;
}

export interface TrainingPlan {
  id: string;
  athleteId: string;
  coachId: string;
  vdotInitial: number;
  startDate: Date;
  endDate: Date;
  goalDistance: string;
  weeks: WeekPlan[];
  status: 'active' | 'completed' | 'paused';
}

export interface WeekPlan {
  weekNumber: number;
  phase: string;
  startDate: Date;
  totalKm: number;
  workouts: Workout[];
  strengthSessions: StrengthSession[];
}

export interface Workout {
  id: string;
  day: Date;
  type: 'E' | 'M' | 'T' | 'I' | 'R' | 'Long' | 'Recovery' | 'Rest';
  description: string;
  distanceKm: number;
  targetPace: string;
  durationMin: number;
  quality: boolean;
  completed?: boolean;
}

export interface StrengthSession {
  id: string;
  day: Date;
  type: 'strength' | 'mobility' | 'prevention' | 'core';
  title: string;
  description: string;
  durationMin: number;
  exercises: Exercise[];
  completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'mobility' | 'prevention' | 'core' | 'plyometric';
  description: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restSeconds?: number;
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  targetMuscles: string[];
  benefits: string[];
  precautions?: string[];
}
