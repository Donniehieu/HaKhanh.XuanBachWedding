/** Hàm thuần (pure) để dễ unit test. */
const CAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
const CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

/** Lấy tên khách từ query `?to=Tên`. Trả về '' nếu không có. */
function getGuestName(search) {
  return (new URLSearchParams(search).get('to') || '').trim().slice(0, 60);
}

/** Can chi của năm dương lịch, ví dụ 2026 -> "Bính Ngọ". */
function canChi(year) {
  return `${CAN[(year + 6) % 10]} ${CHI[(year + 8) % 12]}`;
}

/** Ngày âm lịch dựa trên Intl (lịch Chinese ~ âm lịch Việt Nam). */
function lunarLabel(date) {
  const p = new Intl.DateTimeFormat('en-u-ca-chinese', { day: 'numeric', month: 'numeric' })
    .formatToParts(date);
  const get = (t) => p.find((x) => x.type === t)?.value;
  return `Tức ngày ${get('day')} tháng ${get('month')} năm ${canChi(date.getFullYear())}`;
}

/** Kiểm tra dữ liệu RSVP. Trả về danh sách lỗi (rỗng = hợp lệ). */
function validateRsvp({ name = '', attend = '', wish = '' }) {
  const errors = [];
  if (name.trim().length < 2) errors.push('Vui lòng nhập tên của bạn.');
  if (!['yes', 'no'].includes(attend)) errors.push('Vui lòng chọn bạn có đến được không.');
  if (wish.length > 500) errors.push('Lời chúc tối đa 500 ký tự.');
  return errors;
}

/** "2026-10-24" -> "24/10/2026". */
function formatDate(iso) { const [y, m, d] = String(iso).split('-'); return `${d}/${m}/${y}`; }

/** Chỉ chấp nhận link https (tránh javascript: hay link hỏng trong cấu hình). */
function isHttpsUrl(u) { try { return new URL(u).protocol === 'https:'; } catch { return false; } }

/** Lưới tháng, tuần bắt đầu từ thứ Hai (T2). month: 1-12. Ô trống là null. */
function monthGrid(year, month) {
  const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  const cells = Array(lead).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const api = { getGuestName, canChi, lunarLabel, validateRsvp, formatDate, isHttpsUrl, monthGrid };
// Chạy được cả trong trình duyệt (script thường, mở file trực tiếp) lẫn Node (test).
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else window.WeddingLib = api;
