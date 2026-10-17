/**
 * Nhận xác nhận tham dự + lời chúc, ghi vào Google Sheets.
 * Cài đặt: Sheets > Tiện ích mở rộng > Apps Script > dán file này > Triển khai > Ứng dụng web
 * (Thực thi với tư cách: Tôi; Ai có quyền truy cập: Bất kỳ ai). Mỗi lần sửa code phải triển khai "phiên bản mới".
 * Chống spam: honeypot, thời gian điền tối thiểu, giới hạn tần suất, giới hạn độ dài, tùy chọn Cloudflare Turnstile.
 * Nguồn: https://developers.google.com/apps-script/guides/web ; https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
const LIMITS = { name: 60, wish: 500, minMs: 3000, perNamePerHour: 3, globalPerMinute: 20, maxRows: 1000 };

/** Bỏ ký tự điều khiển, cắt độ dài. */
function sanitize_(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

/** Hàm thuần: kiểm tra dữ liệu gửi lên. Trả về {ok, code} hoặc {ok, data}. */
function evaluate_(d) {
  if (!d || d.website) return { ok: false, code: 'spam' };            // honeypot bị điền
  if (!(Number(d.elapsed) >= LIMITS.minMs)) return { ok: false, code: 'too_fast' }; // bot gửi quá nhanh
  const name = sanitize_(d.name, LIMITS.name);
  if (name.length < 2 || !['yes', 'no'].includes(d.attend)) return { ok: false, code: 'invalid' };
  return { ok: true, data: { name, attend: d.attend, wish: sanitize_(d.wish, LIMITS.wish), guest: sanitize_(d.guest, LIMITS.name) } };
}

/** Giới hạn tần suất theo tên (mỗi giờ) và toàn cục (mỗi phút), dùng CacheService. */
function rateLimit_(name, nowMs) {
  const cache = CacheService.getScriptCache();
  const hit = (key, max, ttl) => {
    const n = Number(cache.get(key) || 0);
    if (n >= max) return false;
    cache.put(key, String(n + 1), ttl);
    return true;
  };
  const ok = hit('g:' + Math.floor(nowMs / 60000), LIMITS.globalPerMinute, 120) &&
             hit('n:' + encodeURIComponent(name.toLowerCase()).slice(0, 200), LIMITS.perNamePerHour, 3600);
  return ok ? { ok: true } : { ok: false, code: 'rate' };
}

/** Tùy chọn: xác minh Turnstile. Chỉ bật khi đặt TURNSTILE_SECRET trong Project Settings > Script properties. */
function verifyTurnstile_(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) return true;
  if (!token) return false;
  const res = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'post', payload: { secret: secret, response: token }, muteHttpExceptions: true });
  return JSON.parse(res.getContentText()).success === true;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() { return reply_({ ok: true, status: 'alive' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000); // tránh hai lượt gửi ghi chồng nhau
  try {
    let d;
    try { d = JSON.parse(e.postData.contents); } catch (_) { return reply_({ ok: false, code: 'invalid' }); }
    const r = evaluate_(d);
    if (!r.ok) return reply_(r);
    if (!verifyTurnstile_(d.token)) return reply_({ ok: false, code: 'captcha' });
    const rl = rateLimit_(r.data.name, Date.now());
    if (!rl.ok) return reply_(rl);
    const sh = SpreadsheetApp.getActiveSheet();
    if (sh.getLastRow() >= LIMITS.maxRows) return reply_({ ok: false, code: 'full' });
    const row = [Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'),
      r.data.name, r.data.attend === 'yes' ? 'Có' : 'Không', r.data.wish, r.data.guest];
    // Định dạng văn bản thuần trước khi ghi để chuỗi như "=1+1" không bị Sheets hiểu là công thức.
    sh.getRange(sh.getLastRow() + 1, 1, 1, row.length).setNumberFormat('@').setValues([row]);
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, code: 'server' });
  } finally {
    lock.releaseLock();
  }
}
