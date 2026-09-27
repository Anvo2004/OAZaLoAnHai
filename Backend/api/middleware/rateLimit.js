// Giới hạn số lượt gọi theo IP — chống dò mật khẩu, dò mã OTP và rút dữ liệu hàng loạt
// qua các endpoint công khai. Lưu trong RAM: đủ cho 1 tiến trình PM2 duy nhất; nếu sau này
// chạy nhiều tiến trình thì chuyển sang Redis (Upstash đã có sẵn cho token Zalo).

const buckets = new Map(); // key → { count, resetAt }

// Dọn định kỳ để Map không phình theo thời gian
setInterval(() => {
  const now = Date.now();
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
}, 10 * 60 * 1000).unref();

function clientIp(req) {
  // server.js đặt trust proxy nên req.ip đã là IP thật phía sau Nginx
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

/**
 * @param {{ windowMs: number, max: number, name: string, message?: string }} opts
 */
function rateLimit({ windowMs, max, name, message }) {
  return (req, res, next) => {
    const key = `${name}:${clientIp(req)}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count++;

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      console.warn(`[RateLimit] Chặn ${key} (${bucket.count}/${max}) — ${req.method} ${req.path}`);
      return res.status(429).json({
        error: message || `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`,
      });
    }
    next();
  };
}

module.exports = { rateLimit };
