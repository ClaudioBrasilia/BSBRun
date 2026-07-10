import Link from 'next/link';
import { Plus, Users, Calendar, Activity } from 'lucide-react';
import { getAthletes } from '@/lib/data/athletes';
import { DeleteAthleteButton } from '@/components/DeleteAthleteButton';

export const dynamic = 'force-dynamic';

function daysUntil(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const target = new Date(dateStr).getTime();
  if (Number.isNaN(target)) return null;
  const days = Math.ceil((target - Date.now()) / (24 * 3600 * 1000));
  if (days < 0) return 'prova já passou';
  if (days === 0) return 'prova é hoje!';
  return `faltam ${days} dia${days > 1 ? 's' : ''}`;
}

export default async function AthletesPage() {
  const athletes = await getAthletes();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Atletas</h1>
          <p className="text-slate-400 mt-1">Gerencie os atletas que você treina</p>
        </div>
        <Link
          href="/coach/athletes/new"
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Novo Atleta
        </Link>
      </div>

      {athletes.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 mb-6">Nenhum atleta cadastrado ainda.</p>
          <Link
            href="/coach/athletes/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Cadastrar atleta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {athletes.map((athlete) => {
            const countdown = daysUntil(athlete.goal_date);
            return (
              <div key={athlete.id} className="glass rounded-2xl p-6 flex flex-col">
                <Link href={`/coach/athletes/${athlete.id}`} className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {athlete.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{athlete.name}</div>
                    <div className="text-xs text-slate-400">
                      {athlete.experience ?? 'nível não informado'}
                    </div>
                  </div>
                </Link>

                <div className="space-y-1.5 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {athlete.goal_distance ?? 'Sem objetivo'}
                      {athlete.weekly_km ? ` · ${athlete.weekly_km} km/sem` : ''}
                      {athlete.days_per_week ? ` · ${athlete.days_per_week}x/sem` : ''}
                    </span>
                  </div>
                  {countdown && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {new Date(athlete.goal_date!).toLocaleDateString('pt-BR')} — {countdown}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-800">
                  <div>
                    <div className="text-2xl font-bold text-primary">{athlete.vdot ?? '—'}</div>
                    <div className="text-xs text-slate-400">VDOT</div>
                  </div>
                  <DeleteAthleteButton id={athlete.id} name={athlete.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
