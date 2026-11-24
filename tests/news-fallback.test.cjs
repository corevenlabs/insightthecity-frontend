const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

const post = { id: 5, date: '2026-11-24T10:00:00', link: 'x', title: { rendered: 'Nota' }, excerpt: { rendered: '' }, content: { rendered: '<p>Texto</p>' } };
function load(backend) {
  const urls = [];
  const fetch = async (url) => {
    urls.push(url);
    if (url.startsWith('https://api.example.test')) return backend(url);
    return { ok: true, headers: { get: () => null }, json: async () => (url.includes('/posts/') ? post : [post]) };
  };
  const dependencies = { react: {}, '../context/LanguageContext': {}, '../constants/api': { API_URL: 'https://api.example.test' } };
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('src/lib/news.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('module', 'exports', 'require', 'fetch', source)(module, module.exports, (name) => dependencies[name], fetch);
  return { news: module.exports, urls };
}
// What the backend answered on 2026-11-24 when WordPress gave it no content.
const blank = async () => ({ ok: true, json: async () => ({ success: true, article: { title: '', excerpt: '', image: null, contentHtml: '' } }) });
const down = async () => ({ ok: false, json: async () => ({}) });

test('a blank note is read from WordPress instead of being shown empty', async () => {
  const { news } = load(blank);
  const article = await news.fetchArticle(5, 'es');
  assert.deepEqual([article.title, article.contentHtml, article.inSpanish], ['Nota', '<p>Texto</p>', undefined]);
});

test('other languages only fall back to Spanish when asked, and say so', async () => {
  for (const [backend, language] of [[blank, 'en'], [down, 'pt']]) {
    const { news } = load(backend);
    await assert.rejects(news.fetchArticle(5, language));
    assert.equal((await news.fetchArticle(5, language, { spanishFallback: true })).inSpanish, true);
  }
  const { news } = load(down);
  await assert.rejects(news.fetchNews('ny-al-dia', 1, 10, 'en'));
  assert.equal((await news.fetchNews('ny-al-dia', 1, 10, 'en', { spanishFallback: true })).items[0].inSpanish, true);
  assert.equal((await news.fetchNews('ny-al-dia', 1, 10, 'es')).items[0].inSpanish, undefined);
});

test('every screen that allows the Spanish fallback shows the notice', () => {
  for (const file of ['src/app/ny-al-dia.tsx', 'src/app/que-hacer.tsx', 'src/app/(tabs)/home.tsx']) assert.match(fs.readFileSync(file, 'utf8'), /<SpanishContentNotice visible=/);
  assert.match(fs.readFileSync('src/app/news-detail.tsx', 'utf8'), /article\.inSpanish \? `<div class="notice"/);
  for (const file of ['src/components/HomeSearch.tsx', 'src/app/(tabs)/saved.tsx']) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /spanishFallback/);
});
