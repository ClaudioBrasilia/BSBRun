export const DISTANCES: Record<string, number> = {
  "1500m": 1500,
  "Milha": 1609.344,
  "3000m": 3000,
  "5000m (5K)": 5000,
  "10000m (10K)": 10000,
  "15K": 15000,
  "Meia Maratona": 21097.5,
  "Maratona": 42195,
};

export function calcVO2(velocityMPerMin: number): number {
  return -4.60 + 0.182258 * velocityMPerMin + 0.000104 * velocityMPerMin ** 2;
}

export function calcPctVO2max(timeMinutes: number): number {
  const pct =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * timeMinutes) +
    0.2989558 * Math.exp(-0.1932605 * timeMinutes);
  return pct * 100;
}

export function calcVDOT(distanceM: number, timeSeconds: number): number {
  const timeMin = timeSeconds / 60;
  const velocity = distanceM / timeMin;
  const vo2 = calcVO2(velocity);
  const pct = calcPctVO2max(timeMin);
  const vdot = vo2 / (pct / 100);
  return Math.round(vdot * 10) / 10;
}

export function predictTime(vdot: number, targetDistanceM: number): number {
  let lo = 30;
  let hi = 86400;

  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const timeMin = mid / 60;
    const velocity = targetDistanceM / timeMin;
    const vo2 = calcVO2(velocity);
    const pct = calcPctVO2max(timeMin);
    const vdotEst = vo2 / (pct / 100);

    if (Math.abs(vdotEst - vdot) < 0.005) {
      return mid;
    } else if (vdotEst > vdot) {
      // vdotEst alto demais => tempo curto demais => precisa de mais tempo
      lo = mid;
    } else {
      // vdotEst baixo demais => tempo longo demais => precisa de menos tempo
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

export function velocityAtIntensity(vdot: number, intensityPct: number): number {
  const targetVO2 = vdot * (intensityPct / 100);
  const a = 0.000104;
  const b = 0.182258;
  const c = -4.60 - targetVO2;

  const discriminant = b ** 2 - 4 * a * c;
  if (discriminant < 0) return 0;

  const v = (-b + Math.sqrt(discriminant)) / (2 * a);
  return Math.max(v, 50);
}

export function velocityToPace(velocityMPerMin: number, unit: 'km' | 'mi' = 'km'): string {
  const divisor = unit === 'km' ? 1000 : 1609.344;
  const paceMin = divisor / velocityMPerMin;
  const minutes = Math.floor(paceMin);
  const seconds = Math.round((paceMin - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Tempo para percorrer uma distância de pista (400m, 200m) numa dada velocidade.
 * Ritmos de Repetição (R) são tradicionalmente expressos assim (ex: "1:34" para
 * 400m), não em min/km — é como o treino é corrido de fato, em tiros de pista.
 */
export function velocityToTrackPace(velocityMPerMin: number, distanceM: number): string {
  const totalSeconds = (distanceM / velocityMPerMin) * 60;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds - minutes * 60);
  return minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}`;
}

export interface TrainingPaces {
  vdot: number;
  easySlow: string;
  easyFast: string;
  marathon: string;
  threshold: string;
  interval: string;
  repetition400: string;
  repetition200: string;
}

export function getTrainingPaces(vdot: number, unit: 'km' | 'mi' = 'km'): TrainingPaces {
  const vESlow = velocityAtIntensity(vdot, 62);
  const vEFast = velocityAtIntensity(vdot, 75);
  const vM = velocityAtIntensity(vdot, 82);
  const vT = velocityAtIntensity(vdot, 88);
  const vI = velocityAtIntensity(vdot, 98);
  const vR = velocityAtIntensity(vdot, 105);

  return {
    vdot,
    easySlow: velocityToPace(vESlow, unit),
    easyFast: velocityToPace(vEFast, unit),
    marathon: velocityToPace(vM, unit),
    threshold: velocityToPace(vT, unit),
    interval: velocityToPace(vI, unit),
    repetition400: velocityToTrackPace(vR, 400),
    repetition200: velocityToTrackPace(vR * 1.02, 200),
  };
}

export function getPerformanceEquivalences(vdot: number): Record<string, string> {
  const equivalences: Record<string, string> = {};

  for (const [name, distanceM] of Object.entries(DISTANCES)) {
    const timeSec = predictTime(vdot, distanceM);
    const hours = Math.floor(timeSec / 3600);
    const minutes = Math.floor((timeSec % 3600) / 60);
    const seconds = Math.floor(timeSec % 60);

    if (hours > 0) {
      equivalences[name] = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      equivalences[name] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  return equivalences;
}
