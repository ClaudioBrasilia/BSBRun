import { getTrainingPaces, type TrainingPaces } from './vdot';

// ============================================================================
// Gerador de planos de treino — metodologia VDOT (4 fases).
//
// Regras principais seguidas:
//  - ~80% do volume em ritmo fácil (E); qualidade limitada por semana.
//  - Limites semanais de qualidade: T ≤ 10% do volume, I ≤ 8%, R ≤ 5%.
//  - Sessão de I ≤ 8 km; sessão de R ≤ ~6 km.
//  - Longão ≈ 25–30% do volume semanal.
//  - Progressão de volume com semanas de recuperação e polimento (taper).
// ============================================================================

export type WorkoutType = 'E' | 'L' | 'M' | 'T' | 'I' | 'R' | 'Rest';

export interface PlannedWorkout {
  day: number; // 1 = segunda ... 7 = domingo
  dayName: string;
  type: WorkoutType;
  title: string;
  description: string;
  distanceKm: number;
  quality: boolean;
}

export interface PlannedWeek {
  weekNumber: number;
  phase: 1 | 2 | 3 | 4;
  phaseName: string;
  focus: string;
  totalKm: number;
  isRecovery: boolean;
  isTaper: boolean;
  workouts: PlannedWorkout[];
}

export interface GeneratedPlan {
  vdot: number;
  goalDistance: string;
  totalWeeks: number;
  weeklyKmStart: number;
  weeklyKmPeak: number;
  paces: TrainingPaces;
  weeks: PlannedWeek[];
}

export interface PlanInput {
  vdot: number;
  goalDistance: string;
  weeklyKm?: number | null;
  daysPerWeek?: number | null;
  experience?: string | null;
  totalWeeks: number;
}

const DAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const PHASE_NAMES: Record<number, string> = {
  1: 'Fase I — Base',
  2: 'Fase II — Qualidade Inicial',
  3: 'Fase III — Qualidade de Transição',
  4: 'Fase IV — Qualidade Final',
};

const PHASE_FOCUS: Record<number, string> = {
  1: 'Base e prevenção: corrida fácil (E), construção de volume e educativos (strides).',
  2: 'Qualidade inicial: Repetições (R) para economia de corrida e velocidade.',
  3: 'Qualidade de transição: Intervalos (I) para desenvolver o VO₂max. Fase mais exigente.',
  4: 'Qualidade final: Limiar (T) e ritmo de prova, com polimento para a competição.',
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function round(v: number): number {
  return Math.round(v);
}

function defaultWeeklyKm(experience?: string | null): number {
  switch (experience) {
    case 'avançado':
      return 70;
    case 'intermediário':
      return 50;
    default:
      return 30;
  }
}

/** Divide o total de semanas nas 4 fases (base maior; fases de qualidade equilibradas). */
function splitPhases(totalWeeks: number): (1 | 2 | 3 | 4)[] {
  const weeks: (1 | 2 | 3 | 4)[] = [];
  if (totalWeeks <= 3) {
    // Prazo curtíssimo: foca em qualidade final.
    for (let i = 0; i < totalWeeks; i++) weeks.push(4);
    return weeks;
  }

  let f1 = Math.max(1, Math.round(totalWeeks * 0.3));
  let f2 = Math.max(1, Math.round(totalWeeks * 0.2));
  let f3 = Math.max(1, Math.round(totalWeeks * 0.25));
  let f4 = Math.max(1, totalWeeks - f1 - f2 - f3);

  // Ajusta arredondamento para bater o total exato.
  let sum = f1 + f2 + f3 + f4;
  while (sum > totalWeeks) {
    if (f1 > 1) f1--;
    else if (f3 > 1) f3--;
    else if (f2 > 1) f2--;
    else f4--;
    sum = f1 + f2 + f3 + f4;
  }
  while (sum < totalWeeks) {
    f1++;
    sum++;
  }

  for (let i = 0; i < f1; i++) weeks.push(1);
  for (let i = 0; i < f2; i++) weeks.push(2);
  for (let i = 0; i < f3; i++) weeks.push(3);
  for (let i = 0; i < f4; i++) weeks.push(4);
  return weeks;
}

/** Tipos de treino de qualidade por fase, dependendo do objetivo. */
function qualityTypesForPhase(
  phase: 1 | 2 | 3 | 4,
  goalDistance: string
): WorkoutType[] {
  const isLongGoal = goalDistance === 'Maratona' || goalDistance === 'Meia Maratona';
  switch (phase) {
    case 1:
      return []; // só E + strides
    case 2:
      return ['R', 'R'];
    case 3:
      return ['I', 'T'];
    case 4:
      return isLongGoal ? ['T', 'M'] : ['T', 'I'];
    default:
      return [];
  }
}

// --- Construtores de sessões de qualidade -----------------------------------

function buildR(weeklyKm: number, paces: TrainingPaces) {
  const totalM = clamp(weeklyKm * 0.05 * 1000, 1200, 6000);
  let reps: number;
  let dist: number;
  if (totalM / 400 >= 4) {
    dist = 400;
    reps = round(totalM / 400);
  } else {
    dist = 200;
    reps = round(totalM / 200);
  }
  const workKm = (reps * dist) / 1000;
  return {
    title: `Repetições (R) — ${reps}×${dist}m`,
    description: `Aquecimento fácil, ${reps}×${dist}m em ritmo R (${paces.repetition400}/km) com recuperação trotando o mesmo tempo, depois soltar. Foco em técnica e velocidade sem acidose.`,
    workKm,
  };
}

function buildI(weeklyKm: number, paces: TrainingPaces) {
  const totalM = clamp(weeklyKm * 0.08 * 1000, 2000, 8000);
  const rep = 1000;
  const reps = clamp(round(totalM / rep), 3, 6);
  const workKm = (reps * rep) / 1000;
  return {
    title: `Intervalos (I) — ${reps}×1000m`,
    description: `Aquecimento, ${reps}×1000m em ritmo I (${paces.interval}/km) com ~3 min de trote entre as repetições, depois soltar. Estímulo de VO₂max — mantenha o ritmo constante.`,
    workKm,
  };
}

function buildT(weeklyKm: number, paces: TrainingPaces) {
  const totalM = clamp(weeklyKm * 0.1 * 1000, 3000, 12000);
  if (totalM <= 6000) {
    const workKm = round(totalM) / 1000;
    return {
      title: `Limiar (T) — tempo contínuo`,
      description: `Aquecimento, ${workKm.toFixed(1)} km contínuos em ritmo T (${paces.threshold}/km) — esforço "confortavelmente difícil", depois soltar.`,
      workKm,
    };
  }
  const rep = 1600;
  const reps = round(totalM / rep);
  const workKm = (reps * rep) / 1000;
  return {
    title: `Limiar (T) — ${reps}×1600m (cruise)`,
    description: `Aquecimento, ${reps}×1600m em ritmo T (${paces.threshold}/km) com 1 min de trote entre as repetições, depois soltar.`,
    workKm,
  };
}

function buildM(weeklyKm: number, paces: TrainingPaces) {
  const workKm = clamp(round(weeklyKm * 0.15), 6, 18);
  return {
    title: `Ritmo de Maratona (M) — ${workKm} km`,
    description: `Aquecimento leve e ${workKm} km em ritmo M (${paces.marathon}/km), simulando o ritmo-alvo de prova.`,
    workKm,
  };
}

function buildQuality(type: WorkoutType, weeklyKm: number, paces: TrainingPaces) {
  switch (type) {
    case 'R':
      return buildR(weeklyKm, paces);
    case 'I':
      return buildI(weeklyKm, paces);
    case 'T':
      return buildT(weeklyKm, paces);
    case 'M':
      return buildM(weeklyKm, paces);
    default:
      return null;
  }
}

// --- Volume semanal ---------------------------------------------------------

function weeklyVolume(
  weekIndex: number,
  totalWeeks: number,
  phase: 1 | 2 | 3 | 4,
  start: number,
  peak: number,
  isRecovery: boolean,
  isTaper: boolean,
  taperWeeksFromEnd: number
): number {
  if (isTaper) {
    // Polimento: reduz volume nas últimas semanas.
    const factor = taperWeeksFromEnd === 0 ? 0.5 : 0.7;
    return round(peak * factor);
  }
  // Progressão linear da base até o pico ao longo das fases I–II.
  const rampWeeks = Math.max(1, Math.round(totalWeeks * 0.5));
  const progress = clamp(weekIndex / rampWeeks, 0, 1);
  let vol = start + (peak - start) * progress;
  if (isRecovery) vol *= 0.8;
  return round(vol);
}

// --- Agendamento semanal ----------------------------------------------------

function scheduleWeek(
  weekNumber: number,
  phase: 1 | 2 | 3 | 4,
  weeklyKm: number,
  daysPerWeek: number,
  qualityTypes: WorkoutType[],
  paces: TrainingPaces,
  useStrides: boolean,
  isRecovery: boolean,
  isTaper: boolean
): PlannedWorkout[] {
  const days: WorkoutType[] = ['E', 'E', 'E', 'E', 'E', 'E', 'E'];

  // Longão no domingo (dia 7).
  days[6] = 'L';

  // Dias de qualidade (terça e quinta), limitados por recuperação e dias/semana.
  let maxQuality = qualityTypes.length;
  if (isRecovery || isTaper) maxQuality = Math.min(maxQuality, 1);
  if (daysPerWeek <= 3) maxQuality = Math.min(maxQuality, 1);
  const qSlots = [1, 3]; // índices: terça, quinta
  const usedQuality: WorkoutType[] = [];
  for (let i = 0; i < maxQuality && i < qSlots.length; i++) {
    days[qSlots[i]] = qualityTypes[i];
    usedQuality.push(qualityTypes[i]);
  }

  // Dias de descanso: preenche até bater daysPerWeek dias de corrida.
  const restNeeded = Math.max(0, 7 - daysPerWeek);
  const restPriority = [0, 4, 2, 5]; // seg, sex, qua, sáb
  let restPlaced = 0;
  for (const idx of restPriority) {
    if (restPlaced >= restNeeded) break;
    if (days[idx] === 'E') {
      days[idx] = 'Rest';
      restPlaced++;
    }
  }

  // Distâncias: longão e qualidade primeiro, resto distribuído em E.
  const longKm = clamp(round(weeklyKm * 0.28), 6, 32);
  const qualityKm: Record<number, number> = {};
  let qualityTotal = 0;
  usedQuality.forEach((type, i) => {
    const built = buildQuality(type, weeklyKm, paces);
    const wu = 3; // aquecimento + soltura aproximados
    const km = built ? round(built.workKm + wu) : 5;
    qualityKm[qSlots[i]] = km;
    qualityTotal += km;
  });

  const eDayIndices = days
    .map((t, i) => ({ t, i }))
    .filter((d) => d.t === 'E')
    .map((d) => d.i);

  const remaining = Math.max(0, weeklyKm - longKm - qualityTotal);
  const perE = eDayIndices.length > 0 ? Math.max(4, round(remaining / eDayIndices.length)) : 0;

  return days.map((type, i) => {
    const day = i + 1;
    const dayName = DAY_NAMES[i];
    if (type === 'Rest') {
      return { day, dayName, type, title: 'Descanso', description: 'Descanso ou mobilidade leve.', distanceKm: 0, quality: false };
    }
    if (type === 'L') {
      return {
        day,
        dayName,
        type,
        title: `Longão — ${longKm} km`,
        description: `${longKm} km em ritmo fácil (E: ${paces.easySlow}–${paces.easyFast}/km). Base aeróbica; mantenha conversável.`,
        distanceKm: longKm,
        quality: false,
      };
    }
    if (type === 'E') {
      const strides = useStrides && (i === 2 || i === 4);
      return {
        day,
        dayName,
        type,
        title: `Corrida fácil${strides ? ' + strides' : ''}`,
        description: `${perE} km em ritmo E (${paces.easySlow}–${paces.easyFast}/km)${strides ? ', terminando com 6×20s de strides (acelerações leves).' : '.'}`,
        distanceKm: perE,
        quality: false,
      };
    }
    // Qualidade
    const built = buildQuality(type, weeklyKm, paces);
    const km = qualityKm[i] ?? 6;
    return {
      day,
      dayName,
      type,
      title: built?.title ?? 'Treino de qualidade',
      description: (built?.description ?? '') + ` Total aprox.: ${km} km com aquecimento e soltura.`,
      distanceKm: km,
      quality: true,
    };
  });
}

// --- Função principal -------------------------------------------------------

export function generatePlan(input: PlanInput): GeneratedPlan {
  const totalWeeks = clamp(Math.round(input.totalWeeks), 4, 24);
  const daysPerWeek = clamp(input.daysPerWeek ?? 5, 3, 7);
  const start = input.weeklyKm && input.weeklyKm > 0 ? input.weeklyKm : defaultWeeklyKm(input.experience);
  const peak = round(Math.max(start, start * 1.25));
  const paces = getTrainingPaces(input.vdot);

  const phases = splitPhases(totalWeeks);

  const weeks: PlannedWeek[] = phases.map((phase, index) => {
    const weekNumber = index + 1;
    const weeksFromEnd = totalWeeks - weekNumber; // 0 = última
    const isTaper = phase === 4 && weeksFromEnd <= 1; // últimas 2 semanas
    const isRecovery = !isTaper && weekNumber % 4 === 0; // toda 4ª semana

    const weeklyKm = weeklyVolume(index, totalWeeks, phase, start, peak, isRecovery, isTaper, weeksFromEnd);
    const useStrides = phase === 1 || phase === 2;
    const qualityTypes = qualityTypesForPhase(phase, input.goalDistance);

    const workouts = scheduleWeek(
      weekNumber,
      phase,
      weeklyKm,
      daysPerWeek,
      qualityTypes,
      paces,
      useStrides,
      isRecovery,
      isTaper
    );

    const totalKm = workouts.reduce((sum, w) => sum + w.distanceKm, 0);

    let focus = PHASE_FOCUS[phase];
    if (isTaper) focus = 'Polimento (taper): volume reduzido, mantendo um pouco de ritmo. Chegue descansado na prova.';
    else if (isRecovery) focus = 'Semana de recuperação: volume reduzido (~20%) para absorver a carga.';

    return {
      weekNumber,
      phase,
      phaseName: PHASE_NAMES[phase],
      focus,
      totalKm,
      isRecovery,
      isTaper,
      workouts,
    };
  });

  return {
    vdot: input.vdot,
    goalDistance: input.goalDistance,
    totalWeeks,
    weeklyKmStart: start,
    weeklyKmPeak: peak,
    paces,
    weeks,
  };
}

/** Calcula quantas semanas há até a data-alvo (padrão 16 se ausente/invalida). */
export function weeksUntil(goalDate?: string | null): number {
  if (!goalDate) return 16;
  const target = new Date(goalDate).getTime();
  if (Number.isNaN(target)) return 16;
  const now = Date.now();
  const diffWeeks = Math.ceil((target - now) / (7 * 24 * 3600 * 1000));
  return clamp(diffWeeks, 4, 24);
}
