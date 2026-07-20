import { notFound } from 'next/navigation';
import { Save, RefreshCw } from 'lucide-react';
import { getAthlete } from '@/lib/data/athletes';
import { getSavedWorkouts } from '@/lib/data/workouts';
import { getActivitiesByDay } from '@/lib/data/strava';
import { savePlanToDatabase } from '@/app/coach/athletes/actions';
import { TrainingPlanView } from '@/components/TrainingPlanView';
import { SavedPlanView } from '@/components/SavedPlanView';

export const dynamic = 'force-dynamic';

export default async function AthletePlanPage({ params }: { params: { id: string } }) {
  const athlete = await getAthlete(params.id);
  if (!athlete) notFound();

  const saved = await getSavedWorkouts(athlete.id);
  const saveAction = savePlanToDatabase.bind(null, athlete.id);
  const isSaved = saved.length > 0;

  // Barra de ação no topo: fica sempre visível, sem precisar rolar até o fim.
  const actionBar = (
    <form action={saveAction} className="glass rounded-2xl p-4 flex items-center gap-4 mb-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-semibold">{isSaved ? 'Regenerar plano' : 'Salvar plano no banco'}</p>
        <p className="text-xs text-slate-500">
          {isSaved
            ? 'Recalcula tudo a partir dos dados atuais do atleta. Substitui o plano salvo — edições manuais e treinos concluídos serão perdidos.'
            : 'Grava cada treino com data. Com o plano salvo, o atleta marca treinos como concluídos, envia arquivos e você edita sessões.'}
          {!athlete.vdot && !isSaved && ' Sem VDOT, salva o Programa Iniciante.'}
        </p>
      </div>
      <button
        type="submit"
        className={`flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shrink-0 ${
          isSaved ? 'bg-slate-700 hover:bg-slate-600' : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isSaved ? <RefreshCw className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        <span className="hidden sm:inline">{isSaved ? 'Regenerar' : 'Salvar plano'}</span>
        <span className="sm:hidden">{isSaved ? 'Regenerar' : 'Salvar'}</span>
      </button>
    </form>
  );

  if (isSaved) {
    const activitiesByDay = await getActivitiesByDay(athlete.id, saved[0].day);
    return (
      <>
        {actionBar}
        <SavedPlanView
          athlete={athlete}
          workouts={saved}
          mode="coach"
          backHref={`/coach/athletes/${athlete.id}`}
          backLabel="Voltar ao atleta"
          title={`Plano de Treino — ${athlete.name}`}
          activitiesByDay={activitiesByDay}
        />
      </>
    );
  }

  return (
    <>
      {actionBar}
      <TrainingPlanView
        athlete={athlete}
        backHref={`/coach/athletes/${athlete.id}`}
        backLabel="Voltar ao atleta"
        title={`Plano de Treino — ${athlete.name}`}
      />
    </>
  );
}
