'use client';

import { Trash2 } from 'lucide-react';
import { deleteAthlete } from '@/app/coach/athletes/actions';

interface DeleteAthleteButtonProps {
  id: string;
  name: string;
  variant?: 'icon' | 'full';
}

export function DeleteAthleteButton({ id, name, variant = 'icon' }: DeleteAthleteButtonProps) {
  return (
    <form
      action={deleteAthlete}
      onSubmit={(e) => {
        if (!confirm(`Excluir ${name}? Essa ação não pode ser desfeita e apaga todo o histórico de VDOT e treinos dele(a).`)) {
          e.preventDefault();
        }
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <input type="hidden" name="id" value={id} />
      {variant === 'icon' ? (
        <button
          type="submit"
          aria-label={`Excluir ${name}`}
          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      )}
    </form>
  );
}
