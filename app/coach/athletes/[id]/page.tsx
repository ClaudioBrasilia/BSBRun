import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, TrendingUp, CalendarRange, Pencil } from 'lucide-react';
import { getAthlete, getVdotHistory } from '@/lib/data/athletes';
import { getTrainingPaces, getPerformanceEquivalences } from '@/lib/vdot';
import { formatSeconds } from '@/lib/time';
import { DeleteAthleteButton } from '@/components/DeleteAthleteButton';

export const dynamic = 'force-dynamic';

export default async function AthleteDetailPage({ params }: { params: { id: string } }) {
  const athlete = await getAthlete(params.id);
  if (!athlete) {
    notFound();
  }

  const history = await getVdotHistory(athlete.id);
  const paces = athlete.vdot ? getTrainingPaces(athlete.vdot) : null;
  const equivalences = athlete.vdot ? getPerformanceEquivalences(athlete.vdot) : null;

  const paceRows = paces
    ? [
        { label: 'Easy (lento)', value: paces.easySlow },
        { label: 'Easy (rápido)', value: paces.easyFast },
        { label: 'Maratona (M)', value: paces.marathon },
        { label: 'Threshold (T)', value: paces.threshold },
        { label: 'Interval (I)', value: paces.interval },
        { label: 'Repetition 400 (R)', value: paces.repetition400 },
      ]
    : [];

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/coach/athletes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-white">{athlete.name}</h1>
          <p className="text-slate-400 mt-1">
            {[
              athlete.experience,
              athlete.age ? `${athlete.age} anos` : null,
              athlete.goal_distance ? `Objetivo: ${athlete.goal_distance}` : null,
              athlete.weekly_km ? `${athlete.weekly_km} km/sem` : null,
              athlete.days_per_week ? `${athlete.days_per_week}x/sem` : null,
              athlete.goal_date ? `Prova: ${new Date(athlete.goal_date).toLocaleDateString('pt-BR')}` : null,
            ]
              .filter(Boolean)
              .join(' • ') || 'Sem dados adicionais'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {athlete.vdot && (
            <Link
              href={`/coach/athletes/${athlete.id}/plan`}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all text-sm font-semibold"
            >
              <CalendarRange className="w-4 h-4" />
              Gerar plano
            </Link>
          )}
          <Link
            href={`/coach/athletes/${athlete.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all text-sm font-semibold"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
          <DeleteAthleteButton id={athlete.id} name={athlete.name} variant="full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-8 text-center flex flex-col justify-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">VDOT atual</span>
          </div>
          <div className="text-6xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            {athlete.vdot ?? '—'}
          </div>
          {athlete.race_distance && athlete.race_time_seconds && (
            <p className="text-xs text-slate-500 mt-3">
              Base: {athlete.race_distance} em {formatSeconds(athlete.race_time_seconds)}
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4">Ritmos de Treino (por km)</h2>
          {paces ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {paceRows.map((row) => (
                <div key={row.label} className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-xs text-slate-400">{row.label}</div>
                  <div className="text-lg font-bold text-white">{row.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Sem VDOT calculado. Edite o atleta e informe uma prova recente.
            </p>
          )}
        </div>
      </div>

      {equivalences && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Tempos Equivalentes</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(equivalences).map(([name, t]) => (
              <div key={name} className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">{name}</div>
                <div className="text-lg font-bold text-white">{t}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Histórico de VDOT</h2>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhum registro ainda.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="text-sm text-slate-300">
                  {h.race_distance} — {formatSeconds(h.race_time_seconds)}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">
                    {new Date(h.recorded_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-lg font-bold text-primary">{h.vdot}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {athlete.notes && (
        <div className="glass rounded-2xl p-6 mt-8">
          <h2 className="text-lg font-bold text-white mb-2">Observações</h2>
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{athlete.notes}</p>
        </div>
      )}
    </>
  );
}
