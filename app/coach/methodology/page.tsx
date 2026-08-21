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
      'Fase I — Base: corrida fácil + strides, sem qualidade formal. Fase II — Qualidade Inicial: introduz R para meio-fundo e 5K–10K, ou T como alicerce para 15K–maratona. Fase III — Transição: I + T para provas longas e I + R para meio-fundo. Fase IV — Final: T + M para 15K–maratona, ou R/I para meio-fundo e T/I para 5K–10K. A maratona usa três semanas de polimento; as demais provas, duas.',
  },
  {
    title: 'Trava do Longão',
    body:
      'Corredores com menos de 64 km/semana: longão pode chegar a 30% do volume da semana. Acima de 64 km/semana, a trava passa a ser o menor entre 25% do volume ou 150 minutos de duração (calculado no ritmo fácil do próprio atleta) — o que evita um longão desproporcional em quem já corre muito volume. Exceção: iniciante com volume semanal muito baixo (até 40 km) pode chegar a 50% no longão — concentra o volume ali em vez de diluir em corridas de semana parecidas e monótonas.',
  },
  {
    title: 'Strides (retas) nos dias de semana',
    body:
      'Tiros leves e rápidos de 15 a 20 segundos — não é sprint máximo, é sobre passada larga e boa postura/mecânica. Descanso de 45 a 60 segundos completo (andando ou parado) entre um e outro, geralmente 4 a 6 no fim de uma corrida fácil. Servem pra melhorar a economia de corrida, preparar o atleta pra correr mais rápido depois, e quebrar a monotonia de só correr sempre no mesmo ritmo.',
  },
  {
    title: 'Por que o iniciante corre menos km por dia',
    body:
      'Pra quem é mais lento, correr a mesma distância de um atleta mais rápido significa passar bem mais tempo (e mais impacto no chão) correndo — o que importa de verdade é o tempo total de esforço, não a distância fixa. Por isso, no nível iniciante, a plataforma prefere corridas de semana mais curtas (com strides) e concentra o volume no longão de domingo, em vez de espalhar tudo igual em vários dias.',
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
    title:       'Semanas de recuperação, polimento e força',
    body:
      'A cada 4ª semana, o volume cai ~20% para o corpo absorver a carga acumulada. A força acompanha a periodização: Força Base na Fase I, Força e Cadeia Posterior nas Fases II–III, Potência e Manutenção na transição e Manutenção no Polimento. A maratona usa três semanas de taper; as demais provas usam duas. O programa de força não deve ser levado à falha e precisa ser ajustado pelo coach em caso de dor ou fadiga anormal.',
  },
  {
    title: 'Fortalecimento progressivo',
    body:
      'Os dias de corrida fácil podem receber duas sessões semanais de força. O programa selecionado depende da fase: começa com técnica e força básica, progride para cadeia posterior e unilateral, introduz potência com baixo volume e reduz a carga no polimento. Cada exercício informa séries, repetições, descanso, orientação de carga e critério de progressão; a aba Fortalecimento detalha as opções.',
  },
  {
    title: 'Progressão de volume em degraus',
    body:
      'O volume semanal fica estável por blocos de 4 semanas antes de subir pro próximo patamar — nunca aumenta toda semana. Isso coincide com a semana de recuperação (a 4ª de cada bloco), então o padrão é: 3 semanas estáveis, 1 semana de recuperação, e o próximo bloco já entra num volume maior.',
  },
  {
    title: 'Dias mínimos por nível de experiência',
    body:
      'Segue os planos Red/Blue do livro: nível intermediário exige pelo menos 4 dias de corrida por semana; avançado, pelo menos 5. Se o coach cadastrar menos dias que isso, o gerador ajusta pra cima automaticamente — volume alto diluído em poucos dias é mais arriscado.',
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
          Uma pontuação de carga de treino semanal (pontos por minuto em cada zona de intensidade), histórico de
          dor/fadiga e ajuste automático por resposta ao treino continuam no backlog. O fortalecimento é uma
          prescrição inicial progressiva para adultos sem restrições clínicas; não é diagnóstico, tratamento ou
          garantia de prevenção de lesão. Também vale registrar: nosso sistema usa 3 níveis de experiência
          (iniciante, intermediário, avançado) mapeados aos planos Red/Blue do livro — ainda não temos um nível
          "Elite/Gold" nem o plano "White" por tempo com caminhada intercalada para iniciantes completos.
        </p>
      </div>
    </>
  );
}
