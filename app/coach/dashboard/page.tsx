import Link from 'next/link';
import { Users, TrendingUp, Activity, Plus, Dumbbell } from 'lucide-react';
import { getAthletes } from '@/lib/data/athletes';

export const dynamic = 'force-dynamic';

export default async function CoachDashboard() {
  const athletes = await getAthletes();

  const withVdot = athletes.filter((a) => typeof a.vdot === 'number');
  const avgVdot =
    withVdot.length > 0
      ? (withVdot.reduce((sum, a) => sum + (a.vdot ?? 0), 0) / withVdot.length).toFixed(1)
      : '—';
  const totalKm = athletes.reduce((sum, a) => sum + (a.weekly_km ?? 0), 0);

  const stats = [
    { label: 'Atletas Ativos', value: athletes.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'VDOT Médio', value: avgVdot, icon: TrendingUp, color: 'from-primary to-emerald-600' },
    { label: 'Volume Total/sem', value: `${totalKm}km`, icon: Activity, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Painel do Coach</h1>
          <p className="text-slate-400 mt-1">Resumo dos seus atletas</p>
        </div>
        <Link
          href="/coach/athletes/new"
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Novo Atleta
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Atletas</h2>

        {athletes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 mb-6">Você ainda não cadastrou nenhum atleta.</p>
            <Link
              href="/coach/athletes/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Cadastrar primeiro atleta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {athletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/coach/athletes/${athlete.id}`}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {athlete.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{athlete.name}</div>
                    <div className="text-sm text-slate-400">
                      {athlete.goal_distance ? `Objetivo: ${athlete.goal_distance}` : 'Sem objetivo definido'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{athlete.vdot ?? '—'}</div>
                  <div className="text-xs text-slate-400">VDOT</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
