require('dotenv').config();

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
  PUBLIC_URL: process.env.PUBLIC_URL || '',
  EMAIL_ADMIN: process.env.EMAIL_ADMIN || '',
  EMAIL_ADMIN_PASSWORD: process.env.EMAIL_ADMIN_PASSWORD || '',
  DASHBOARD_URL: process.env.DASHBOARD_URL || '',

  // Cổng góp ý 1022 (CGY - Green Global) — đồng bộ phản ánh sang hệ thống thành phố.
  // Toàn bộ đọc từ .env; thiếu BASE_URL/USERNAME/PASSWORD thì tính năng tự tắt.
  CGY1022_BASE_URL: process.env.CGY1022_BASE_URL || '',
  CGY1022_USERNAME: process.env.CGY1022_USERNAME || '',
  CGY1022_PASSWORD: process.env.CGY1022_PASSWORD || '',
  CGY1022_LOGIN_PATH: process.env.CGY1022_LOGIN_PATH || '/admin/login',
  CGY1022_USER_ID: process.env.CGY1022_USER_ID || '0',
  CGY1022_DEFAULT_EMAIL: process.env.CGY1022_DEFAULT_EMAIL || 'gopy@anhai.dxvtech.vn',
  CGY1022_NGUON: process.env.CGY1022_NGUON || 'ZALO OA Phường An Hải',
  // JSON map tên danh mục An Hải → linhVucId của 1022, VD: {"Môi trường, Hạ tầng, Xây dựng": 4}
  CGY1022_LINHVUC_MAP: process.env.CGY1022_LINHVUC_MAP || '{}',
  CGY1022_LINHVUC_DEFAULT: process.env.CGY1022_LINHVUC_DEFAULT || '',
};
