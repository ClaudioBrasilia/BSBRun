-- ============================================================================
-- BSBRun — vincula atletas a uma conta própria (login separado do coach)
-- Rode este arquivo no SQL Editor do seu projeto Supabase (depois do schema inicial).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- athletes: colunas de vínculo com a conta do próprio atleta
-- ----------------------------------------------------------------------------
alter table public.athletes
  add column if not exists user_id     uuid references auth.users (id) on delete set null,
  add column if not exists invite_code text unique;

create index if not exists athletes_user_id_idx on public.athletes (user_id);

-- Atleta lê os próprios dados (o coach continua com acesso total via policy existente)
drop policy if exists "Atleta lê seus próprios dados" on public.athletes;
create policy "Atleta lê seus próprios dados"
  on public.athletes for select
  using (auth.uid() = user_id);

-- Atleta lê o próprio histórico de VDOT
drop policy if exists "Atleta lê seu próprio histórico de VDOT" on public.vdot_history;
create policy "Atleta lê seu próprio histórico de VDOT"
  on public.vdot_history for select
  using (
    exists (
      select 1 from public.athletes a
      where a.id = vdot_history.athlete_id and a.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Atualiza o gatilho de novo usuário: se o cadastro trouxer um invite_code
-- (metadata), vincula automaticamente a conta recém-criada ao atleta
-- correspondente. Funciona tanto com confirmação de e-mail ligada quanto
-- desligada, pois roda na criação da linha em auth.users.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
  v_invite_code text;
begin
  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'coach');
  v_invite_code := new.raw_user_meta_data ->> 'invite_code';

  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), v_role)
  on conflict (id) do nothing;

  if v_invite_code is not null then
    update public.athletes
    set user_id = new.id
    where invite_code = v_invite_code and user_id is null;
  end if;

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Consulta pública e restrita: retorna só o nome do atleta associado a um
-- invite_code, para a tela de convite mostrar "Você foi convidado por..."
-- antes do cadastro, sem expor nenhum outro dado do atleta.
-- ----------------------------------------------------------------------------
create or replace function public.get_invite_preview(p_code text)
returns table(athlete_name text)
language sql
security definer set search_path = public
as $$
  select name from public.athletes
  where invite_code = p_code and user_id is null;
$$;

grant execute on function public.get_invite_preview(text) to anon, authenticated;
