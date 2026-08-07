import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { formatSeconds } from '@/lib/time';
import type { RecentActivityItem } from '@/lib/data/workouts';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function RecentActivityFeed({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-4">Atividade recente</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">
          Nenhum treino concluído ainda. Assim que um atleta marcar um treino, ele aparece aqui.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.workoutId}
              href={`/coach/athletes/${item.athleteId}/plan`}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white">
                  <span className="font-semibold">{item.athleteName}</span> concluiu{' '}
                  <span className="text-slate-300">{item.title ?? item.type}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {timeAgo(item.completedAt)}
                  {item.realizedDistanceKm != null && ` · ${item.realizedDistanceKm} km`}
                  {item.realizedDistanceKm != null &&
                    item.realizedDurationMin != null &&
                    item.realizedDurationMin > 0 &&
                    ` @ ${formatSeconds((item.realizedDurationMin * 60) / item.realizedDistanceKm)}/km`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
