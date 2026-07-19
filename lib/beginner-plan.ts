import type { PlannedWeek, PlannedWorkout } from './plan-generator';

// ============================================================================
// Programa Iniciante — do zero aos 30 minutos de corrida contínua.
//
// Baseado no plano White do Daniels (cap. 8): sessões de ~30 min medidas por
// TEMPO (não distância), alternando caminhada e corrida leve, com progressão
// gradual e uma semana mais leve a cada 4 para absorver a carga. Não exige
// VDOT nem prova anterior — é a porta de entrada para o plano completo.
// ============================================================================

export const BEGINNER_TOTAL_WEEKS = 16;

interface BeginnerWeekSpec {
  minutes: number;
  title: string;
  main: string;
  recovery?: boolean;
}

const WARMUP = '5 min de caminhada em ritmo confortável para aquecer';
const RUN_NOTE =
  'A corrida deve ser BEM leve — se não dá pra conversar, está rápido demais. O objetivo é tempo em movimento, não velocidade.';

const WEEK_SPECS: BeginnerWeekSpec[] = [
  // Etapa 1 — Adaptação: andar e correr (S1–4)
  { minutes: 31, title: 'Caminhada + corrida — 31 min', main: `${WARMUP}, depois 8×(1 min de corrida leve + 2 min de caminhada), e 2 min de caminhada para soltar` },
  { minutes: 31, title: 'Caminhada + corrida — 31 min', main: `${WARMUP}, depois 8×(1min30 de corrida leve + 1min30 de caminhada), e 2 min de caminhada para soltar` },
  { minutes: 32, title: 'Caminhada + corrida — 32 min', main: `${WARMUP}, depois 7×(2 min de corrida leve + 1min30 de caminhada), e 2 min de caminhada para soltar` },
  { minutes: 25, title: 'Semana leve — 25 min', main: `${WARMUP}, depois 6×(1min30 de corrida leve + 1min30 de caminhada), e 2 min de caminhada para soltar`, recovery: true },
  // Etapa 2 — Blocos de corrida (S5–8)
  { minutes: 32, title: 'Blocos de corrida — 32 min', main: `${WARMUP}, depois 5×(3 min de corrida leve + 2 min de caminhada), e 2 min de caminhada para soltar` },
  { minutes: 31, title: 'Blocos de corrida — 31 min', main: `${WARMUP}, depois 4×(4 min de corrida leve + 2 min de caminhada), e 2 min de caminhada para soltar` },
  { minutes: 33, title: 'Blocos de corrida — 33 min', main: `${WARMUP}, depois 4×(5 min de corrida leve + 1min30 de caminhada), e 2 min de caminhada para soltar` },
  { minutes: 27, title: 'Semana leve — 27 min', main: `${WARMUP}, depois 4×(3 min de corrida leve + 2 min de caminhada), e 2 min de caminhada para soltar`, recovery: true },
  // Etapa 3 — Rumo à corrida contínua (S9–12)
  { minutes: 32, title: 'Corrida com pausas — 32 min', main: `${WARMUP}, depois 3×(8 min de corrida leve + 2 min de caminhada)` },
  { minutes: 32, title: 'Corrida com pausas — 32 min', main: `${WARMUP}, depois 2×(12 min de corrida leve + 3 min de caminhada)` },
  { minutes: 33, title: 'Corrida com 1 pausa — 33 min', main: `${WARMUP}, depois 15 min de corrida leve + 3 min de caminhada + 10 min de corrida leve` },
  { minutes: 31, title: 'Semana leve — 31 min', main: `${WARMUP}, depois 2×(10 min de corrida leve + 3 min de caminhada)`, recovery: true },
  // Etapa 4 — Corrida contínua (S13–16)
  { minutes: 30, title: 'Corrida contínua — 20 min', main: `${WARMUP}, depois 20 min de corrida leve SEM parar, e 5 min de caminhada para soltar` },
  { minutes: 35, title: 'Corrida contínua — 25 min', main: `${WARMUP}, depois 25 min de corrida leve sem parar, e 5 min de caminhada para soltar` },
  { minutes: 40, title: 'Corrida contínua — 30 min', main: `${WARMUP}, depois 30 min de corrida leve sem parar, e 5 min de caminhada para soltar` },
  { minutes: 40, title: 'Corrida contínua — 30 min + retas', main: `${WARMUP}, depois 30 min de corrida leve sem parar, terminando com 4 tiros leves de 15s (strides), e caminhada para soltar` },
];

const STAGE_OF_WEEK = (weekNumber: number): { name: string; focus: string } => {
  if (weekNumber <= 4)
    return {
      name: 'Etapa 1 — Andar e correr',
      focus: 'Adaptação: alternar caminhada e corrida leve para preparar músculos, tendões e articulações sem sobrecarga.',
    };
  if (weekNumber <= 8)
    return {
      name: 'Etapa 2 — Blocos de corrida',
      focus: 'Blocos de corrida cada vez maiores, sempre em ritmo conversável, com caminhada entre eles.',
    };
  if (weekNumber <= 12)
    return {
      name: 'Etapa 3 — Rumo à corrida contínua',
      focus: 'Poucas pausas: o corpo aprende a sustentar a corrida por mais tempo.',
    };
  return {
    name: 'Etapa 4 — Corrida contínua',
    focus:
      'Corrida contínua de 20 a 30 minutos. Ao completar, faça um teste leve de 5K (ou 12 minutos) para calcular o VDOT e desbloquear o plano completo.',
  };
};

/**
 * Gera o programa iniciante de 16 semanas. Sessões por tempo (distanceKm = 0,
 * durationMin preenchido) em 3 a 5 dias/semana, com força 2×/semana.
 */
export function generateBeginnerPlan(daysPerWeekInput?: number | null): { totalWeeks: number; weeks: PlannedWeek[] } {
  const daysPerWeek = Math.min(5, Math.max(3, daysPerWeekInput ?? 3));
  // Ordem de preferência dos dias de sessão: ter, qui, dom, sáb, seg.
  const sessionDays = [1, 3, 6, 5, 0].slice(0, daysPerWeek).sort((a, b) => a - b);
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const weeks: PlannedWeek[] = WEEK_SPECS.map((spec, index) => {
    const weekNumber = index + 1;
    const stage = STAGE_OF_WEEK(weekNumber);
    const strengthDays = sessionDays.slice(0, 2);

    const workouts: PlannedWorkout[] = dayNames.map((dayName, i) => {
      if (!sessionDays.includes(i)) {
        return {
          day: i + 1,
          dayName,
          type: 'Rest',
          title: 'Descanso',
          description: 'Descanso ou caminhada leve.',
          distanceKm: 0,
          quality: false,
          strength: false,
        };
      }
      return {
        day: i + 1,
        dayName,
        type: 'E',
        title: spec.title,
        description: `${spec.main}. ${RUN_NOTE}`,
        distanceKm: 0,
        durationMin: spec.minutes,
        quality: false,
        strength: strengthDays.includes(i),
      };
    });

    return {
      weekNumber,
      phase: 0, // marca o programa iniciante (sem fase VDOT)
      phaseName: stage.name,
      focus: stage.focus,
      totalKm: 0,
      isRecovery: spec.recovery ?? false,
      isTaper: false,
      workouts,
    };
  });

  return { totalWeeks: BEGINNER_TOTAL_WEEKS, weeks };
}
