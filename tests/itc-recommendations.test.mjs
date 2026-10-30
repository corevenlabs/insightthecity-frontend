import { test } from 'node:test';
import assert from 'node:assert/strict';
import { itcRecommendedExperiences } from '../src/lib/itcRecommendations.ts';
const item = (id, extra = {}) => ({ id, image: 'https://example.test/photo.jpg', access: 'free', isPublished: true, isItcRecommended: true, ...extra });
test('only explicitly selected and published items with a cover are recommended', () => {
  assert.deepEqual(itcRecommendedExperiences([
    item('selected'), item('off', {isItcRecommended:false}), item('old', {isItcRecommended:undefined}),
    item('draft', {isPublished:false}), item('empty', {image:' '}),
    item('featured', {isItcRecommended:false, isFeatured:true, section:'top_today'}),
  ]).map(x => x.id), ['selected']);
});
test('allows club and free content in any section and preserves access and order', () => {
  const data = [item('free', {sortOrder:2}), item('club', {access:'premium', section:'drops', sortOrder:1})];
  const before = structuredClone(data);
  assert.deepEqual(itcRecommendedExperiences(data).map(x => x.id), ['club', 'free']);
  assert.deepEqual(data, before);
  assert.equal(itcRecommendedExperiences(data)[0].access, 'premium');
});
test('no implicit fallback; ties sort consistently by id', () => {
  assert.deepEqual(itcRecommendedExperiences([item('off', {isItcRecommended:false})]), []);
  assert.deepEqual(itcRecommendedExperiences([item('b'), item('a')]).map(x => x.id), ['a','b']);
});
