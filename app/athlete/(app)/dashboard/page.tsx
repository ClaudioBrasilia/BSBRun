import Link from 'next/link';
import { TrendingUp, Target, CalendarRange, Dumbbell, ArrowRight } from 'lucide-react';
import { getMyAthleteProfile } from '@/lib/data/athletes';
import { daysUntilDate, formatCountdown } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function AthleteDashboardPage() {
  const athlete = await getMyAthleteProfile();

  if (!athlete) {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
        <p className="text-slate-300 mb-2">Nenhum perfil de atleta vinculado à sua conta ainda.</p>
        <p className="text-sm text-slate-500">Peça ao seu coach para gerar um novo link de convite.</p>
      </div>
    );
  }

  const countdown = formatCountdown(daysUntilDate(athlete.goal_date));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Olá, {athlete.name.split(' ')[0]}!</h1>
        <p className="text-slate-400 mt-1">
          {athlete.goal_distance ? `Seu objetivo: ${athlete.goal_distance}` : 'Nenhum objetivo definido ainda'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{athlete.vdot ?? '—'}</div>
          <div className="text-sm text-slate-400">VDOT atual</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{athlete.weekly_km ?? '—'}km</div>
          <div className="text-sm text-slate-400">Volume semanal</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
            <CalendarRange className="w-6 h-6 text-white" />
          </div>
          <div className="text-lg font-bold text-white mb-1">
            {athlete.goal_date ? new Date(athlete.goal_date).toLocaleDateString('pt-BR') : '—'}
          </div>
          <div className="text-sm text-slate-400">{countdown ?? 'Data da prova'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/athlete/plan"
          className="glass rounded-2xl p-6 flex items-center justify-between hover:bg-slate-800/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <CalendarRange className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-bold text-white">Ver treino da semana</div>
              <div className="text-sm text-slate-400">Seus treinos de hoje até domingo, com ritmos</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400" />
        </Link>

        <Link
          href="/athlete/strength"
          className="glass rounded-2xl p-6 flex items-center justify-between hover:bg-slate-800/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="font-bold text-white">Fortalecimento</div>
              <div className="text-sm text-slate-400">Exercícios e prevenção de lesões</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400" />
        </Link>
      </div>
    </>
  );
}
