import Link from 'next/link';
import { Users, TrendingUp, Activity, Plus } from 'lucide-react';
import { getAthletes } from '@/lib/data/athletes';
import { getRecentActivity } from '@/lib/data/workouts';
import { RecentActivityFeed } from '@/components/RecentActivityFeed';
import { getAthleteMonitoringSummaries } from '@/lib/data/monitoring';

export const dynamic = 'force-dynamic';

export default async function CoachDashboard() {
  const [athletes, recentActivity] = await Promise.all([getAthletes(), getRecentActivity()]);
  const monitoring = await getAthleteMonitoringSummaries(athletes);

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

      <section className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-white">Monitoramento de carga e bem-estar</h2>
            <p className="text-xs text-slate-500 mt-1">Indicadores descritivos dos últimos 7–28 dias; não são diagnóstico nem decisão automática.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500 border-b border-slate-800">
              <tr><th className="py-3 pr-4">Atleta</th><th className="py-3 pr-4">Carga 7d</th><th className="py-3 pr-4">Base 28d</th><th className="py-3 pr-4">Recuperação</th><th className="py-3 pr-4">RPE / dor</th><th className="py-3">Status</th></tr>
            </thead>
            <tbody>
              {monitoring.map((item) => {
                const statusLabel = { normal: 'Normal', atencao: 'Atenção', prioritario: 'Prioritário', sem_dados: 'Sem dados' }[item.status];
                const statusColor = { normal: 'text-emerald-400', atencao: 'text-amber-400', prioritario: 'text-red-400', sem_dados: 'text-slate-500' }[item.status];
                return <tr key={item.athlete.id} className="border-b border-slate-800/70 last:border-0">
                  <td className="py-3 pr-4"><Link href={`/coach/athletes/${item.athlete.id}`} className="text-white hover:text-primary">{item.athlete.name}</Link><div className="text-[11px] text-slate-500">{item.statusReason}</div></td>
                  <td className="py-3 pr-4 text-slate-300">{item.load7d || '—'}</td>
                  <td className="py-3 pr-4 text-slate-400">{item.baselineWeekly28d || '—'}</td>
                  <td className="py-3 pr-4 text-slate-300">{item.recoveryScore ?? '—'}</td>
                  <td className="py-3 pr-4 text-slate-400">{item.latestRpe ?? '—'} / {item.latestPain ?? '—'}</td>
                  <td className={`py-3 font-semibold ${statusColor}`}>{statusLabel}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>

      <RecentActivityFeed items={recentActivity} />
    </>
  );
}
