import Link from 'next/link';
import { Settings } from 'lucide-react';
import { AthleteSidebar } from '@/components/AthleteSidebar';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function AthleteAreaLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
        <div className="glass rounded-2xl p-8 max-w-lg text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Configuração necessária</h1>
          <p className="text-slate-400 mb-6">O app ainda não está configurado. Volte mais tarde.</p>
          <Link href="/" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all">
            Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AthleteSidebar />
      <main className="md:ml-64 px-4 pt-20 pb-8 md:p-8">{children}</main>
    </div>
  );
}
