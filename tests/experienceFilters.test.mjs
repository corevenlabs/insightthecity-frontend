import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getExperienceTags, availableExperienceTags, matchesExperienceTags } from '../src/lib/experienceFilters.ts';

const legacy = { category: 'MÚSICA', date: 'Hoy · 7 PM', access: 'free', region: 'NJ' };
const rise = { ...legacy, category: 'Museo', tags: ['Museo', 'Experiencia inmersiva'], isPaidEvent: true };

test('conserva categorías antiguas y reconoce acentos', () => {
  assert.deepEqual(getExperienceTags(legacy), ['MÚSICA']);
  assert.equal(matchesExperienceTags(legacy, ['Música']), true);
});
test('varias etiquetas coinciden con cualquiera y limpiar muestra todo', () => {
  assert.equal(matchesExperienceTags(rise, ['Evento', 'Museo']), true);
  assert.equal(matchesExperienceTags(rise, ['Experiencia inmersiva']), true);
  assert.equal(matchesExperienceTags(rise, ['Broadway']), false);
  assert.equal(matchesExperienceTags(rise, []), true);
});
test('conserva opciones de región, fecha, acceso y etiquetas personalizadas', () => {
  for (const tag of ['NJ', 'Hoy', 'Gratis']) assert.equal(matchesExperienceTags(legacy, [tag]), true);
  assert.equal(matchesExperienceTags(rise, ['Gratis']), false);
  const options = availableExperienceTags([{ ...legacy, tags: ['MÚSICA', 'Familias'] }]);
  assert.ok(options.includes('Familias'));
  assert.equal(options.filter((tag) => tag.toLowerCase() === 'música').length, 1);
  for (const tag of ['City Drop', 'Descuento', 'Museos', 'Miradores']) assert.ok(options.includes(tag));
});
