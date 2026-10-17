import test from 'node:test';
import assert from 'node:assert/strict';
import lib from '../js/lib.js';
const { getGuestName, canChi, lunarLabel, validateRsvp, formatDate, isHttpsUrl, monthGrid } = lib;

test('getGuestName đọc và cắt tên', () => {
  assert.equal(getGuestName('?to=Anh%20Nam'), 'Anh Nam');
  assert.equal(getGuestName(''), '');
  assert.equal(getGuestName('?to=' + 'a'.repeat(100)).length, 60);
});
test('canChi', () => { assert.equal(canChi(2026), 'Bính Ngọ'); assert.equal(canChi(2024), 'Giáp Thìn'); });
test('lunarLabel có định dạng đúng', () => {
  assert.match(lunarLabel(new Date('2026-10-24T00:00:00')), /^Tức ngày \d+ tháng \S+ năm Bính Ngọ$/);
});
test('validateRsvp', () => {
  assert.equal(validateRsvp({ name: 'An', attend: 'yes' }).length, 0);
  assert.equal(validateRsvp({ name: '', attend: '' }).length, 2);
  assert.equal(validateRsvp({ name: 'An', attend: 'no', wish: 'x'.repeat(501) }).length, 1);
});
test('formatDate', () => assert.equal(formatDate('2026-10-24'), '24/10/2026'));
test('isHttpsUrl chỉ nhận https', () => {
  assert.equal(isHttpsUrl('https://maps.app.goo.gl/abc'), true);
  assert.equal(isHttpsUrl('javascript:alert(1)'), false);
  assert.equal(isHttpsUrl('http://x.com'), false);
  assert.equal(isHttpsUrl(''), false);
});
test('monthGrid tháng 10/2026: 1/10 là thứ Năm, 24 và 25 rơi vào T7 và CN', () => {
  const w = monthGrid(2026, 10);
  assert.deepEqual(w[0], [null, null, null, 1, 2, 3, 4]);
  assert.deepEqual(w[3], [19, 20, 21, 22, 23, 24, 25]);
  assert.deepEqual(w[4], [26, 27, 28, 29, 30, 31, null]);
  assert.equal(w.length, 5);
});
test('monthGrid: tháng bắt đầu Chủ nhật có 6 ô trống đầu', () => {
  assert.equal(monthGrid(2026, 2)[0].filter((d) => d === null).length, 6); // 1/2/2026 là Chủ nhật
});
