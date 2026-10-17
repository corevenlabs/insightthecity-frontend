import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topTodayExperiences } from '../src/lib/topToday.ts';
const now = Date.parse('2026-10-17T12:00:00Z');
const pick = (id, extra = {}) => ({ id, section: 'top_today', isFeatured: true, isPublished: true, image: 'https://example.test/photo.jpg', sortOrder: 0, ...extra });
test('only published, selected, unexpired editorial picks qualify; no fallback to popularity', () => {
  assert.deepEqual(topTodayExperiences([
    pick('valid'), pick('not-selected', {isFeatured:false}), pick('draft',{isPublished:false}),
    pick('other',{section:'drops'}),pick('expired',{endsAt:'2026-10-17T11:59:59Z'}),
    pick('invalid-date',{endsAt:'invalid'}),pick('missing-photo',{image:''}),
  ], now).map(x=>x.id), ['valid']);
  assert.deepEqual(topTodayExperiences([pick('not-selected',{isFeatured:false})],now),[]);
});
test('uses panel order, keeps premium attractions and limits to three without mutating catalogue',()=>{
  const data=[pick('four',{sortOrder:4}),pick('second',{sortOrder:2}),pick('first',{sortOrder:1,access:'premium'}),pick('third',{sortOrder:3})];
  assert.deepEqual(topTodayExperiences(data,now).map(x=>x.id),['first','second','third']);
  assert.equal(data[0].id,'four');
});
test('selection expires at its exact end time even when Home stays open',()=>{
 const data=[pick('ending',{endsAt:'2026-10-17T12:00:05Z'})];
 assert.equal(topTodayExperiences(data,now).length,1);
 assert.equal(topTodayExperiences(data,now+5000).length,0);
});
