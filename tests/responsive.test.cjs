const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/lib/responsive.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const api = { exports: {} };
new Function('exports', 'module', source)(api.exports, api);
const { layoutForWidth } = api.exports;

test('iPhone, iPad mini, iPad and landscape layouts fit inside the available content', () => {
  for (const width of [320, 375, 390, 430, 568, 744, 768, 820, 1024, 1194, 1366]) {
    for (const insets of [0, 88]) {
      const layout = layoutForWidth(width, 1, insets);
      assert.ok(layout.width <= width - insets);
      assert.ok(layout.carouselWidth > 0 && layout.carouselWidth <= layout.contentWidth);
      assert.ok(layout.planWidth > 0 && layout.planWidth <= layout.contentWidth);
      assert.ok(layout.gridCardWidth * layout.columns + 16 * (layout.columns - 1) <= layout.contentWidth + 0.001);
    }
  }
});
test('iPad multitasking returns to the phone layout in a narrow window', () => {
  assert.equal(layoutForWidth(744).columns, 2);
  assert.equal(layoutForWidth(1024).columns, 3);
  assert.equal(layoutForWidth(390).columns, 1);
});
test('large Dynamic Type uses a single column instead of compressed cards', () => {
  assert.equal(layoutForWidth(1024, 1.6).columns, 1);
  assert.equal(layoutForWidth(375, 1.6).planWidth, layoutForWidth(375, 1.6).contentWidth - 24);
});
test('large tablets keep a bounded content width', () => {
  assert.equal(layoutForWidth(1366).width, 1100);
  assert.equal(layoutForWidth(1800).width, 1100);
});
