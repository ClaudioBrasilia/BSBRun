/** Converte "mm:ss" ou "hh:mm:ss" em segundos. Retorna null se inválido. */
export function parseTimeToSeconds(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(':').map((p) => p.trim());
  if (parts.some((p) => p === '' || Number.isNaN(Number(p)))) return null;

  const nums = parts.map(Number);
  let seconds = 0;

  if (nums.length === 3) {
    const [h, m, s] = nums;
    if (m >= 60 || s >= 60) return null;
    seconds = h * 3600 + m * 60 + s;
  } else if (nums.length === 2) {
    const [m, s] = nums;
    if (s >= 60) return null;
    seconds = m * 60 + s;
  } else if (nums.length === 1) {
    seconds = nums[0] * 60; // apenas minutos
  } else {
    return null;
  }

  return seconds > 0 ? seconds : null;
}

/** Formata segundos em "mm:ss" ou "h:mm:ss". */
export function formatSeconds(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
