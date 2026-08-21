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

/** Dias entre agora e a data informada (negativo se já passou). Retorna null se a data for inválida/ausente. */
export function daysUntilDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / (24 * 3600 * 1000));
}

/** Texto amigável de contagem regressiva a partir do número de dias (ver daysUntilDate). */
export function formatCountdown(days: number | null): string | null {
  if (days === null) return null;
  if (days < 0) return 'prova já passou';
  if (days === 0) return 'prova é hoje!';
  return `faltam ${days} dia${days > 1 ? 's' : ''}`;
}

// --- Datas de calendário (strings YYYY-MM-DD, sempre em UTC) ----------------

/** Data de hoje como "YYYY-MM-DD". */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Soma dias a uma data "YYYY-MM-DD". */
export function addDaysISO(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Segunda-feira da semana que contém a data (semanas de segunda a domingo). */
export function mondayOfISO(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = segunda ... 6 = domingo
  return addDaysISO(dateStr, -dow);
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
