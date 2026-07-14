import { getTrainingPaces, type TrainingPaces } from './vdot';
import { parseTimeToSeconds, formatSeconds } from './time';

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
//
// Cada construtor recebe a semana dentro da fase (weekInPhase) e o índice da
// sessão na semana (sessionIndex). Isso dá:
//  - progressão: a sessão começa em ~75% do orçamento da fase e cresce até 100%;
//  - variedade: o formato rotaciona a cada semana e entre os dias de qualidade,
//    em vez de repetir o mesmo treino a fase inteira.

interface QualitySession {
  title: string;
  description: string;
  workKm: number;
}

/** Progressão dentro da fase: ~75% do orçamento na 1ª semana até 100%. */
function phaseProgress(weekInPhase: number): number {
  return Math.min(1, 0.75 + 0.1 * (weekInPhase - 1));
}

// Recuperação de R é COMPLETA (2–3× o tempo do tiro) — recuperação curta (1:1)
// é característica do treino I, não do R (Daniels, cap. 4).
const R_RECOVERY =
  'recuperação completa entre os tiros (2 a 3× o tempo do tiro, trotando ou caminhando)';

function buildR(weeklyKm: number, paces: TrainingPaces, variant: number, progress: number): QualitySession {
  const totalM = clamp(weeklyKm * 0.05 * 1000, 1200, 6000) * progress;
  const format = variant % 3;

  if (format === 1 || totalM / 400 < 4) {
    const reps = clamp(round(totalM / 200), 6, 16);
    return {
      title: `Repetições (R) — ${reps}×200m`,
      description: `Aquecimento fácil, ${reps}×200m em ritmo R (${paces.repetition200} /200m) com ${R_RECOVERY}, depois soltar. Foco em técnica e velocidade sem acidose.`,
      workKm: (reps * 200) / 1000,
    };
  }
  if (format === 2) {
    const sets = clamp(round(totalM / 800), 2, 6);
    return {
      title: `Repetições (R) — ${sets}×(2×200m + 400m)`,
      description: `Aquecimento fácil, ${sets} séries de 2×200m (${paces.repetition200} /200m) + 1×400m (${paces.repetition400} /400m) em ritmo R, com ${R_RECOVERY}, depois soltar.`,
      workKm: (sets * 800) / 1000,
    };
  }
  const reps = clamp(round(totalM / 400), 4, 12);
  return {
    title: `Repetições (R) — ${reps}×400m`,
    description: `Aquecimento fácil, ${reps}×400m em ritmo R (${paces.repetition400} /400m) com ${R_RECOVERY}, depois soltar. Foco em técnica e velocidade sem acidose.`,
    workKm: (reps * 400) / 1000,
  };
}

const I_REP_OPTIONS = [600, 800, 1000, 1200, 1600, 2000];

/** Escolhe a distância do tiro de I para o tempo por repetição ficar entre 3 e 5 min (Daniels). */
function chooseIntervalDistance(paceSecPerKm: number): number {
  const targetSeconds = 240; // ~4 min, meio do intervalo 3–5 min
  const rawMeters = (targetSeconds / paceSecPerKm) * 1000;
  return I_REP_OPTIONS.reduce((best, d) => (Math.abs(d - rawMeters) < Math.abs(best - rawMeters) ? d : best));
}

function stepIRep(d: number, delta: number): number {
  const i = I_REP_OPTIONS.indexOf(d);
  return I_REP_OPTIONS[clamp(i + delta, 0, I_REP_OPTIONS.length - 1)];
}

function buildI(weeklyKm: number, paces: TrainingPaces, variant: number, progress: number): QualitySession {
  const paceSecPerKm = parseTimeToSeconds(paces.interval) ?? 240;
  const base = chooseIntervalDistance(paceSecPerKm);
  const totalM = clamp(weeklyKm * 0.08 * 1000, 2000, 8000) * progress;
  const format = variant % 3;

  if (format === 2 && stepIRep(base, 1) !== base) {
    // Escada: sobe e desce ao redor da distância-base.
    const seq = [stepIRep(base, -1), base, stepIRep(base, 1), base, stepIRep(base, -1)];
    while (seq.reduce((a, b) => a + b, 0) > totalM * 1.2 && seq.length > 3) seq.pop();
    const workM = seq.reduce((a, b) => a + b, 0);
    const label = seq.join('-');
    return {
      title: `Intervalos (I) — escada ${label}m`,
      description: `Aquecimento, escada de ${label}m em ritmo I (${paces.interval}/km) com trote de recuperação de duração parecida com o tiro anterior (~1:1), depois soltar. Estímulo de VO₂max com variação de distância.`,
      workKm: workM / 1000,
    };
  }

  const rep = format === 1 ? stepIRep(base, -1) : base;
  const reps = clamp(round(totalM / rep), 3, format === 1 ? 8 : 6);
  const repSeconds = (paceSecPerKm / 1000) * rep;
  return {
    title: `Intervalos (I) — ${reps}×${rep}m`,
    description: `Aquecimento, ${reps}×${rep}m em ritmo I (${paces.interval}/km, ~${formatSeconds(repSeconds)} por tiro) com trote de recuperação de duração parecida (~1:1), depois soltar. Cada tiro entre 3 e 5 min — estímulo de VO₂max.`,
    workKm: (reps * rep) / 1000,
  };
}

function buildT(weeklyKm: number, paces: TrainingPaces, variant: number, progress: number): QualitySession {
  const totalM = clamp(weeklyKm * 0.1 * 1000, 3000, 12000) * progress;
  const format = variant % 3;

  if (format === 1 && totalM >= 4800) {
    const reps = clamp(round(totalM / 1600), 3, 8);
    return {
      title: `Limiar (T) — ${reps}×1600m (cruise)`,
      description: `Aquecimento, ${reps}×1600m em ritmo T (${paces.threshold}/km) com 1 min de trote entre as repetições, depois soltar.`,
      workKm: (reps * 1600) / 1000,
    };
  }
  if (format === 2 && totalM >= 6400) {
    const reps = clamp(round(totalM / 3200), 2, 4);
    return {
      title: `Limiar (T) — ${reps}×3200m (cruise)`,
      description: `Aquecimento, ${reps}×3200m em ritmo T (${paces.threshold}/km) com 2 min de trote entre as repetições, depois soltar. Blocos longos, quase um tempo contínuo.`,
      workKm: (reps * 3200) / 1000,
    };
  }
  const workKm = round(Math.min(totalM, 6400)) / 1000;
  return {
    title: `Limiar (T) — tempo contínuo`,
    description: `Aquecimento, ${workKm.toFixed(1)} km contínuos em ritmo T (${paces.threshold}/km) — esforço "confortavelmente difícil", depois soltar.`,
    workKm,
  };
}

function buildM(weeklyKm: number, paces: TrainingPaces, weekInPhase: number): QualitySession {
  // Teto do Daniels: o menor entre 18 milhas (~29km) e 20% do volume semanal.
  const capKm = clamp(weeklyKm * 0.2, 4, 29);
  // Progride ao longo da fase: 12% → 15% → 18% → 20% do volume semanal.
  const ratio = Math.min(0.2, 0.12 + 0.03 * (weekInPhase - 1));
  const workKm = clamp(round(weeklyKm * ratio), 4, capKm);
  return {
    title: `Ritmo de Maratona (M) — ${workKm} km`,
    description: `Aquecimento leve e ${workKm} km em ritmo M (${paces.marathon}/km), simulando o ritmo-alvo de prova.`,
    workKm,
  };
}

function buildQuality(
  type: WorkoutType,
  weeklyKm: number,
  paces: TrainingPaces,
  weekInPhase: number,
  sessionIndex: number
): QualitySession | null {
  // Rotaciona o formato semana a semana; o offset por sessão evita que os dois
  // dias de qualidade da mesma semana saiam idênticos (ex.: Fase II com R+R).
  const variant = weekInPhase - 1 + sessionIndex;
  const progress = phaseProgress(weekInPhase);
  switch (type) {
    case 'R':
      return buildR(weeklyKm, paces, variant, progress);
    case 'I':
      return buildI(weeklyKm, paces, variant, progress);
    case 'T':
      return buildT(weeklyKm, paces, variant, progress);
    case 'M':
      return buildM(weeklyKm, paces, weekInPhase);
    default:
      return null;
  }
}

// --- Volume semanal ---------------------------------------------------------

// Daniels (cap. 4): o volume deve ficar estável por 3-4 semanas antes de
// qualquer aumento — nunca subir toda semana. Usamos o teto do intervalo (4)
// pra também coincidir com a semana de recuperação (a cada 4ª semana).
const PLATEAU_WEEKS = 4;

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
  // Progressão em degraus: mantém o volume igual por PLATEAU_WEEKS semanas,
  // depois sobe pro próximo patamar — nunca aumenta semana a semana.
  const rampWeeks = Math.max(1, Math.round(totalWeeks * 0.5));
  const numSteps = Math.max(1, Math.ceil(rampWeeks / PLATEAU_WEEKS));
  const step = Math.min(numSteps - 1, Math.floor(weekIndex / PLATEAU_WEEKS));
  const progress = numSteps > 1 ? step / (numSteps - 1) : 1;
  let vol = start + (peak - start) * progress;
  if (isRecovery) vol *= 0.8;
  return round(vol);
}

/**
 * Trava de segurança do longão (Daniels, cap. 4 e 16): até 30% do volume semanal
 * para quem corre menos de 64km/semana; para volumes maiores, o menor entre
 * 25% do volume semanal ou 150 minutos (calculado no ritmo fácil do atleta).
 *
 * Exceção iniciante (cap. 4 — tempo de estresse importa mais que distância fixa
 * pro corredor mais lento): em semanas muito baixas de volume, sobe pra até 50%
 * pra concentrar o volume no longão e manter as corridas de semana curtas,
 * em vez de diluir tudo em dias parecidos e monótonos.
 */
function longRunCapKm(weeklyKm: number, easySlowPace: string, experience?: string | null): number {
  if (experience === 'iniciante' && weeklyKm > 0 && weeklyKm <= 40) {
    return weeklyKm * 0.5;
  }
  if (weeklyKm < 64) {
    return weeklyKm * 0.3;
  }
  const paceMinPerKm = (parseTimeToSeconds(easySlowPace) ?? 360) / 60;
  const kmIn150Min = 150 / paceMinPerKm;
  return Math.min(weeklyKm * 0.25, kmIn150Min);
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
  isTaper: boolean,
  weekInPhase: number,
  experience?: string | null
): PlannedWorkout[] {
  const days: WorkoutType[] = ['E', 'E', 'E', 'E', 'E', 'E', 'E'];

  // Longão no domingo (dia 7).
  days[6] = 'L';

  // Dias de qualidade (terça e quinta), limitados por recuperação e dias/semana.
  let maxQuality = qualityTypes.length;
  if (isRecovery || isTaper) maxQuality = Math.min(maxQuality, 1);
  if (daysPerWeek <= 3) maxQuality = Math.min(maxQuality, 1);
  const qSlots = [1, 3]; // índices: terça, quinta
  const builtByDay: Record<number, QualitySession> = {};
  for (let i = 0; i < maxQuality && i < qSlots.length; i++) {
    const session = buildQuality(qualityTypes[i], weeklyKm, paces, weekInPhase, i);
    if (!session) continue;
    days[qSlots[i]] = qualityTypes[i];
    builtByDay[qSlots[i]] = session;
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
  const longCap = longRunCapKm(weeklyKm, paces.easySlow, experience);
  // Iniciante em semana de volume muito baixo: mira o próprio teto (até 50%)
  // pra concentrar o volume no longão, em vez do alvo padrão de ~28%.
  const longTargetRatio = experience === 'iniciante' && weeklyKm > 0 && weeklyKm <= 40 ? 0.5 : 0.28;
  const longKm = clamp(round(weeklyKm * longTargetRatio), 6, Math.max(6, round(longCap)));
  const qualityKm: Record<number, number> = {};
  let qualityTotal = 0;
  // Aquecimento + soltura: mais longos pra quem tem mais volume semanal.
  const wu = weeklyKm >= 60 ? 5 : weeklyKm >= 40 ? 4 : 3;
  for (const [dayIdx, session] of Object.entries(builtByDay)) {
    const km = round(session.workKm + wu);
    qualityKm[Number(dayIdx)] = km;
    qualityTotal += km;
  }

  const eDayIndices = days
    .map((t, i) => ({ t, i }))
    .filter((d) => d.t === 'E')
    .map((d) => d.i);

  // O longão deve ser sempre a corrida mais longa da semana — nenhum dia de E
  // pode passar disso (senão "fácil" vira mais puxado que o próprio longão).
  const eCap = Math.max(4, longKm);
  const remaining = Math.max(0, weeklyKm - longKm - qualityTotal);

  // Um dia E do meio da semana vira "corrida média" (~70% do longão) quando há
  // dias E e volume suficientes — segunda corrida mais longa da semana, em vez
  // de diluir tudo em dias idênticos.
  let midIdx = -1;
  let midKm = 0;
  if (eDayIndices.length >= 3) {
    const midCandidates = [2, 4, 0, 5]; // qua, sex, seg, sáb
    midIdx = midCandidates.find((i) => eDayIndices.includes(i)) ?? -1;
    if (midIdx >= 0) {
      midKm = clamp(round(longKm * 0.7), 5, round(eCap));
      // Só vale a pena se sobrar o mínimo (4 km/dia) pros demais dias E.
      if (remaining - midKm < (eDayIndices.length - 1) * 4) {
        midIdx = -1;
        midKm = 0;
      }
    }
  }

  const plainECount = eDayIndices.length - (midIdx >= 0 ? 1 : 0);
  // Dias E comuns nunca passam da corrida média (senão o nome inverte).
  const plainECap = midIdx >= 0 ? Math.min(eCap, midKm) : eCap;
  const perE = plainECount > 0 ? clamp(round((remaining - midKm) / plainECount), 4, plainECap) : 0;

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
      if (i === midIdx) {
        return {
          day,
          dayName,
          type,
          title: `Corrida média — ${midKm} km`,
          description: `${midKm} km em ritmo E (${paces.easySlow}–${paces.easyFast}/km). Segunda corrida mais longa da semana — reforça a base aeróbica sem a carga do longão.`,
          distanceKm: midKm,
          quality: false,
        };
      }
      // Meio de semana (terça a sexta): dias de E que sobraram sem qualidade
      // são os candidatos naturais pra strides — inclui terça/quinta, que é
      // onde o iniciante com poucos dias por semana efetivamente corre.
      const strides = useStrides && i >= 1 && i <= 4;
      return {
        day,
        dayName,
        type,
        title: `Corrida fácil${strides ? ' + strides (retas)' : ''}`,
        description: `${perE} km em ritmo E (${paces.easySlow}–${paces.easyFast}/km)${
          strides
            ? ', terminando com 4 a 6 strides: tiros leves e rápidos de 15 a 20s (passada larga, boa postura — não é sprint máximo), com 45 a 60s de descanso completo (andando ou parado) entre um e outro.'
            : '.'
        }`,
        distanceKm: perE,
        quality: false,
      };
    }
    // Qualidade
    const built = builtByDay[i];
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

// Dias mínimos de treino por semana, por nível (Daniels, cap. 8 — planos
// Red/Blue exigem um mínimo de dias pra diluir o volume com segurança).
const MIN_DAYS_BY_EXPERIENCE: Record<string, number> = {
  intermediário: 4, // plano Red
  avançado: 5, // plano Blue
};

export function generatePlan(input: PlanInput): GeneratedPlan {
  const totalWeeks = clamp(Math.round(input.totalWeeks), 4, 24);
  const minDays = MIN_DAYS_BY_EXPERIENCE[input.experience ?? ''] ?? 0;
  const daysPerWeek = clamp(Math.max(input.daysPerWeek ?? 5, minDays), 3, 7);
  const start = input.weeklyKm && input.weeklyKm > 0 ? input.weeklyKm : defaultWeeklyKm(input.experience);
  const peak = round(Math.max(start, start * 1.25));
  const paces = getTrainingPaces(input.vdot);

  const phases = splitPhases(totalWeeks);

  let prevPhase: number | null = null;
  let weekInPhase = 0;
  const weeks: PlannedWeek[] = phases.map((phase, index) => {
    weekInPhase = phase === prevPhase ? weekInPhase + 1 : 1;
    prevPhase = phase;

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
      isTaper,
      weekInPhase,
      input.experience
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

// --- Posição no plano --------------------------------------------------------

export interface PlanPosition {
  totalWeeks: number;
  /** Semana atual (1-based), sempre dentro de [1, totalWeeks]. */
  currentWeek: number;
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

function parseDateMs(value?: string | null): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Posição do atleta no plano, ancorada na data de início (plan_start_date).
 *
 * Sem âncora, o plano era regenerado a cada acesso com o horizonte encolhendo
 * até a prova — e a "semana atual" era sempre a semana 1 (Fase Base). Aqui:
 *  - a duração total é fixa (início → prova, entre 4 e 24 semanas);
 *  - a semana atual avança conforme o tempo passa, ancorando o FIM na prova
 *    (garante que o polimento caia nas semanas certas antes da competição).
 */
export function getPlanPosition(
  planStartDate?: string | null,
  goalDate?: string | null,
  now: number = Date.now()
): PlanPosition {
  const start = parseDateMs(planStartDate) ?? now;
  const goal = parseDateMs(goalDate);

  const totalWeeks = goal !== null && goal > start ? clamp(Math.ceil((goal - start) / WEEK_MS), 4, 24) : 16;

  let currentWeek: number;
  if (goal !== null && goal > now) {
    // Conta de trás pra frente a partir da prova, pro taper cair no lugar certo.
    const weeksToGoal = Math.ceil((goal - now) / WEEK_MS);
    currentWeek = totalWeeks - weeksToGoal + 1;
  } else {
    currentWeek = Math.floor((now - start) / WEEK_MS) + 1;
  }

  return { totalWeeks, currentWeek: clamp(currentWeek, 1, totalWeeks) };
}
