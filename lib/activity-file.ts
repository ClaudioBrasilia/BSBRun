import { XMLParser } from 'fast-xml-parser';

// ============================================================================
// Leitura de arquivos de treino GPX/TCX — formatos universais que qualquer
// app ou relógio exporta (Strava, Garmin Connect, Polar, Coros...). Extrai
// distância e duração para preencher o "realizado" de um treino sem depender
// de nenhuma API de terceiros.
// ============================================================================

export interface ParsedActivity {
  distanceKm: number;
  durationMin: number | null;
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Distância em metros entre dois pontos GPS (fórmula de haversine). */
function haversineMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

/**
 * Lê um arquivo GPX ou TCX e retorna distância (km) e duração (min).
 * Retorna null se o conteúdo não for um arquivo de atividade reconhecível.
 */
export function parseActivityFile(content: string): ParsedActivity | null {
  let doc: Record<string, any>;
  try {
    doc = parser.parse(content);
  } catch {
    return null;
  }

  // --- TCX: soma DistanceMeters/TotalTimeSeconds dos laps -------------------
  const tcx = doc.TrainingCenterDatabase;
  if (tcx) {
    let meters = 0;
    let seconds = 0;
    for (const activity of toArray(tcx.Activities?.Activity)) {
      for (const lap of toArray(activity.Lap)) {
        meters += Number(lap.DistanceMeters ?? 0) || 0;
        seconds += Number(lap.TotalTimeSeconds ?? 0) || 0;
      }
    }
    if (meters > 0) {
      return { distanceKm: round1(meters / 1000), durationMin: seconds > 0 ? round1(seconds / 60) : null };
    }
    return null;
  }

  // --- GPX: soma haversine entre trackpoints; duração pelo relógio ----------
  const gpx = doc.gpx;
  if (gpx) {
    const points: { lat: number; lon: number; time?: string }[] = [];
    for (const trk of toArray(gpx.trk)) {
      for (const seg of toArray(trk.trkseg)) {
        for (const pt of toArray(seg.trkpt)) {
          const lat = Number(pt['@_lat']);
          const lon = Number(pt['@_lon']);
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            points.push({ lat, lon, time: typeof pt.time === 'string' ? pt.time : undefined });
          }
        }
      }
    }
    if (points.length < 2) return null;

    let meters = 0;
    for (let i = 1; i < points.length; i++) {
      meters += haversineMeters(points[i - 1], points[i]);
    }
    if (meters <= 0) return null;

    const t0 = points[0].time ? Date.parse(points[0].time) : NaN;
    const t1 = points[points.length - 1].time ? Date.parse(points[points.length - 1].time!) : NaN;
    const durationMin =
      Number.isFinite(t0) && Number.isFinite(t1) && t1 > t0 ? round1((t1 - t0) / 60000) : null;

    return { distanceKm: round1(meters / 1000), durationMin };
  }

  return null;
}
