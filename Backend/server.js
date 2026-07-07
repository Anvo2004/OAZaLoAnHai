require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const CONFIG = require('./src/config');
const { handleWebhook } = require('./src/handlers/webhookHandler');
const { setTokensManually } = require('./src/utils/zaloToken');

const app = express();

// CORS — cho phép Vercel frontend gọi API
app.use(cors({
  origin: [
    /\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:3001',
    process.env.PUBLIC_URL,
  ].filter(Boolean),
  credentials: true,
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'admin/views'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method override (hỗ trợ PUT/DELETE từ HTML form)
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'anhai-goopy-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));

// Flash messages
app.use(flash());

// Kết nối MongoDB + seed dữ liệu mặc định
mongoose.connect(CONFIG.MONGO_URI)
  .then(async () => {
    console.log('[MongoDB] Kết nối thành công');

    const AdminUser = require('./src/models/AdminUser');
    const Category = require('./src/models/Category');

    // Seed tài khoản admin mặc định
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      await AdminUser.create({
        username: 'admin',
        password: 'admin@2025',
        fullName: 'Quản trị viên',
        role: 'superadmin',
      });
      console.log('[Admin] Tài khoản mặc định: admin / admin@2025 — đổi mật khẩu sau khi đăng nhập!');
    }

    // Seed 4 danh mục phản ánh mặc định
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const defaultCategories = [
        { name: 'Môi trường, Hạ tầng, Xây dựng',    zaloGroupId: '6f2ab62e124cfb12a25d', icon: '🏗️', order: 1 },
        { name: 'Văn hoá, Giáo dục, Y tế',            zaloGroupId: '10d632c896aa7ff426bb', icon: '🏫', order: 2 },
        { name: 'Dịch vụ công, Thủ tục hành chính',  zaloGroupId: '5f8db19515f7fca9a5e6', icon: '📋', order: 3 },
        { name: 'An ninh trật tự, PCCC',              zaloGroupId: 'e8dd38c69ca475fa2cb5', icon: '🚔', order: 4 },
      ];
      await Category.insertMany(defaultCategories);
      console.log('[Seed] Đã tạo 4 danh mục phản ánh mặc định');
    }

    require('./src/services/groupSyncService').startGroupSyncSchedule();
    require('./src/admin/scheduledMessageService').startScheduledMessageRunner();
    require('./src/services/deadlineReminderService').startDeadlineReminder();
    require('./src/services/cgy1022RetryService').startCgy1022Retry();
    require('./src/services/cgy1022StatusService').startCgy1022StatusPoll();
  })
  .catch(err => console.error('[MongoDB] Lỗi kết nối:', err.message));

// Request logging
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// ── Debug: test Zalo getprofile v2 vs v3 (public, tạm thời) ────
app.get('/debug-profile/:userId', async (req, res) => {
  const axios = require('axios');
  const { getToken } = require('./src/utils/zaloToken');
  try {
    const token = getToken();
    const uid = req.params.userId;

    // Test v2 getprofile (bị block IP ngoài VN)
    const v2data = encodeURIComponent(JSON.stringify({ user_id: uid }));
    const v2 = await axios.get(
      `https://openapi.zalo.me/v2.0/oa/getprofile?data=${v2data}`,
      { headers: { access_token: token } }
    ).then(r => r.data).catch(e => ({ error: e.message }));

    // Test v3 user/detail (cần permission Quản lý người dùng)
    const v3data = encodeURIComponent(JSON.stringify({ user_id: uid }));
    const v3 = await axios.get(
      `https://openapi.zalo.me/v3.0/oa/user/detail?data=${v3data}`,
      { headers: { access_token: token } }
    ).then(r => r.data).catch(e => ({ error: e.message }));

    res.json({ v2_getprofile: v2, v3_user_detail: v3, token_prefix: token.slice(0, 20) + '...' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Webhook Zalo ──────────────────────────────────────
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

// ── Zalo token thủ công (không cần auth, đặt TRƯỚC admin router) ──
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

// ── Trang mini web lấy GPS (mở từ nút bấm Zalo) ──────
app.get('/location', (req, res) => {
  const uid = req.query.uid || '';
  res.type('html').send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Chia sẻ vị trí</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f9ff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .card{background:#fff;border-radius:20px;padding:36px 28px;box-shadow:0 8px 32px rgba(0,0,0,.12);max-width:340px;width:100%;text-align:center}
    .icon{font-size:60px;margin-bottom:16px}
    h2{color:#1e293b;font-size:20px;margin-bottom:8px}
    p{color:#64748b;font-size:14px;line-height:1.6;margin-bottom:24px}
    .btn{width:100%;padding:16px;background:#10b981;color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;transition:background .2s}
    .btn:hover{background:#059669}
    .btn:disabled{background:#94a3b8;cursor:not-allowed}
    .status{margin-top:16px;font-size:13px;color:#64748b;min-height:20px}
    .ok{color:#10b981;font-size:18px;font-weight:700}
    .err{color:#ef4444}
  </style>
</head>
<body>
<div class="card" id="card">
  <div class="icon">📍</div>
  <h2>Chia sẻ vị trí phản ánh</h2>
  <p>Nhấn nút bên dưới, trình duyệt sẽ xin quyền truy cập vị trí GPS và tự động ghi nhận.</p>
  <button class="btn" id="btn" onclick="go()">📡 Lấy vị trí hiện tại</button>
  <div class="status" id="st"></div>
</div>
<script>
const uid='${uid}';
function go(){
  const btn=document.getElementById('btn'),st=document.getElementById('st');
  btn.disabled=true;btn.textContent='⏳ Đang lấy vị trí...';
  st.textContent='Vui lòng cho phép truy cập vị trí khi được hỏi.';
  if(!navigator.geolocation){
    st.innerHTML='<span class="err">Thiết bị không hỗ trợ GPS.</span>';
    btn.disabled=false;btn.textContent='📡 Lấy vị trí hiện tại';return;
  }
  navigator.geolocation.getCurrentPosition(
    async pos=>{
      const{latitude:lat,longitude:lng}=pos.coords;
      st.textContent='Đang gửi vị trí về máy chủ...';
      try{
        const r=await fetch('/api/public/location-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid,lat,lng})});
        const d=await r.json();
        if(d.ok){
          document.getElementById('card').innerHTML='<div class="icon">✅</div><h2 class="ok">Đã ghi nhận vị trí!</h2><p>Quay lại Zalo để tiếp tục gửi phản ánh.</p>';
        }else throw new Error(d.message);
      }catch(e){
        st.innerHTML='<span class="err">Lỗi: '+e.message+'</span>';
        btn.disabled=false;btn.textContent='📡 Thử lại';
      }
    },
    err=>{
      const m={1:'Bạn chưa cho phép truy cập vị trí.',2:'Không lấy được tín hiệu GPS.',3:'Hết thời gian chờ, thử lại.'};
      st.innerHTML='<span class="err">'+(m[err.code]||'Lỗi không xác định.')+'</span>';
      btn.disabled=false;btn.textContent='📡 Thử lại';
    },
    {enableHighAccuracy:true,timeout:15000,maximumAge:0}
  );
}
</script>
</body></html>`);
});

// ── REST API cho React frontend ────────────────────────
const apiRouter = require('./api/routes/index');
app.use('/api', apiRouter);

// ── Admin dashboard router (EJS — giữ nguyên) ──────────
const adminRouter = require('./admin/routes/index');
app.use('/admin', adminRouter);

// ── Các route khác ──────────────────────────────────────
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

// ── Serve React build (production) ─────────────────────
const webDist = path.join(__dirname, '..', 'Frontend', 'Web', 'dist');
if (require('fs').existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get('/app*', (_req, res) => res.sendFile(path.join(webDist, 'index.html')));
}

// ── Serve ReportApp build (production) — form web thay chatbot, xem promptReportApp() ──
const reportDist = path.join(__dirname, '..', 'Frontend', 'ReportApp', 'dist');
if (require('fs').existsSync(reportDist)) {
  app.use('/report', express.static(reportDist));
  app.get('/report*', (_req, res) => res.sendFile(path.join(reportDist, 'index.html')));
}

app.listen(CONFIG.PORT, () => {
  console.log(`\n🚀 Server An Hải Góp ý chạy tại http://localhost:${CONFIG.PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${CONFIG.PORT}/webhook`);
  console.log(`🖥️  Admin Dashboard: http://localhost:${CONFIG.PORT}/admin\n`);
});
