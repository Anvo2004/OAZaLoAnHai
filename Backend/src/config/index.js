require('dotenv').config();

const PUBLIC_URL = process.env.PUBLIC_URL || '';

module.exports = {
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI || '',
  ZALO_APP_ID: process.env.ZALO_APP_ID || '',
  ZALO_APP_SECRET: process.env.ZALO_APP_SECRET || '',
  ZALO_OA_TOKEN: process.env.ZALO_OA_TOKEN || '',
  ZALO_REFRESH_TOKEN: process.env.ZALO_REFRESH_TOKEN || '',
  ZALO_GROUP_ID: process.env.ZALO_GROUP_ID || '',
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  PUBLIC_URL,
  EMAIL_ADMIN: process.env.EMAIL_ADMIN || '',
  EMAIL_ADMIN_PASSWORD: process.env.EMAIL_ADMIN_PASSWORD || '',
  DASHBOARD_URL: process.env.DASHBOARD_URL || '',
  // URL form web ReportApp (thay chatbot) — mặc định suy ra từ PUBLIC_URL + /report
  // (Backend/server.js serve tĩnh Frontend/ReportApp/dist tại đường dẫn này).
  REPORT_APP_URL: process.env.REPORT_APP_URL || (PUBLIC_URL ? `${PUBLIC_URL}/report` : ''),

  // Cổng góp ý 1022 (gopy.danang.gov.vn) — đồng bộ phản ánh sang hệ thống thành phố.
  // Xác thực: HTTP Basic Auth. Bắt buộc User-Agent trình duyệt (WAF chặn UA lạ).
  // Toàn bộ đọc từ .env; thiếu BASE_URL/USERNAME/PASSWORD thì tính năng tự tắt.
  CGY1022_BASE_URL: process.env.CGY1022_BASE_URL || '',
  CGY1022_USERNAME: process.env.CGY1022_USERNAME || '',
  CGY1022_PASSWORD: process.env.CGY1022_PASSWORD || '',
  CGY1022_GOPY_PATH: process.env.CGY1022_GOPY_PATH || '/api/gopy',
  CGY1022_USER_ID: process.env.CGY1022_USER_ID || '0',
  CGY1022_DEFAULT_EMAIL: process.env.CGY1022_DEFAULT_EMAIL || '',
  // "ZaloAnHai" (không dấu, viết liền) đã xác nhận hoạt động thật (test cô lập trả gopyId=105352
  // ngày 09/07/2026) — là GIÁ TRỊ API thực sự đằng sau nhãn hiển thị "Góp ý Zalo P.An Hải" trên
  // dropdown quản lý 1022 (nhãn hiển thị ≠ giá trị API, gửi đúng nhãn "Góp ý Zalo P.An Hải" bị
  // 1022 báo 404 "does not exist"). "Zalo" (giá trị cũ) vẫn hoạt động nếu cần fallback.
  CGY1022_NGUON: process.env.CGY1022_NGUON || 'ZaloAnHai',
  // JSON map tên danh mục An Hải → linhVucId của 1022, VD: {"Môi trường, Hạ tầng, Xây dựng": 4}
  CGY1022_LINHVUC_MAP: process.env.CGY1022_LINHVUC_MAP || '{}',
  CGY1022_LINHVUC_DEFAULT: process.env.CGY1022_LINHVUC_DEFAULT || '',
  // Danh sách linhVucId 1022 được hiện SĐT công dân (cách nhau dấu phẩy).
  // Mặc định 1 = Hạ tầng đô thị, 21 = An ninh trật tự (theo Document/TichHop_1022_TomTat.md) —
  // các lĩnh vực còn lại ẩn SĐT để bảo vệ riêng tư trên cổng công khai.
  CGY1022_SHOW_PHONE_LINHVUC: process.env.CGY1022_SHOW_PHONE_LINHVUC || '1,21',

  // Tự động đăng tin: trang thông tin điện tử anhai.danang.gov.vn → bài viết Zalo OA An Hải
  // (chỉ TẠO bài, không broadcast). Xem Backend/src/services/dangTinService.js.
  // Trang An Hải chạy DotNetNuke (module CMS14_TinTuc), KHÔNG phải vnPortal VNPT như Thượng Đức:
  // không có /api/public/*, phải quét HTML.
  DANGTIN_ENABLED: (process.env.DANGTIN_ENABLED || 'true').toLowerCase() === 'true',
  // false = dry-run: chỉ log bài dự định tạo, KHÔNG gọi Zalo và KHÔNG đánh dấu "đã gửi".
  // Đặt tên riêng thay cho ZALO_SEND_ENABLED của Thượng Đức: backend An Hải còn gửi Zalo cho
  // phản ánh, tên chung chung dễ bị hiểu là tắt/bật toàn bộ việc gửi Zalo.
  DANGTIN_SEND_ENABLED: (process.env.DANGTIN_SEND_ENABLED || 'false').toLowerCase() === 'true',
  DANGTIN_PORTAL_URL: (process.env.DANGTIN_PORTAL_URL || 'https://anhai.danang.gov.vn').replace(/\/+$/, ''),
  // Các trang quét link bài (/chi-tiet-tin/group/{g}/nid/{nid}/...). Trang chủ có widget "Tin mới"
  // theo thứ tự thời gian + "Thông báo"; 2 trang chuyên mục là nguồn dự phòng.
  DANGTIN_LIST_PAGES: process.env.DANGTIN_LIST_PAGES || '/,/tin-tuc-su-kien,/thong-bao',
  // Chỉ đồng bộ tin thuộc các group này (số trong /chi-tiet-tin/group/{g}/...), rỗng = tất cả.
  // OA An Hải đã có 1 hệ thống khác tự đăng tin tức nhưng bỏ sót hẳn group 110 (Thông báo) và
  // 153 (Phổ biến pháp luật — nghị định, quyết định) → đặt "110,153" để chỉ bù phần thiếu, không trùng.
  DANGTIN_ARTICLE_GROUPS: process.env.DANGTIN_ARTICLE_GROUPS || '',
  // Các trang có module văn bản QTI_VanBan_2020 (bảng Số ký hiệu / Ngày ban hành / Trích yếu).
  DANGTIN_DOCUMENT_PAGES: process.env.DANGTIN_DOCUMENT_PAGES
    || '/van-ban,/thong-tin-tong-hop/thong-tin-chi-đao-đieu-hanh',
  DANGTIN_ARTICLES_ENABLED: (process.env.DANGTIN_ARTICLES_ENABLED || 'true').toLowerCase() === 'true',
  DANGTIN_DOCUMENTS_ENABLED: (process.env.DANGTIN_DOCUMENTS_ENABLED || 'true').toLowerCase() === 'true',
  // Ảnh cover khi bài không có ảnh / ảnh bài bị Zalo từ chối. Zalo TỪ CHỐI ảnh đặt trên
  // *.dxvtech.vn ("Ảnh đại diện không hợp lệ") — dùng ảnh trên storage-vnportal.vnpt.vn hoặc Cloudinary,
  // thử trước bằng scripts/dangtin-test-cover.js.
  DANGTIN_DEFAULT_COVER_URL: process.env.DANGTIN_DEFAULT_COVER_URL || '',
  // Zalo không tải được ảnh cover lớn: thử thật 15/09/2026 — 1,57MB và 1,89MB bị lỗi
  // -200 "Upload media failed" (kể cả khi đưa nguyên ảnh lên Cloudinary), 522KB trở xuống OK.
  // Ngưỡng đặt ở mức đã thử chắc chắn OK. Ảnh lớn hơn → thu nhỏ qua Cloudinary; không có
  // Cloudinary → dùng cover mặc định.
  DANGTIN_MAX_COVER_BYTES: parseInt(process.env.DANGTIN_MAX_COVER_BYTES || '500000', 10),
  DANGTIN_AUTHOR: process.env.DANGTIN_AUTHOR || 'UBND phường An Hải',
  DANGTIN_INTERVAL_MINUTES: parseInt(process.env.DANGTIN_INTERVAL_MINUTES || '10', 10),
  // Bỏ qua bài có Ngày đăng cũ hơn N ngày — trang chủ có khối nổi bật/gợi ý cố định (VD "Bài dự thi
  // Búa liềm vàng 2025") không theo thời gian, dễ bị nhầm là bài mới.
  DANGTIN_MAX_AGE_DAYS: parseInt(process.env.DANGTIN_MAX_AGE_DAYS || '3', 10),
  // Văn bản thường được đăng muộn hơn Ngày ban hành vài ngày nên nới rộng hơn tin bài.
  DANGTIN_DOCUMENT_MAX_AGE_DAYS: parseInt(process.env.DANGTIN_DOCUMENT_MAX_AGE_DAYS || '7', 10),
  // Số bài mới tối đa tạo trong 1 lượt (tránh dồn dập khi mất kết nối lâu)
  DANGTIN_MAX_NEW_PER_RUN: parseInt(process.env.DANGTIN_MAX_NEW_PER_RUN || '20', 10),
};
