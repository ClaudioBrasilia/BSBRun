import { notFound } from 'next/navigation';
import { getAthlete } from '@/lib/data/athletes';
import { TrainingPlanView } from '@/components/TrainingPlanView';

export const dynamic = 'force-dynamic';

export default async function AthletePlanPage({ params }: { params: { id: string } }) {
  const athlete = await getAthlete(params.id);
  if (!athlete) notFound();

  return (
    <TrainingPlanView
      athlete={athlete}
      backHref={`/coach/athletes/${athlete.id}`}
      backLabel="Voltar ao atleta"
      title={`Plano de Treino — ${athlete.name}`}
    />
  );
}
