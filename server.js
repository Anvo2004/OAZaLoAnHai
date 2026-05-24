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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'UBND phường An Hải - Góp ý', timestamp: new Date().toISOString() });
});

app.listen(CONFIG.PORT, () => {
  console.log(`\n🚀 Server An Hải Góp ý chạy tại http://localhost:${CONFIG.PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${CONFIG.PORT}/webhook\n`);
});
