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

  if (saved.length > 0) {
    const activitiesByDay = await getActivitiesByDay(athlete.id, saved[0].day);
    return (
      <>
        <SavedPlanView
          athlete={athlete}
          workouts={saved}
          mode="coach"
          backHref={`/coach/athletes/${athlete.id}`}
          backLabel="Voltar ao atleta"
          title={`Plano de Treino — ${athlete.name}`}
          activitiesByDay={activitiesByDay}
        />
        <form action={saveAction} className="mt-8 glass rounded-2xl p-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-white font-semibold">Regenerar plano</p>
            <p className="text-xs text-slate-500">
              Recalcula tudo a partir dos dados atuais do atleta (VDOT, prova, volume). Substitui o plano salvo —
              edições manuais e treinos marcados como concluídos serão perdidos.
            </p>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-all shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerar
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <TrainingPlanView
        athlete={athlete}
        backHref={`/coach/athletes/${athlete.id}`}
        backLabel="Voltar ao atleta"
        title={`Plano de Treino — ${athlete.name}`}
      />
      <form action={saveAction} className="mt-8 glass rounded-2xl p-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-white font-semibold">Salvar plano no banco</p>
          <p className="text-xs text-slate-500">
            Grava cada treino com data no calendário. Com o plano salvo, o atleta pode marcar treinos como
            concluídos e você pode editar sessões individualmente — e o plano fica congelado mesmo que os dados
            do atleta mudem depois. {!athlete.vdot && 'Sem VDOT, salva o Programa Iniciante (do zero à corrida).'}
          </p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl transition-all shrink-0"
        >
          <Save className="w-4 h-4" />
          Salvar plano
        </button>
      </form>
    </>
  );
}
