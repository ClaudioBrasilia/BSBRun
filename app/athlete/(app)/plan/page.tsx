import { getMyAthleteProfile } from '@/lib/data/athletes';
import { TrainingPlanView } from '@/components/TrainingPlanView';

export const dynamic = 'force-dynamic';

export default async function MyPlanPage() {
  const athlete = await getMyAthleteProfile();

  if (!athlete) {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
        <p className="text-slate-300 mb-2">Nenhum perfil de atleta vinculado à sua conta ainda.</p>
        <p className="text-sm text-slate-500">Peça ao seu coach para gerar um novo link de convite.</p>
      </div>
    );
  }

  return (
    <TrainingPlanView
      athlete={athlete}
      backHref="/athlete/dashboard"
      backLabel="Voltar ao painel"
      title="Meu Plano de Treino"
    />
  );
}
