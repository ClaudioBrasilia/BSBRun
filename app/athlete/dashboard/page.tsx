'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Target, Activity, Dumbbell } from 'lucide-react';
import Link from 'next/link';

const mockAthleteData = {
  name: 'João Silva',
  vdot: 45.2,
  goalDistance: 'Meia Maratona',
  currentPhase: 'Fase II — Qualidade Inicial',
  weekNumber: 6,
  totalWeeks: 16,
  weeklyKm: 45,
  todayWorkout: {
    type: 'T',
    description: '4×1600m @ 4:45/km com 1min descanso',
    distance: 12,
    duration: 55,
  },
  todayStrength: {
    title: 'Fortalecimento Base',
    duration: 25,
    exercises: 7,
  },
};

export default function AthleteDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Meu Treino</h1>
            <p className="text-xs text-slate-400">BSBRun</p>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { icon: TrendingUp, label: 'Dashboard', href: '/athlete/dashboard' },
            { icon: Calendar, label: 'Treinos', href: '/athlete/training' },
            { icon: Target, label: 'Progresso', href: '/athlete/progress' },
            { icon: Dumbbell, label: 'Fortalecimento', href: '/athlete/strength' },
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Olá, {mockAthleteData.name}!</h1>
          <p className="text-slate-400 mt-1">
            Semana {mockAthleteData.weekNumber} de {mockAthleteData.totalWeeks} • {mockAthleteData.currentPhase}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'VDOT Atual', value: mockAthleteData.vdot, icon: TrendingUp, color: 'from-primary to-emerald-600' },
            { label: 'Objetivo', value: mockAthleteData.goalDistance, icon: Target, color: 'from-blue-500 to-cyan-500' },
            { label: 'Volume Semanal', value: `${mockAthleteData.weeklyKm}km`, icon: Activity, color: 'from-purple-500 to-pink-500' },
            { label: 'Progresso', value: `${Math.round((mockAthleteData.weekNumber / mockAthleteData.totalWeeks) * 100)}%`, icon: Calendar, color: 'from-orange-500 to-red-500' },
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
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Treino de Corrida de Hoje</h2>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-semibold">
                {mockAthleteData.todayWorkout.type}
              </span>
            </div>
            <p className="text-slate-300 mb-4">{mockAthleteData.todayWorkout.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Distância</div>
                <div className="text-2xl font-bold text-white">{mockAthleteData.todayWorkout.distance}km</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Duração</div>
                <div className="text-2xl font-bold text-white">{mockAthleteData.todayWorkout.duration}min</div>
              </div>
            </div>
            <button className="w-full mt-4 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all">
              Iniciar Treino
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Fortalecimento de Hoje</h2>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-semibold">
                <Dumbbell className="w-4 h-4 inline" />
              </span>
            </div>
            <p className="text-slate-300 mb-4">{mockAthleteData.todayStrength.title}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Exercícios</div>
                <div className="text-2xl font-bold text-white">{mockAthleteData.todayStrength.exercises}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Duração</div>
                <div className="text-2xl font-bold text-white">{mockAthleteData.todayStrength.duration}min</div>
              </div>
            </div>
            <Link
              href="/athlete/strength"
              className="block text-center w-full mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-600/90 text-white font-semibold rounded-xl transition-all"
            >
              Ver Exercícios
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
