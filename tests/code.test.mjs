import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Nạp Code.gs vào sandbox, giả lập CacheService để test logic chống spam.
const store = new Map();
const ctx = vm.createContext({
  CacheService: { getScriptCache: () => ({ get: (k) => store.get(k) ?? null, put: (k, v) => store.set(k, v) }) },
});
vm.runInContext(fs.readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8'), ctx);
const good = { name: ' Nguyễn An ', attend: 'yes', wish: 'Chúc mừng', elapsed: 5000 };

test('hợp lệ: làm sạch tên', () => {
  const r = ctx.evaluate_(good);
  assert.equal(r.ok, true); assert.equal(r.data.name, 'Nguyễn An');
});
test('honeypot bị điền -> spam', () => assert.equal(ctx.evaluate_({ ...good, website: 'x.com' }).code, 'spam'));
test('gửi quá nhanh hoặc thiếu elapsed -> too_fast', () => {
  assert.equal(ctx.evaluate_({ ...good, elapsed: 800 }).code, 'too_fast');
  assert.equal(ctx.evaluate_({ ...good, elapsed: undefined }).code, 'too_fast');
});
test('tên ngắn hoặc attend sai -> invalid', () => {
  assert.equal(ctx.evaluate_({ ...good, name: 'A' }).code, 'invalid');
  assert.equal(ctx.evaluate_({ ...good, attend: 'maybe' }).code, 'invalid');
});
test('cắt độ dài và bỏ ký tự điều khiển', () => {
  const r = ctx.evaluate_({ ...good, wish: 'a\u0000b' + 'x'.repeat(600) });
  assert.equal(r.data.wish.length, 500); assert.ok(!r.data.wish.includes('\u0000'));
});
test('giới hạn theo tên: 3 lần/giờ', () => {
  store.clear();
  const t = 1_000_000;
  assert.equal([1, 2, 3].every(() => ctx.rateLimit_('An', t).ok), true);
  assert.equal(ctx.rateLimit_('An', t).code, 'rate');
  assert.equal(ctx.rateLimit_('Bình', t).ok, true);
});
test('giới hạn toàn cục: 20 lượt/phút', () => {
  store.clear();
  const t = 2_000_000;
  for (let i = 0; i < 20; i++) assert.equal(ctx.rateLimit_('Khách' + i, t).ok, true);
  assert.equal(ctx.rateLimit_('Khách99', t).code, 'rate');
});
