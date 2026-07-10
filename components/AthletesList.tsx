'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, Calendar, Activity, ArrowUpDown } from 'lucide-react';
import { daysUntilDate } from '@/lib/time';
import { DeleteAthleteButton } from '@/components/DeleteAthleteButton';
import type { AthleteRow } from '@/lib/supabase/types';

type SortKey = 'name' | 'vdot' | 'race';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'race', label: 'Prova mais próxima' },
  { value: 'vdot', label: 'Maior VDOT' },
  { value: 'name', label: 'Nome (A-Z)' },
];

function formatCountdown(days: number | null): string | null {
  if (days === null) return null;
  if (days < 0) return 'prova já passou';
  if (days === 0) return 'prova é hoje!';
  return `faltam ${days} dia${days > 1 ? 's' : ''}`;
}

export function AthletesList({ athletes }: { athletes: AthleteRow[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('race');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? athletes.filter((a) => a.name.toLowerCase().includes(term))
      : athletes;

    const withDays = filtered.map((a) => ({ athlete: a, days: daysUntilDate(a.goal_date) }));

    withDays.sort((a, b) => {
      if (sortBy === 'name') {
        return a.athlete.name.localeCompare(b.athlete.name, 'pt-BR');
      }
      if (sortBy === 'vdot') {
        return (b.athlete.vdot ?? -Infinity) - (a.athlete.vdot ?? -Infinity);
      }
      // race: próximas primeiro; sem data definida vai pro fim
      const aDays = a.days === null || a.days < 0 ? Infinity : a.days;
      const bDays = b.days === null || b.days < 0 ? Infinity : b.days;
      return aDays - bDays;
    });

    return withDays;
  }, [athletes, search, sortBy]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative sm:w-56">
          <ArrowUpDown className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="w-full appearance-none pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-slate-400">
          Nenhum atleta encontrado para &quot;{search}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(({ athlete, days }) => {
            const countdown = formatCountdown(days);
            return (
              <div key={athlete.id} className="glass rounded-2xl p-6 flex flex-col">
                <Link href={`/coach/athletes/${athlete.id}`} className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {athlete.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{athlete.name}</div>
                    <div className="text-xs text-slate-400">
                      {athlete.experience ?? 'nível não informado'}
                    </div>
                  </div>
                </Link>

                <div className="space-y-1.5 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {athlete.goal_distance ?? 'Sem objetivo'}
                      {athlete.weekly_km ? ` · ${athlete.weekly_km} km/sem` : ''}
                      {athlete.days_per_week ? ` · ${athlete.days_per_week}x/sem` : ''}
                    </span>
                  </div>
                  {countdown && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {new Date(athlete.goal_date!).toLocaleDateString('pt-BR')} — {countdown}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-800">
                  <div>
                    <div className="text-2xl font-bold text-primary">{athlete.vdot ?? '—'}</div>
                    <div className="text-xs text-slate-400">VDOT</div>
                  </div>
                  <DeleteAthleteButton id={athlete.id} name={athlete.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
