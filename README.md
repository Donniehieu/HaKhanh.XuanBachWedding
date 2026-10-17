# Thiệp cưới Hà Khanh & Xuân Bách

Web tĩnh, đưa lên GitHub Pages là chạy. File `index.html` nằm ở thư mục gốc.

## Đưa lên GitHub Pages
1. Tạo repo Public trên github.com. Giải nén zip, kéo thả TOÀN BỘ nội dung bên trong thư mục `thiep-cuoi` vào repo (Add file > Upload files), rồi Commit.
2. Settings > Pages > Source: Deploy from a branch > nhánh `main`, thư mục `/ (root)` > Save. Đợi 1-2 phút.
3. Địa chỉ: `https://<tên-github>.github.io/<tên-repo>/`. Gửi riêng từng khách: thêm `?to=Anh%20Nam` vào cuối link.

## Chỗ cần điền: `js/config.js`
- `venue`, `address`: tên và địa chỉ nơi tổ chức. `time`: giờ.
- `mapUrl`: Google Maps > tìm địa điểm > Chia sẻ > Sao chép đường liên kết > dán vào (bắt đầu bằng https://). Tiệc và lễ có link riêng.
- `label`: tên sự kiện (ví dụ Lễ Vu Quy). `calendarDate`: ngày được đánh dấu trái tim trên lịch.
- `lunar`: gõ tay ngày âm lịch, ví dụ `Tức ngày 15 tháng 9 năm Bính Ngọ`. Để trống thì trang tự tính (có thể lệch 1 ngày, hãy đối chiếu).
- `rsvpEndpoint`: URL Apps Script nhận xác nhận tham dự (xem phần dưới).

## Ảnh cưới
- Chuẩn bị ảnh dọc tỉ lệ 9:13, khoảng 900x1300 px, JPG, dưới 200 KB. Dùng https://squoosh.app (MozJPEG, chất lượng 75-80) để thu nhỏ.
- Đặt tên đúng `photo.jpg` (chữ thường, không dấu, không khoảng trắng; GitHub phân biệt hoa thường) và upload vào thư mục `assets` của repo.
- Muốn lưu ảnh ở nơi khác: dán link ảnh https vào `photoUrl` trong `config.js`.
- Thêm `?edit=1` vào link để hiện nút xem thử ảnh trên máy bạn (không lưu lên mạng).

## Nhận xác nhận tham dự (Google Sheets) và chống spam
1. Tạo Google Sheets > Tiện ích mở rộng > Apps Script > dán `apps-script/Code.gs`.
2. Triển khai > Ứng dụng web: chạy với tư cách "Tôi", quyền truy cập "Bất kỳ ai". Chép URL vào `rsvpEndpoint`.
3. Sửa Code.gs về sau phải Triển khai > Quản lý > "Phiên bản mới".
4. Có sẵn: ô bẫy ẩn, thời gian điền tối thiểu 3 giây, 3 lượt/giờ mỗi tên, 20 lượt/phút toàn trang, giới hạn độ dài, tối đa 1000 dòng, nghỉ 30 giây giữa hai lần gửi.
5. Tùy chọn Cloudflare Turnstile: dán Site key vào `turnstileSiteKey`, Secret key vào Script properties tên `TURNSTILE_SECRET`.
6. Gửi thử một lần và kiểm tra dòng mới trong bảng tính trước khi gửi thiệp.

## Kiểm thử
`npm test` (Node 20+, không cần cài thêm).
