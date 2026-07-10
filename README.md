# 🏃 BSBRun

Plataforma de treinamento de corrida baseada na **Fórmula de Jack Daniels (VDOT)**, para coaches gerenciarem seus atletas — com cálculo automático de ritmos, calculadora pública de VDOT e módulo de fortalecimento e prevenção de lesões.

## ✨ Funcionalidades

- ✅ **Login e cadastro reais** (Supabase Auth)
- ✅ **Painel do coach** com dados reais dos atletas (sem dados fictícios)
- ✅ **Cadastro de atletas** com cálculo automático de VDOT a partir de uma prova
- ✅ **Detalhe do atleta**: VDOT, ritmos de treino (E, M, T, I, R), tempos equivalentes e histórico
- ✅ **Calculadora de VDOT pública** — qualquer pessoa pode usar sem login
- ✅ **Módulo de fortalecimento** com exercícios e programas por fase
- ✅ **Integrações preparadas** (Strava, Garmin, Google Fit — em breve)

## 🧱 Stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Supabase](https://supabase.com/) (Postgres + Auth) via `@supabase/ssr`
- [Tailwind CSS](https://tailwindcss.com/) · [Framer Motion](https://www.framer.com/motion/) · [lucide-react](https://lucide.dev/)

## 🚀 Rodando localmente

```bash
git clone https://github.com/claudiobrasilia/bsbrun.git
cd bsbrun
npm install

cp .env.example .env.local   # preencha com as chaves do Supabase (ver abaixo)
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). A landing page e a **calculadora de VDOT** funcionam mesmo sem o Supabase configurado; o painel do coach exige as chaves.

## 🗄️ Configurando o Supabase

### Opção A — manual (funciona sempre, recomendada para o primeiro teste)

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole o conteúdo de
   [`supabase/migrations/20260710025022_initial_schema.sql`](supabase/migrations/20260710025022_initial_schema.sql)
   e clique em **Run** (cria tabelas, políticas de segurança e o gatilho de criação de perfil).
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
4. Preencha no `.env.local` (e nas variáveis de ambiente da Vercel):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   ```

### Opção B — integração automática com o GitHub

O Supabase consegue aplicar as migrations automaticamente a cada push, sem precisar rodar SQL manualmente:

1. No painel do Supabase: **Project Settings → Integrations → GitHub** → conecte e autorize o repositório `bsbrun`.
2. Edite [`supabase/config.toml`](supabase/config.toml) e troque `project_id` pela **Reference ID** do seu projeto (em Project Settings → General).
3. Depois de conectado, qualquer novo arquivo `.sql` adicionado em `supabase/migrations/` é aplicado automaticamente quando você faz push na branch principal.

> A integração só reconhece o repositório se ele tiver a estrutura da CLI do Supabase (`supabase/config.toml` + `supabase/migrations/*.sql`) — por isso os dois arquivos já vêm prontos aqui. Se o Supabase não achar o repositório na lista ao conectar, confirme se o **GitHub App do Supabase** tem permissão de acesso a ele em github.com/settings/installations.

> Por padrão o Supabase pede **confirmação de e-mail** no cadastro. Para testar rápido, você pode desativar em **Authentication → Providers → Email → Confirm email**.

## ☁️ Deploy na Vercel

1. Faça push para o GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** e importe o repositório `bsbrun`.
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Clique em **Deploy**. O Next.js é detectado automaticamente.

## 📁 Estrutura

```
app/
├── page.tsx                  # Landing page
├── calculator/               # Calculadora de VDOT (pública)
├── (auth)/                   # Login / cadastro + server actions de auth
└── coach/                    # Área protegida do coach
    ├── layout.tsx            # Sidebar + guarda de configuração
    ├── dashboard/            # Visão geral (dados reais)
    ├── athletes/             # Lista, cadastro e detalhe do atleta
    ├── strength/             # Fortalecimento
    └── integrations/         # Integrações (preparadas)
lib/
├── vdot.ts                   # Cálculos de VDOT, paces e equivalências
├── time.ts                   # Parse/format de tempos
├── strength-exercises.ts     # Exercícios e programas
├── supabase/                 # Clients (browser/server), middleware, tipos
├── data/                     # Consultas ao banco
└── integrations/             # Registro de integrações
supabase/
├── config.toml              # Config para a integração GitHub do Supabase
└── migrations/*.sql         # Schema do banco (fonte da verdade)
```

## 🔌 Integrações (próximo passo)

A estrutura em `lib/integrations` já está pronta. Para ativar o **Strava**:

1. Registre um app em [strava.com/settings/api](https://www.strava.com/settings/api).
2. Adicione `STRAVA_CLIENT_ID` e `STRAVA_CLIENT_SECRET` ao ambiente.
3. Implemente o fluxo OAuth em `app/api/integrations/strava/`.

## 📚 Referência

Baseado em *Daniels' Running Formula* — Jack Daniels, 3ª Edição.
