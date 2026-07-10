'use client';

import { motion } from 'framer-motion';
import { Play, Check } from 'lucide-react';
import { useState } from 'react';
import { strengthPrograms } from '@/lib/strength-exercises';

export default function AthleteStrengthPage() {
  const [selectedProgram, setSelectedProgram] = useState(strengthPrograms[0]);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const toggleExercise = (exerciseId: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompletedExercises(newCompleted);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Fortalecimento &amp; Prevenção</h1>
        <p className="text-slate-400 mt-1">Exercícios para melhorar sua corrida e prevenir lesões</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Selecione o Programa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {strengthPrograms.map((program) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedProgram(program);
                setCompletedExercises(new Set());
              }}
              className={`glass rounded-2xl p-6 cursor-pointer transition-all ${
                selectedProgram.id === program.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <h3 className="font-bold text-white mb-2">{program.name}</h3>
              <p className="text-sm text-slate-400 mb-3">{program.duration}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{program.exercises.length} exercícios</span>
                <span className="text-primary font-semibold">{program.frequency}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div key={selectedProgram.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{selectedProgram.name}</h2>
          <p className="text-slate-400">{selectedProgram.description}</p>
        </div>

        <div className="space-y-4">
          {selectedProgram.exercises.map((exercise, index) => {
            const isCompleted = completedExercises.has(exercise.id);

            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`p-6 rounded-xl transition-all ${
                  isCompleted ? 'bg-primary/10 border-2 border-primary' : 'bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleExercise(exercise.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isCompleted ? 'bg-primary text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
                    </button>
                    <div>
                      <h3 className={`text-lg font-bold ${isCompleted ? 'text-primary' : 'text-white'}`}>
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">{exercise.description}</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 bg-primary/20 hover:bg-primary/30 rounded-lg flex items-center justify-center transition-all">
                    <Play className="w-5 h-5 text-primary" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {exercise.sets && exercise.reps && (
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Séries/Reps</div>
                      <div className="text-lg font-bold text-white">{exercise.sets}x{exercise.reps}</div>
                    </div>
                  )}
                  {exercise.duration && (
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Duração</div>
                      <div className="text-lg font-bold text-white">{exercise.duration}s</div>
                    </div>
                  )}
                  {exercise.restSeconds && (
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Descanso</div>
                      <div className="text-lg font-bold text-white">{exercise.restSeconds}s</div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {exercise.targetMuscles.map((muscle) => (
                    <span key={muscle} className="px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-300">
                      {muscle}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-slate-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Progresso da Sessão</h3>
            <span className="text-2xl font-bold text-primary">
              {completedExercises.size}/{selectedProgram.exercises.length}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-emerald-400 h-3 rounded-full transition-all"
              style={{ width: `${(completedExercises.size / selectedProgram.exercises.length) * 100}%` }}
            />
          </div>
          {completedExercises.size === selectedProgram.exercises.length && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-primary/20 rounded-lg text-center"
            >
              <span className="text-primary font-bold">🎉 Parabéns! Sessão completa!</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}
