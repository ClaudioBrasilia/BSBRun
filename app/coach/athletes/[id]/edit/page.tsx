import { notFound } from 'next/navigation';
import { getAthlete } from '@/lib/data/athletes';
import { EditAthleteForm } from '@/components/EditAthleteForm';

export const dynamic = 'force-dynamic';

export default async function EditAthletePage({ params }: { params: { id: string } }) {
  const athlete = await getAthlete(params.id);
  if (!athlete) {
    notFound();
  }

  return <EditAthleteForm athlete={athlete} />;
}
