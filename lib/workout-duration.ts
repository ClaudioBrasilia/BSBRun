import { parseTimeToSeconds } from './time';
import type { TrainingPaces } from './vdot';

// ============================================================================
// Duração estimada de cada treino, calculada pelos ritmos do atleta.
// O Daniels raciocina em tempo de estresse — pro atleta, "≈ 50 min" é muito
// mais concreto do que "7 km". Estimativas com "≈" de propósito: terreno,
// paradas e o dia da pessoa variam.
// ============================================================================

function fmtMin(totalMin: number): string {
  const m = Math.round(totalMin);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}h` : `${h}h${String(r).padStart(2, '0')}`;
}

/**
 * Faixa/valor de duração estimada para um treino, ou null quando não se
 * aplica (descanso ou sem distância).
 */
export function estimateWorkoutDuration(
  type: string,
  distanceKm: number,
  quality: boolean,
  paces: TrainingPaces
): string | null {
  if (type === 'Rest' || distanceKm <= 0) return null;
  const minPerKm = (s: string) => (parseTimeToSeconds(s) ?? 360) / 60;
  const eSlow = minPerKm(paces.easySlow);
  const eFast = minPerKm(paces.easyFast);
  const eAvg = (eSlow + eFast) / 2;

  // Corridas inteiramente fáceis: faixa entre o ritmo E rápido e o lento.
  if (type === 'E' || (type === 'L' && !quality)) {
    return `≈ ${fmtMin(distanceKm * eFast)}–${fmtMin(distanceKm * eSlow)}`;
  }

  // Longão com bloco M: parte E + parte M — a ponta rápida considera o M.
  if (type === 'L') {
    const m = minPerKm(paces.marathon);
    return `≈ ${fmtMin(distanceKm * ((m + eFast) / 2))}–${fmtMin(distanceKm * eSlow)}`;
  }

  // Dias de qualidade: aquecimento/soltura em E + trabalho no ritmo da sessão
  // (média dos dois). Dia de R é majoritariamente E — os tiros são curtos.
  const sessionPace: Record<string, number> = {
    T: minPerKm(paces.threshold),
    I: minPerKm(paces.interval),
    M: minPerKm(paces.marathon),
    R: eAvg,
  };
  const blended = ((sessionPace[type] ?? eAvg) + eAvg) / 2;
  return `≈ ${fmtMin(distanceKm * blended)}`;
}
