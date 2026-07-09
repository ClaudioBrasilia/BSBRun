'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Calendar, Activity, Plus, AlertCircle, Dumbbell } from 'lucide-react';
import Link from 'next/link';

const mockAthletes = [
  {
    id: '1',
    name: 'João Silva',
    vdot: 45.2,
    goalDistance: 'Meia Maratona',
    currentPhase: 'Fase II — Qualidade',
    weeklyKm: 45,
    lastWorkout: '2026-07-08',
  },
  {
    id: '2',
    name: 'Maria Santos',
    vdot: 38.5,
    goalDistance: '10K',
    currentPhase: 'Fase III — Transição',
    weeklyKm: 35,
    lastWorkout: '2026-07-07',
  },
  {
    id: '3',
    name: 'Pedro Costa',
    vdot: 52.8,
    goalDistance: 'Maratona',
    currentPhase: 'Fase I — Base',
    weeklyKm: 65,
    lastWorkout: '2026-07-08',
  },
];

const mockAlerts = [
  { id: '1', type: 'warning', title: 'Volume excessivo', message: 'João Silva aumentou 15% o volume semanal' },
  { id: '2', type: 'info', title: 'Nova prova registrada', message: 'Maria Santos completou 5K em 25:30' },
];

export default function CoachDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">BSBRun</h1>
            <p className="text-xs text-slate-400">Painel do Coach</p>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { icon: TrendingUp, label: 'Visão Geral', href: '/coach/dashboard' },
            { icon: Users, label: 'Atletas', href: '/coach/athletes' },
            { icon: Calendar, label: 'Planos', href: '/coach/plans' },
            { icon: Dumbbell, label: 'Fortalecimento', href: '/coach/strength' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Bom dia, Coach!</h1>
            <p className="text-slate-400 mt-1">Aqui está o resumo dos seus atletas</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:scale-105">
            <Plus className="w-5 h-5" />
            Novo Atleta
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Atletas Ativos', value: mockAthletes.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'VDOT Médio', value: (mockAthletes.reduce((sum, a) => sum + a.vdot, 0) / mockAthletes.length).toFixed(1), icon: TrendingUp, color: 'from-primary to-emerald-600' },
            { label: 'Treinos Hoje', value: '8', icon: Calendar, color: 'from-purple-500 to-pink-500' },
            { label: 'Alertas', value: mockAlerts.length, icon: AlertCircle, color: 'from-orange-500 to-red-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Atletas Recentes</h2>
          <div className="space-y-4">
            {mockAthletes.map((athlete) => (
              <motion.div
                key={athlete.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {athlete.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{athlete.name}</div>
                    <div className="text-sm text-slate-400">{athlete.currentPhase}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{athlete.vdot}</div>
                  <div className="text-xs text-slate-400">VDOT</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
