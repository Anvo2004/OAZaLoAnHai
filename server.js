require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const CONFIG = require('./src/config');
const { handleWebhook } = require('./src/handlers/webhookHandler');
const { setTokensManually } = require('./src/utils/zaloToken');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'anhai-goopy-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 },
}));

// Kết nối MongoDB
mongoose.connect(CONFIG.MONGO_URI)
  .then(() => console.log('[MongoDB] Kết nối thành công'))
  .catch(err => console.error('[MongoDB] Lỗi kết nối:', err.message));

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// Webhook Zalo
app.get('/webhook', (req, res) => {
  console.log('[Webhook] Xác thực Zalo webhook:', req.query.token);
  res.json({ token: req.query.token || '' });
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    await handleWebhook(req.body);
  } catch (err) {
    console.error('[Webhook] Lỗi xử lý:', err.message);
  }
});

// Trang set token thủ công
app.get('/admin/set-tokens', (_req, res) => {
  res.send(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Set Zalo Tokens - An Hải</title>
  <style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:0 20px}
  textarea{width:100%;padding:8px;margin:8px 0;box-sizing:border-box;height:80px;font-size:12px}
  button{background:#0068ff;color:white;padding:10px 24px;border:none;cursor:pointer;border-radius:4px;font-size:16px}
  label{font-weight:bold}</style></head>
  <body><h2>Cập nhật Zalo Token - UBND phường An Hải</h2>
  <form method="POST" action="/admin/set-tokens">
    <label>Access Token:</label>
    <textarea name="access_token" placeholder="Dán access_token vào đây" required></textarea>
    <label>Refresh Token:</label>
    <textarea name="refresh_token" placeholder="Dán refresh_token vào đây" required></textarea>
    <button type="submit">Lưu vào Redis</button>
  </form></body></html>`);
});

app.post('/admin/set-tokens', async (req, res) => {
  const { access_token, refresh_token } = req.body;
  if (!access_token || !refresh_token) return res.send('Lỗi: Cần cả 2 token');
  try {
    await setTokensManually(access_token.trim(), refresh_token.trim());
    res.send('<h2>✅ Token đã lưu vào Redis! Hệ thống sẽ tự động refresh mãi mãi.</h2>');
  } catch (err) {
    res.send(`<h2>❌ Lỗi: ${err.message}</h2>`);
  }
});

// Zalo domain verification
app.get('/zalo_verifierMy2z1PYq6XmTWRKu-gqbEpgZaXZMrKT1CJCm.html', (req, res) => {
  res.type('html').send('There Is No Limit To What You Can Accomplish Using Zalo!');
});

app.get('/', async (req, res) => {
  const { code } = req.query;
  if (code) {
    try {
      const axios = require('axios');
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('app_id', process.env.ZALO_APP_ID);
      params.append('grant_type', 'authorization_code');
      const r = await axios.post(
        'https://oauth.zaloapp.com/v4/oa/access_token',
        params,
        { headers: { secret_key: process.env.ZALO_APP_SECRET, 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const { access_token, refresh_token } = r.data;
      if (access_token) {
        await setTokensManually(access_token, refresh_token);
        console.log('[OAuth] Lấy token mới từ OAuth thành công');
        return res.type('html').send('<h2>✅ Cấp quyền thành công! Token đã lưu vào Redis. Bot sẵn sàng hoạt động.</h2>');
      }
      return res.type('html').send(`<h2>❌ Lỗi: ${JSON.stringify(r.data)}</h2>`);
    } catch (err) {
      return res.type('html').send(`<h2>❌ Lỗi: ${err.message}</h2>`);
    }
  }
  res.type('html').send(`<!DOCTYPE html><html><head><meta name="zalo-platform-site-verification" content="My2z1PYq6XmTWRKu-gqbEpgZaXZMrKT1CJCm" /></head><body>UBND phuong An Hai - OA Zalo</body></html>`);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'UBND phường An Hải - Góp ý', timestamp: new Date().toISOString() });
});

app.listen(CONFIG.PORT, () => {
  console.log(`\n🚀 Server An Hải Góp ý chạy tại http://localhost:${CONFIG.PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${CONFIG.PORT}/webhook\n`);
});
