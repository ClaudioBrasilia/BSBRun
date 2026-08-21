import { notFound } from 'next/navigation';
import { getAthlete } from '@/lib/data/athletes';
import { getSavedWorkouts } from '@/lib/data/workouts';
import { getActivitiesByDay } from '@/lib/data/strava';
import { TrainingPlanView } from '@/components/TrainingPlanView';
import { SavedPlanView } from '@/components/SavedPlanView';
import { PlanActionBar } from '@/components/PlanActionBar';

export const dynamic = 'force-dynamic';

export default async function AthletePlanPage({ params }: { params: { id: string } }) {
  const athlete = await getAthlete(params.id);
  if (!athlete) notFound();

  const saved = await getSavedWorkouts(athlete.id);
  const isSaved = saved.length > 0;

  const actionBar = <PlanActionBar athleteId={athlete.id} isSaved={isSaved} hasVdot={Boolean(athlete.vdot)} />;

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
