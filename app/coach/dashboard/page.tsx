import Link from 'next/link';
import { Users, TrendingUp, Activity, Plus, ArrowRight } from 'lucide-react';
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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

      <Link
        href="/coach/athletes"
        className="glass rounded-2xl p-6 flex items-center justify-between hover:bg-slate-800/40 transition-all"
      >
        <div>
          <h2 className="text-lg font-bold text-white">
            {athletes.length === 0 ? 'Cadastre seu primeiro atleta' : 'Ver todos os atletas'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {athletes.length === 0
              ? 'Ainda não há nenhum atleta na sua conta.'
              : `${athletes.length} atleta${athletes.length > 1 ? 's' : ''} sob sua orientação.`}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400" />
      </Link>
    </>
  );
}
