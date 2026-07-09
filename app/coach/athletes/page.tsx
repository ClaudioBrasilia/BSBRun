import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { getAthletes } from '@/lib/data/athletes';

export const dynamic = 'force-dynamic';

export default async function AthletesPage() {
  const athletes = await getAthletes();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Atletas</h1>
          <p className="text-slate-400 mt-1">Gerencie os atletas que você treina</p>
        </div>
        <Link
          href="/coach/athletes/new"
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Novo Atleta
        </Link>
      </div>

      {athletes.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 mb-6">Nenhum atleta cadastrado ainda.</p>
          <Link
            href="/coach/athletes/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Cadastrar atleta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {athletes.map((athlete) => (
            <Link
              key={athlete.id}
              href={`/coach/athletes/${athlete.id}`}
              className="glass rounded-2xl p-6 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {athlete.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{athlete.name}</div>
                  <div className="text-xs text-slate-400">
                    {athlete.experience ?? 'nível não informado'}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Objetivo</div>
                  <div className="text-sm text-slate-300">{athlete.goal_distance ?? '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{athlete.vdot ?? '—'}</div>
                  <div className="text-xs text-slate-400">VDOT</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
