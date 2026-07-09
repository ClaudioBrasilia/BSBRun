'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, TrendingUp, Users, Dumbbell, Plug, LogOut } from 'lucide-react';
import { logout } from '@/app/(auth)/actions';

const navItems = [
  { icon: TrendingUp, label: 'Visão Geral', href: '/coach/dashboard' },
  { icon: Users, label: 'Atletas', href: '/coach/athletes' },
  { icon: Dumbbell, label: 'Fortalecimento', href: '/coach/strength' },
  { icon: Plug, label: 'Integrações', href: '/coach/integrations' },
];

export function CoachSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-lg flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">BSBRun</h1>
          <p className="text-xs text-slate-400">Painel do Coach</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-primary text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </form>
    </aside>
  );
}
