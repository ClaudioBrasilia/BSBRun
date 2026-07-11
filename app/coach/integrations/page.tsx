import { integrations } from '@/lib/integrations';

const statusLabel: Record<string, { text: string; className: string }> = {
  available: { text: 'Disponível', className: 'text-primary' },
  coming_soon: { text: 'Em breve', className: 'text-yellow-400' },
  requires_subscription: { text: 'Requer assinatura do desenvolvedor', className: 'text-orange-400' },
};

export default function IntegrationsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Integrações</h1>
        <p className="text-slate-400 mt-1">
          Apps que os seus atletas podem conectar para importar treinos automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((provider) => (
          <div key={provider.id} className="glass rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center">
                <provider.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">{provider.name}</h3>
                <span className={`text-xs ${statusLabel[provider.status].className}`}>
                  {statusLabel[provider.status].text}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 flex-1">{provider.description}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 mt-8">
        <h2 className="text-lg font-bold text-white mb-2">Como funciona</h2>
        <p className="text-sm text-slate-400">
          A conexão é feita pelo próprio atleta (é a conta dele que tem os treinos), na área dele em{' '}
          <strong className="text-slate-300">Integrações</strong>. Você não precisa fazer nada aqui — assim que o
          atleta conectar e sincronizar, as corridas importadas ficam disponíveis no histórico dele.
        </p>
        <p className="text-sm text-slate-400 mt-3">
          O Strava passou a exigir assinatura paga do desenvolvedor do app para usar a API (cobrada de quem
          registra o app — no caso, você). Por isso essa integração está pausada por enquanto; nada quebra e o
          app funciona normalmente sem ela.
        </p>
      </div>
    </>
  );
}
