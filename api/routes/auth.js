const router = require('express').Router()
const AdminUser = require('../../src/models/AdminUser')
const requireAuth = require('../middleware/requireAuth')

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
    req.session.adminUser = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    }
    return res.json({ user: req.session.adminUser })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})

router.get('/me', requireAuth, (req, res) => {
  res.json(req.session.adminUser)
})

module.exports = router
