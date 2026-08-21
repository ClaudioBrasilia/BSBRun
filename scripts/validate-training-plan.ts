import assert from 'node:assert/strict';
import { generatePlan } from '../lib/plan-generator';

const scenarios = [
  { name: 'iniciante baixo volume', vdot: 40, goalDistance: '5K', weeklyKm: 10, daysPerWeek: 3, experience: 'iniciante', totalWeeks: 4 },
  { name: 'iniciante progressão', vdot: 45, goalDistance: '5K', weeklyKm: 20, daysPerWeek: 5, experience: 'iniciante', totalWeeks: 8 },
  { name: 'intermediário meia', vdot: 50, goalDistance: 'Meia Maratona', weeklyKm: 50, daysPerWeek: 5, experience: 'intermediário', totalWeeks: 16 },
  { name: 'avançado maratona', vdot: 60, goalDistance: 'Maratona', weeklyKm: 70, daysPerWeek: 5, experience: 'avançado', totalWeeks: 16 },
  { name: 'meio-fundo', vdot: 55, goalDistance: '1500m', weeklyKm: 45, daysPerWeek: 6, experience: 'avançado', totalWeeks: 12 },
];

for (const input of scenarios) {
  const plan = generatePlan(input);
  assert.equal(plan.weeks.length, input.totalWeeks, `${input.name}: número de semanas`);

  for (const week of plan.weeks) {
    const actual = week.workouts.reduce((sum, workout) => sum + workout.distanceKm, 0);
    assert.equal(actual, week.totalKm, `${input.name}: total semanal inconsistente na semana ${week.weekNumber}`);

    const runningDays = week.workouts.filter((workout) => workout.distanceKm > 0).length;
    assert.ok(runningDays <= input.daysPerWeek, `${input.name}: dias acima do configurado na semana ${week.weekNumber}`);

    const quality = week.workouts.filter((workout) => workout.quality);
    assert.ok(quality.length <= 2, `${input.name}: mais de duas sessões de qualidade na semana ${week.weekNumber}`);
    assert.ok(week.workouts.filter((workout) => workout.type === 'R').length <= 1, `${input.name}: mais de uma sessão R na semana ${week.weekNumber}`);

    const long = week.workouts.find((workout) => workout.type === 'L');
    const maxDistance = Math.max(...week.workouts.map((workout) => workout.distanceKm));
    if (long) assert.equal(long.distanceKm, maxDistance, `${input.name}: longão não é a maior sessão na semana ${week.weekNumber}`);

    const strength = week.workouts.filter((workout) => workout.strength);
    assert.ok(strength.every((workout) => workout.type === 'E'), `${input.name}: força fora de um dia E na semana ${week.weekNumber}`);
    assert.ok(strength.every((workout) => Boolean(workout.strengthProgramId && workout.strengthProgramName && workout.strengthDurationMin)), `${input.name}: força sem programa identificado na semana ${week.weekNumber}`);
    const easyDays = week.workouts.filter((workout) => workout.type === 'E').length;
    const expectedStrengthDays = week.isTaper ? Math.min(1, easyDays) : Math.min(2, easyDays);
    assert.equal(strength.length, expectedStrengthDays, `${input.name}: número de sessões de força incorreto na semana ${week.weekNumber}`);
  }

  const taper = plan.weeks.filter((week) => week.isTaper);
  for (let i = 1; i < taper.length; i++) {
    assert.ok(taper[i].totalKm <= taper[i - 1].totalKm, `${input.name}: taper não reduz progressivamente`);
  }

  console.log(`${input.name}: OK (${plan.weeks.length} semanas)`);
}
