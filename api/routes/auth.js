const router = require('express').Router()
const jwt = require('jsonwebtoken')
const AdminUser = require('../../src/models/AdminUser')
const requireAuth = require('../middleware/requireAuth')

const JWT_SECRET = process.env.JWT_SECRET || 'anhai-jwt-secret-2025'

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' })
  }
  try {
    const user = await AdminUser.findOne({ username: username.trim().toLowerCase() })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' })
    }
    const payload = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
    // Giữ session cho EJS admin panel
    req.session.adminUser = payload
    return res.json({ user: payload, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user || req.session.adminUser)
})

module.exports = router
