import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';

export default function AthleteProgressPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-center px-6">
      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
        <Target className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Progresso</h1>
      <p className="text-slate-400 mb-8">Esta seção está em construção.</p>
      <Link
        href="/athlete/dashboard"
        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar ao Painel
      </Link>
    </div>
  );
}
