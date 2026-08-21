'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, UserCheck, UserPlus, Unlink } from 'lucide-react';
import { generateInviteLink, unlinkAthleteAccount } from '@/app/coach/athletes/actions';

interface InviteAthleteCardProps {
  athleteId: string;
  inviteCode: string | null;
  linked: boolean;
}

export function InviteAthleteCard({ athleteId, inviteCode, linked }: InviteAthleteCardProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (linked) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-white">Atleta já está usando o app</div>
            <div className="text-sm text-slate-400">Essa conta tem acesso ao próprio painel, plano e fortalecimento.</div>
          </div>
        </div>

        {!confirmUnlink ? (
          <button
            onClick={() => setConfirmUnlink(true)}
            className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <Unlink className="w-4 h-4" />
            Desvincular conta
          </button>
        ) : (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-slate-300 mb-3">
              Isso desconecta a conta de login atual e gera um <strong className="text-white">novo link de convite</strong>.
              O plano e os dados do atleta são mantidos — mas ele precisará entrar de novo com o link novo. Use isto se a
              conta ficou presa ou foi vinculada errada. Continuar?
            </p>
            <div className="flex gap-2">
              <form action={unlinkAthleteAccount.bind(null, athleteId)}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  Sim, desvincular
                </button>
              </form>
              <button
                onClick={() => setConfirmUnlink(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-sm rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const link = inviteCode && origin ? `${origin}/athlete/join?code=${inviteCode}` : '';

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-white">Convidar atleta</h2>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Gere um link para que este atleta crie a própria conta e acesse seu painel, plano de treino e fortalecimento.
      </p>

      {inviteCode ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300"
          />
          <button
            onClick={copy}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <form action={generateInviteLink.bind(null, athleteId)}>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all text-sm"
            >
              Gerar novo link
            </button>
          </form>
        </div>
      ) : (
        <form action={generateInviteLink.bind(null, athleteId)}>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Gerar link de convite
          </button>
        </form>
      )}
    </div>
  );
}
