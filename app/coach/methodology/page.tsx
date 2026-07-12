import { BookOpen } from 'lucide-react';

interface Topic {
  title: string;
  body: string;
}

const topics: Topic[] = [
  {
    title: 'VDOT — o índice central',
    body:
      'É um número que representa a aptidão aeróbica do atleta, calculado a partir de qualquer prova ou teste (distância + tempo) — inclusive um teste de 12 minutos, pra quem nunca correu a distância-alvo. Todos os ritmos de treino são derivados só desse número.',
  },
  {
    title: 'VDOT é o mesmo que VO₂max?',
    body:
      'Não exatamente. VO₂max é medido em laboratório (esteira + analisador de gases) e representa o teto real de consumo de oxigênio da pessoa. VDOT é calculado a partir do resultado de uma prova, e já embute a economia de corrida do atleta — duas pessoas com o mesmo VO₂max podem ter VDOT diferente se uma correr de forma mais econômica. Por isso o VDOT prevê ritmos de treino melhor do que o VO₂max puro, mesmo os dois números costumando ficar na mesma faixa.',
  },
  {
    title: 'As 5 intensidades de treino',
    body:
      'E (fácil, ~62–75% do VDOT): base aeróbica, ~80% do volume total. M (ritmo de maratona, ~82%): simula o ritmo de prova. T (limiar, ~88%): "confortavelmente difícil", melhora o clearance de lactato. I (intervalo, ~98%): estimula o VO₂max, é a fase mais exigente. R (repetição, ~105%): velocidade e economia de corrida, sem acidose — recuperação completa entre tiros.',
  },
  {
    title: 'As 4 fases do plano',
    body:
      'Fase I — Base: só corrida fácil + strides, sem qualidade. Fase II — Qualidade Inicial: introduz Repetições (R). Fase III — Transição: Intervalos (I) + Limiar (T), a fase mais pesada. Fase IV — Final: Limiar (T) + ritmo de prova (M em provas longas, ou I em provas curtas), com polimento (taper) nas últimas semanas.',
  },
  {
    title: 'Trava do Longão',
    body:
      'Corredores com menos de 64 km/semana: longão pode chegar a 30% do volume da semana. Acima de 64 km/semana, a trava passa a ser o menor entre 25% do volume ou 150 minutos de duração (calculado no ritmo fácil do próprio atleta) — o que evita um longão desproporcional em quem já corre muito volume.',
  },
  {
    title: 'Trava dos tiros de Intervalo (I)',
    body:
      'Cada tiro precisa durar entre 3 e 5 minutos — por isso a distância do tiro (entre 600m e 2000m) é escolhida de acordo com o ritmo de cada atleta, não é fixa. Recuperação de trote com duração parecida ao tiro (~1:1). Volume total da sessão: até 8% do volume semanal.',
  },
  {
    title: 'Trava dos tiros de Repetição (R)',
    body:
      'Tiros de 400m (ou 200m quando o volume da sessão é baixo), com recuperação trotando o mesmo tempo do tiro. Volume total: até 5% do volume semanal. O ritmo de R é mostrado em segundos por 400m/200m — não em min/km, porque é assim que esse treino é corrido de fato, em tiros de pista.',
  },
  {
    title: 'Teto do Ritmo de Maratona (M)',
    body:
      'O treino de M não deve passar de 18 milhas (~29 km) nem de 20% do volume semanal — vale o que for menor. Nosso algoritmo mira 15% como alvo, sempre respeitando esse teto.',
  },
  {
    title: 'Limiar (T): contínuo ou cruise',
    body:
      'Até 10% do volume semanal. Sessões menores viram um tempo contínuo (ex: 20 minutos correndo em ritmo T); sessões maiores viram "cruise intervals" — repetições de 1600m com apenas 1 minuto de trote entre elas.',
  },
  {
    title: 'Semanas de recuperação e polimento',
    body:
      'A cada 4ª semana, o volume cai ~20% para o corpo absorver a carga acumulada. Nas duas últimas semanas antes da prova (Fase IV), entra o polimento (taper): o volume reduz progressivamente para o atleta chegar descansado e no pico de forma no dia da prova.',
  },
];

export default function CoachMethodologyPage() {
  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Metodologia</h1>
          <p className="text-slate-400 mt-1">
            Como o BSBRun calcula ritmos e monta planos — referência rápida da metodologia VDOT.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <div key={topic.title} className="glass rounded-2xl p-6">
            <h2 className="font-bold text-white mb-2">{topic.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{topic.body}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="font-bold text-white mb-2">Ainda não implementado</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Duas ideias ficaram no backlog por enquanto: progressão de volume em degraus (segurar o volume por
          3–4 semanas e só aumentar com base em feedback do atleta) e uma pontuação de carga de treino semanal
          (pontos por minuto em cada zona de intensidade). Hoje o volume sobe em rampa suave automática, sem
          depender de feedback.
        </p>
      </div>
    </>
  );
}
