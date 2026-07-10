import { Activity, RefreshCw } from 'lucide-react';
import { getMyAthleteProfile } from '@/lib/data/athletes';
import { getStravaConnection, getStravaActivities } from '@/lib/data/strava';
import { isStravaConfigured } from '@/lib/integrations/strava';
import { formatSeconds } from '@/lib/time';
import { SyncStravaButton } from './SyncStravaButton';
import { disconnectStrava } from './actions';

export const dynamic = 'force-dynamic';

export default async function AthleteIntegrationsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const athlete = await getMyAthleteProfile();

  if (!athlete) {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
        <p className="text-slate-300 mb-2">Nenhum perfil de atleta vinculado à sua conta ainda.</p>
        <p className="text-sm text-slate-500">Peça ao seu coach para gerar um novo link de convite.</p>
      </div>
    );
  }

  const connection = await getStravaConnection(athlete.id);
  const activities = connection ? await getStravaActivities(athlete.id) : [];

  const errorMessages: Record<string, string> = {
    not_configured: 'A integração com Strava ainda não foi configurada pelo administrador.',
    no_profile: 'Não encontramos seu perfil de atleta.',
    denied: 'A autorização no Strava foi cancelada.',
    invalid_state: 'A sessão de conexão expirou. Tente novamente.',
    token_exchange: 'Não foi possível concluir a conexão com o Strava. Tente novamente.',
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Integrações</h1>
        <p className="text-slate-400 mt-1">Conecte apps externos para importar suas corridas automaticamente.</p>
      </div>

      {searchParams.error && errorMessages[searchParams.error] && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
          {errorMessages[searchParams.error]}
        </p>
      )}
      {searchParams.connected && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6">
          Conta Strava conectada! Clique em &quot;Sincronizar&quot; para importar suas corridas.
        </p>
      )}

      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Strava</h2>
              <p className="text-sm text-slate-400">
                {connection ? 'Conectado' : 'Importe corridas automaticamente do Strava'}
              </p>
            </div>
          </div>

          {!isStravaConfigured() ? (
            <span className="text-sm text-slate-500">Em breve</span>
          ) : connection ? (
            <div className="flex items-center gap-2">
              <SyncStravaButton />
              <form action={disconnectStrava}>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all text-sm"
                >
                  Desconectar
                </button>
              </form>
            </div>
          ) : (
            <a
              href="/api/integrations/strava/connect"
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all text-sm"
            >
              Conectar
            </a>
          )}
        </div>
      </div>

      {connection && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Corridas importadas</h2>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-slate-500" />
              Nenhuma corrida importada ainda. Clique em &quot;Sincronizar&quot; acima.
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="text-sm font-semibold text-white">{a.name ?? 'Corrida'}</div>
                    <div className="text-xs text-slate-500">
                      {a.start_date ? new Date(a.start_date).toLocaleDateString('pt-BR') : '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">
                      {a.distance_m ? (a.distance_m / 1000).toFixed(1) : '—'} km
                    </div>
                    <div className="text-xs text-slate-500">
                      {a.moving_time_s ? formatSeconds(a.moving_time_s) : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
