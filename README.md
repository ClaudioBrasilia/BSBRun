# 🏃 BSBRun

Plataforma moderna de treinamento de corrida baseada na **Fórmula de Jack Daniels**, com áreas separadas para coaches e atletas, incluindo módulo completo de fortalecimento e prevenção de lesões.

## ✨ Funcionalidades

### Para Coaches
- ✅ Gerenciamento de múltiplos atletas
- ✅ Cálculo automático de VDOT e paces de treino
- ✅ Geração de planos periodizados (4 fases)
- ✅ Alertas de volume excessivo e risco de lesão
- ✅ Biblioteca de exercícios de fortalecimento
- ✅ Dashboard com visão geral de todos os atletas

### Para Atletas
- ✅ Dashboard personalizado com treinos do dia
- ✅ Registro de treinos e progresso
- ✅ Módulo de fortalecimento integrado
- ✅ Acompanhamento de VDOT ao longo do tempo
- ✅ Visualização de planos e fases

### Fortalecimento & Prevenção
- ✅ Exercícios específicos para corredores
- ✅ 4 programas pré-definidos (Base, Qualidade, Recuperação, Prevenção)
- ✅ Categorias: Fortalecimento, Core, Pliometria, Mobilidade, Prevenção
- ✅ Instruções detalhadas com benefícios e precauções
- ✅ Baseado no *Daniels' Running Formula* e literatura científica

## 🧱 Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [lucide-react](https://lucide.dev/) (ícones)

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/claudiobrasilia/bsbrun.git
cd bsbrun

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## ☁️ Deploy na Vercel

1. Faça o push deste repositório para o GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório `bsbrun`.
3. A Vercel detecta o Next.js automaticamente — basta clicar em **Deploy**. Nenhuma variável de ambiente é necessária.

## 📁 Estrutura

```
app/
├── layout.tsx           # Layout raiz
├── page.tsx             # Landing page
├── coach/               # Área do coach
│   ├── dashboard/
│   ├── athletes/
│   ├── plans/
│   └── strength/
└── athlete/             # Área do atleta
    ├── dashboard/
    ├── training/
    ├── progress/
    └── strength/
lib/
├── vdot.ts              # Cálculos de VDOT, paces e equivalências
└── strength-exercises.ts# Exercícios e programas de fortalecimento
types/
└── index.ts             # Tipos compartilhados
```

## 📚 Referência

Baseado em *Daniels' Running Formula* — Jack Daniels, 3ª Edição.

> **Nota:** os dados exibidos (atletas, treinos, alertas) são de demonstração (*mock*). A persistência real (banco de dados / autenticação) ainda não está implementada.
