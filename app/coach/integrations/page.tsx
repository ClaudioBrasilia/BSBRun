import { Plug } from 'lucide-react';
import { integrations } from '@/lib/integrations';

export default function IntegrationsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Integrações</h1>
        <p className="text-slate-400 mt-1">
          Conecte o BSBRun a outros aplicativos para importar treinos automaticamente.
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
                <span className="text-xs text-yellow-400">
                  {provider.status === 'coming_soon' ? 'Em breve' : 'Disponível'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 flex-1 mb-4">{provider.description}</p>
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-slate-500 font-semibold rounded-xl cursor-not-allowed"
            >
              <Plug className="w-4 h-4" />
              Conectar
            </button>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 mt-8">
        <h2 className="text-lg font-bold text-white mb-2">Como funcionará</h2>
        <p className="text-sm text-slate-400">
          A estrutura de integrações já está preparada no código (<code className="text-primary">lib/integrations</code>).
          Quando você quiser ativar o Strava, basta registrar um app no Strava, adicionar as credenciais
          nas variáveis de ambiente e implementar o fluxo de autorização — o resto do app já está pronto para
          receber as atividades importadas.
        </p>
      </div>
    </>
  );
}
