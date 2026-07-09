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
  CGY1022_DEFAULT_EMAIL: process.env.CGY1022_DEFAULT_EMAIL || 'gopy@anhai.dxvtech.vn',
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
};
