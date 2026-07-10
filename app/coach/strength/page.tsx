'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Shield, Zap, Heart, Filter } from 'lucide-react';
import { useState } from 'react';
import { strengthExercises, strengthPrograms } from '@/lib/strength-exercises';

export default function CoachStrengthPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todos', icon: Filter },
    { id: 'strength', label: 'Fortalecimento', icon: Dumbbell },
    { id: 'prevention', label: 'Prevenção', icon: Shield },
    { id: 'plyometric', label: 'Pliometria', icon: Zap },
    { id: 'core', label: 'Core', icon: Heart },
  ];

  const filteredExercises = selectedCategory === 'all'
    ? strengthExercises
    : strengthExercises.filter(e => e.category === selectedCategory);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Fortalecimento &amp; Prevenção</h1>
        <p className="text-slate-400 mt-1">Exercícios de fortalecimento e prevenção de lesões pra corredores</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Programas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {strengthPrograms.map((program) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-6 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{program.name}</h3>
                  <p className="text-xs text-slate-400">{program.duration}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">{program.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{program.exercises.length} exercícios</span>
                <span className="text-primary font-semibold">{program.frequency}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{exercise.name}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  exercise.category === 'strength' ? 'bg-blue-500/20 text-blue-400' :
                  exercise.category === 'prevention' ? 'bg-green-500/20 text-green-400' :
                  exercise.category === 'plyometric' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {exercise.category}
                </span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                exercise.difficulty === 'iniciante' ? 'bg-green-500/20 text-green-400' :
                exercise.difficulty === 'intermediário' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {exercise.difficulty}
              </span>
            </div>

            <p className="text-sm text-slate-400 mb-4">{exercise.description}</p>

            <div className="space-y-2 mb-4">
              {exercise.sets && exercise.reps && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Séries/Reps:</span>
                  <span className="text-white font-semibold">{exercise.sets}x{exercise.reps}</span>
                </div>
              )}
              {exercise.duration && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Duração:</span>
                  <span className="text-white font-semibold">{exercise.duration}s</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">Músculos Alvo:</div>
              <div className="flex flex-wrap gap-1">
                {exercise.targetMuscles.map((muscle) => (
                  <span key={muscle} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-2">Benefícios:</div>
              <ul className="space-y-1">
                {exercise.benefits.slice(0, 2).map((benefit, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
