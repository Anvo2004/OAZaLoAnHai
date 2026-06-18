const crypto = require('crypto')

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const SESSION_SECRET = process.env.SESSION_SECRET || 'zalo-admin-secret-2025'
const VALID_TOKEN = crypto.createHmac('sha256', SESSION_SECRET).update(ADMIN_PASSWORD).digest('hex')

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-token'] === VALID_TOKEN) return next()
  res.status(401).json({ error: 'Chưa đăng nhập' })
}

function login(req, res) {
  const { password } = req.body
  if (password === ADMIN_PASSWORD) {
    return res.json({ ok: true, token: VALID_TOKEN })
  }
  res.status(401).json({ error: 'Sai mật khẩu' })
}

function logout(req, res) {
  res.json({ ok: true })
}

function checkAuth(req, res) {
  res.json({ ok: req.headers['x-admin-token'] === VALID_TOKEN })
}

module.exports = { requireAdmin, login, logout, checkAuth }
