'use client';

import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <header className="relative z-10 container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BSBRun</h1>
              <p className="text-sm text-slate-400">Treinamento Inteligente</p>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Treine com a{' '}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Ciência
            </span>
            <br />
            de Jack Daniels
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Plataforma completa para coaches e atletas. Planos personalizados baseados no VDOT,
            periodização inteligente e fortalecimento preventivo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/30"
            >
              Entrar como Coach
            </Link>
            <Link
              href="/calculator"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
            >
              Calculadora de VDOT
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {[
            {
              icon: TrendingUp,
              title: 'VDOT Inteligente',
              description: 'Cálculo automático de paces baseado em resultados de provas',
              color: 'from-primary to-emerald-600',
            },
            {
              icon: Users,
              title: 'Multi-Atletas',
              description: 'Gerencie todos os seus alunos em um só lugar',
              color: 'from-blue-500 to-cyan-500',
            },
            {
              icon: Zap,
              title: 'Fortalecimento',
              description: 'Exercícios preventivos e de fortalecimento integrados',
              color: 'from-orange-500 to-red-500',
            },
            {
              icon: Activity,
              title: 'Periodização',
              description: 'Planos completos com 4 fases de treinamento',
              color: 'from-purple-500 to-pink-500',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="glass rounded-2xl p-6 hover:scale-105 transition-transform"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="relative z-10 container mx-auto px-6 py-8 text-center text-slate-500 text-sm">
        <p>Baseado em &quot;Daniels&apos; Running Formula&quot; — Jack Daniels, 3ª Edição</p>
      </footer>
    </div>
  );
}
