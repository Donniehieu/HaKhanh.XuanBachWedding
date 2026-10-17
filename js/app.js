(() => {
const CONFIG = window.CONFIG || {};
const EVENTS = CONFIG.events || {};
const { getGuestName, lunarLabel, validateRsvp, formatDate, isHttpsUrl, monthGrid } = window.WeddingLib;
const $ = (s) => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(location.search);

// Nếu config.js gõ sai cú pháp thì thiệp vẫn mở được; thêm ?edit=1 để thấy cảnh báo trên màn hình.
if (!window.CONFIG) {
  console.error('config.js bị lỗi cú pháp: kiểm tra dấu nháy \' \', dấu phẩy và dòng báo lỗi trong Console.');
  if (params.get('edit') === '1') document.body.insertAdjacentHTML('afterbegin',
    '<p style="position:fixed;z-index:99;top:0;left:0;right:0;margin:0;padding:.6rem;background:#b3261e;color:#fff">config.js đang lỗi cú pháp. Mở Console (F12) để xem dòng lỗi.</p>');
}

// Link riêng cho khách (?to=Anh%20Nam): tên không hiển thị trên thiệp, chỉ ghi kèm vào bảng tính khi khách gửi xác nhận.
const guest = getGuestName(location.search);

// Chữ nội dung lấy từ CONFIG.texts (nếu thiếu thì giữ chữ mặc định trong HTML).
document.querySelectorAll('[data-text]').forEach((el) => {
  const v = (CONFIG.texts || {})[el.dataset.text]; if (v) el.textContent = v;
});

// Lịch tháng: lấy tháng từ ngày cưới đầu tiên, đánh dấu tim ở các ngày có sự kiện.
const calEl = $('#cal');
const calDate = CONFIG.calendarDate || (EVENTS.ceremony || {}).date;
const dates = calDate ? [calDate] : [];
if (dates.length) {
  const [y, m] = dates[0].split('-').map(Number);
  const prefix = `${y}-${String(m).padStart(2, '0')}`;
  const marks = new Set(dates.filter((d) => d.startsWith(prefix)).map((d) => Number(d.slice(8))));
  const rows = monthGrid(y, m).map((w) => '<div class="cal-r">' +
    w.map((d) => `<span${marks.has(d) ? ' class="on"' : ''}>${d ?? ''}</span>`).join('') + '</div>').join('');
  calEl.innerHTML = `<div class="cal-in"><h3>Tháng ${m} / ${y}</h3><div class="cal-w">` +
    ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => `<span>${d}</span>`).join('') + `</div>${rows}</div>`;
} else calEl.hidden = true;

// Hiệu ứng chữ: tách từng ký tự, hiện lần lượt sau khi mở thiệp.
document.querySelectorAll('.fx, .cfx').forEach((el) => {
  el.innerHTML = [...el.textContent].map((c, i) =>
    `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
});

// Lịch cưới: điền từ CONFIG.events (ngày, giờ, âm lịch, địa điểm, link bản đồ).
document.querySelectorAll('[data-event]').forEach((li) => {
  const ev = EVENTS[li.dataset.event]; if (!ev) return;
  let lunar = ev.lunar;
  if (!lunar) { try { lunar = lunarLabel(new Date(ev.date + 'T00:00:00')); } catch { lunar = ''; } }
  const t = li.querySelector('time');
  t.dateTime = ev.date; t.textContent = formatDate(ev.date) + (lunar ? ` (${lunar})` : '');
  if (ev.label) li.querySelector('b').textContent = ev.label;
  li.querySelector('.tm').textContent = ev.time;
  li.querySelector('.venue').textContent = ev.venue || 'Địa điểm sẽ được cập nhật';
  li.querySelector('.addr').textContent = ev.address || '';
  const a = li.querySelector('a');
  if (isHttpsUrl(ev.mapUrl)) { a.href = ev.mapUrl; a.hidden = false; }
});

// Ảnh cưới: assets/photo.jpg hoặc CONFIG.photoUrl. Thêm ?edit=1 vào link để hiện nút xem thử ảnh.
const img = $('#img'), ph = $('#ph'), editMode = params.get('edit') === '1';
img.onload = () => { img.hidden = false; ph.hidden = true; };
img.onerror = () => { img.hidden = true; ph.hidden = false; };
let local = null;
if (editMode) { try { local = localStorage.getItem('photo'); } catch { /* bỏ qua */ } }
img.src = local || CONFIG.photoUrl || 'assets/photo.jpg';
$('#upl').hidden = !editMode;
$('#file').addEventListener('change', (e) => {
  const f = e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f), im = new Image();
  im.onload = () => {
    const k = Math.min(1, 700 / im.width), c = document.createElement('canvas');
    c.width = im.width * k; c.height = im.height * k;
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const data = c.toDataURL('image/jpeg', .85); img.src = data; URL.revokeObjectURL(url);
    try { localStorage.setItem('photo', data); } catch { /* ảnh quá lớn */ }
  };
  im.src = url;
});

// Nội dung mờ vào/mờ ra khi cuộn.
const blocks = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('in', e.isIntersecting)), { threshold: .2 });
  blocks.forEach((b) => io.observe(b));
} else blocks.forEach((b) => b.classList.add('in'));

// Cánh hoa hồng rơi phía sau nội dung (tắt khi người dùng bật giảm chuyển động).
function startPetals() {
  if (reduce) return;
  const layer = $('#petals');
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('i');
    p.style.cssText = `--x:${Math.random() * 100}%;--s:${10 + Math.random() * 12}px;--d:${9 + Math.random() * 8}s;` +
      `--t:${Math.random() * 8}s;--dx:${Math.random() * 120 - 60}px;--b:${Math.random() < .4 ? 1.6 : 0}px`;
    layer.appendChild(p);
  }
}

// RSVP gửi tới Google Sheets qua Apps Script. Chỉ báo thành công khi máy chủ trả {ok:true}.
const ERR = {
  spam: 'Không gửi được. Vui lòng tải lại trang và thử lại.',
  too_fast: 'Bạn thao tác hơi nhanh, vui lòng đợi vài giây rồi gửi lại.',
  rate: 'Bạn đã gửi nhiều lần. Vui lòng thử lại sau.',
  captcha: 'Vui lòng xác minh bạn không phải robot rồi gửi lại.',
  invalid: 'Thông tin chưa hợp lệ. Vui lòng kiểm tra tên và lựa chọn của bạn.',
  full: 'Biểu mẫu đã nhận đủ phản hồi. Vui lòng liên hệ trực tiếp.',
};
const openedAt = Date.now();
let token = '';
if (CONFIG.turnstileSiteKey) {
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async = true;
  s.onload = () => window.turnstile.render('#ts', { sitekey: CONFIG.turnstileSiteKey, callback: (t) => { token = t; } });
  document.head.appendChild(s);
}
$('#rsvp').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target, btn = form.querySelector('button'), msg = $('#msg');
  const d = Object.fromEntries(new FormData(form));
  const errs = validateRsvp(d);
  if (errs.length) { msg.textContent = errs.join(' '); return; }
  if (!CONFIG.rsvpEndpoint) { msg.textContent = 'Biểu mẫu chưa được kết nối. Vui lòng liên hệ trực tiếp.'; return; }
  if (CONFIG.turnstileSiteKey && !token) { msg.textContent = ERR.captcha; return; }
  btn.disabled = true; msg.textContent = 'Đang gửi...';
  try {
    const res = await fetch(CONFIG.rsvpEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // không kích hoạt preflight CORS
      body: JSON.stringify({ ...d, guest, token, elapsed: Date.now() - openedAt }),
    });
    const out = await res.json();
    if (!out.ok) throw new Error(out.code || 'server');
    msg.textContent = 'Đã gửi xác nhận. Cảm ơn bạn!';
    form.reset();
    setTimeout(() => { btn.disabled = false; }, 30000); // nghỉ 30 giây giữa hai lần gửi
  } catch (err) {
    msg.textContent = ERR[err.message] || 'Chưa gửi được. Vui lòng kiểm tra mạng và thử lại.';
    btn.disabled = false;
  }
  if (window.turnstile) { window.turnstile.reset(); token = ''; }
});

// Tự cuộn xuống chậm rãi. Giữ chuột/ngón tay, tự cuộn hoặc đang gõ vào ô nhập thì tạm dừng; thả ra thì chạy tiếp.
function autoScroll() {
  if (reduce) return;
  const SPEED = 50, IDLE_MS = 1200; // px/giây; thời gian chờ sau khi người xem thôi cuộn
  let y = scrollY, last = performance.now(), v = 0, holding = false, idleAt = 0;
  const hold = () => { holding = true; };
  const release = () => { holding = false; idleAt = performance.now(); };
  const touched = () => { idleAt = performance.now(); };
  addEventListener('mousedown', hold, { passive: true });
  addEventListener('touchstart', hold, { passive: true });
  ['mouseup', 'touchend', 'touchcancel', 'blur'].forEach((t) => addEventListener(t, release, { passive: true }));
  addEventListener('mousemove', (e) => { if (holding && e.buttons === 0) release(); }, { passive: true }); // phòng khi mất sự kiện mouseup
  ['wheel', 'keydown'].forEach((t) => addEventListener(t, touched, { passive: true }));
  const typing = () => /^(INPUT|TEXTAREA)$/.test(document.activeElement ? document.activeElement.tagName : '');
  const step = (now) => {
    const dt = Math.min(now - last, 50) / 1000; last = now;
    if (Math.abs(scrollY - y) > 3) { y = scrollY; idleAt = now; }  // người xem tự cuộn (thanh cuộn, vuốt)
    const run = !holding && !typing() && now - idleAt > IDLE_MS;
    v += ((run ? SPEED : 0) - v) * Math.min(1, dt * (run ? 3 : 12)); // tăng tốc êm, dừng nhanh khi giữ
    if (v > 0.5) { y += v * dt; scrollTo(0, y); } else y = scrollY;
    if (scrollY < document.documentElement.scrollHeight - innerHeight - 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Mở hai cánh thiệp, sau đó hiện nội dung, chữ và cánh hoa.
$('#open').addEventListener('click', () => {
  const cover = $('#cover');
  cover.classList.add('open');
  document.body.classList.remove('locked');
  document.body.classList.add('opened');
  startPetals();
  setTimeout(autoScroll, 3500); // chờ hiệu ứng tên cô dâu chú rể chạy xong
  setTimeout(() => cover.classList.add('done'), 1600);
});
})();
