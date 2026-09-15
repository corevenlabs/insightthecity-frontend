import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCardBenefit } from '../src/lib/memberBenefits.ts';

test('Snoopy nunca hereda el párrafo de Incluye como beneficio de tarjeta', () => {
  const snoopy = { access: 'premium', memberBenefit: 'Snoopy in Style estará dividida en diez áreas. '.repeat(10), includes: ['Descripción larga'], cardBenefit: '20% de descuento' };
  assert.equal(getCardBenefit(snoopy), null);
  assert.equal(getCardBenefit({ ...snoopy, showBenefitOnCard: false }), null);
});
test('solo muestra el texto breve escrito y autorizado por el administrador', () => {
  const item = { access: 'premium', showBenefitOnCard: true, cardBenefit: ' 2x1 en entradas ', memberBenefit: 'Texto detallado distinto' };
  assert.equal(getCardBenefit(item), '2x1 en entradas');
  assert.equal(getCardBenefit({ ...item, cardBenefit: null }), null);
  assert.equal(getCardBenefit({ ...item, access: 'free' }), null);
  assert.equal(getCardBenefit({ ...item, cardBenefit: 'x'.repeat(61) }), null);
  assert.equal(getCardBenefit({ ...item, cardBenefit: '20% OFF\nCondiciones' }), null);
});
