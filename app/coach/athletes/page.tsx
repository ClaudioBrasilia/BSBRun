import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { getAthletes } from '@/lib/data/athletes';
import { AthletesList } from '@/components/AthletesList';

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
        {athletes.length > 0 && (
          <Link
            href="/coach/athletes/new"
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Novo Atleta
          </Link>
        )}
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
        <AthletesList athletes={athletes} />
      )}
    </>
  );
}
