import Link from 'next/link';
import { Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { JoinForm } from './JoinForm';

export const dynamic = 'force-dynamic';

async function getInviteAthleteName(code: string): Promise<string | null> {
  if (!code || !isSupabaseConfigured) return null;
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_invite_preview', { p_code: code });
  if (error || !data || data.length === 0) return null;
  return data[0].athlete_name as string;
}

export default async function AthleteJoinPage({ searchParams }: { searchParams: { code?: string } }) {
  const code = searchParams.code ?? '';
  const athleteName = await getInviteAthleteName(code);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">BSBRun</h1>
            <p className="text-sm text-slate-400">Área do atleta</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          {!code || !athleteName ? (
            <div className="text-center">
              <p className="text-slate-300 mb-2">Este link de convite é inválido ou já foi usado.</p>
              <p className="text-sm text-slate-500">Peça ao seu coach para gerar um novo link.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-300 mb-6 text-center">
                Você foi convidado(a) como <strong className="text-white">{athleteName}</strong>. Crie sua senha
                para acessar seu painel.
              </p>
              <JoinForm code={code} athleteName={athleteName} />
            </>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
            ← Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}
