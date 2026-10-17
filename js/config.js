/**
 * TẤT CẢ nội dung cần tự điền nằm ở đây (không cần sửa index.html).
 * Link Google Maps: mở Google Maps, tìm địa điểm > Chia sẻ > Sao chép đường liên kết, dán vào mapUrl (phải bắt đầu bằng https://).
 */
window.CONFIG = {
  photoUrl: '', // Để trống = dùng assets/photo.jpg. Có thể dán link ảnh https://... nếu lưu ảnh ở nơi khác.
  calendarDate: '2026-10-25', // Ngày được đánh dấu trái tim trên lịch (chỉ một ngày)
  events: {
    banquet:  { label: 'Tiệc cưới', date: '2026-10-24', time: '16 giờ 30', venue: 'Tại Tư Gia Nhà Gái', address: 'Số 19 ngõ 167 đường Tây Thành, phường Hoa Lư, tỉnh Ninh Bình', mapUrl: 'https://www.google.com/maps/search/?api=1&query=20.25600445107242,105.96683040179074', lunar: '' },
    ceremony: { label: 'Lễ Vu Quy', date: '2026-10-25', time: '10 giờ 00', venue: 'Tại Tư Gia Nhà Gái', address: 'Số 19 ngõ 167 đường Tây Thành, phường Hoa Lư, tỉnh Ninh Bình', mapUrl: 'https://www.google.com/maps/search/?api=1&query=20.25600445107242,105.96683040179074', lunar: '' },
    // lunar: gõ tay, ví dụ 'Tức ngày 15 tháng 9 năm Bính Ngọ'. Để trống = trang tự tính.
  },
  texts: { // Nội dung chữ, sửa tự do (nháy đơn ' không được nằm trong câu)
    announce: 'Chúng tôi trân trọng báo tin lễ vu quy của',
    inviteTitle: 'Thư mời tham dự',
    inviteBody: 'Trân trọng kính mời bạn đến dự bữa tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của bạn là niềm vinh hạnh của gia đình chúng tôi.',
    date: 'Ngày 24 và 25 tháng 10 năm 2026',
  },
  rsvpEndpoint: '',     // URL Web App của apps-script/Code.gs
  turnstileSiteKey: '', // Tùy chọn: Site key Cloudflare Turnstile (để trống = tắt)
};
