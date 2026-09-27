const router = require('express').Router()
const jwt = require('jsonwebtoken')
const AdminUser = require('../../src/models/AdminUser')
const requireAuth = require('../middleware/requireAuth')
const { sendZaloText } = require('../../src/utils/zaloApi')
const { rateLimit } = require('../middleware/rateLimit')

const JWT_SECRET = process.env.JWT_SECRET || 'anhai-jwt-secret-2025'

// OTP lưu trong memory: { username → { otp, expiresAt, attempts } }
const otpStore = new Map()
const OTP_MAX_ATTEMPTS = 5

// Chống dò mật khẩu và dò mã OTP (6 chữ số → không giới hạn là dò ra được)
const loginLimit = rateLimit({
  name: 'login', windowMs: 15 * 60 * 1000, max: 10,
  message: 'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.',
})
const otpLimit = rateLimit({ name: 'otp', windowMs: 15 * 60 * 1000, max: 5 })

router.post('/login', loginLimit, async (req, res) => {
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
      categoryIds: user.categoryIds?.map(c => c.toString()) || [],
      zaloUserId: user.zaloUserId || '',
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
    req.session.adminUser = payload
    return res.json({ user: payload, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/forgot-password — gửi OTP 6 số qua Zalo
router.post('/forgot-password', otpLimit, async (req, res) => {
  const { username } = req.body
  if (!username) return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập' })
  try {
    const user = await AdminUser.findOne({ username: username.trim().toLowerCase() })
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    if (!user.zaloUserId) {
      return res.status(400).json({ error: 'Tài khoản chưa liên kết Zalo. Liên hệ quản trị viên để được hỗ trợ.' })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    otpStore.set(username.trim().toLowerCase(), { otp, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 })

    await sendZaloText(
      user.zaloUserId,
      `🔐 Mã xác nhận đặt lại mật khẩu hệ thống UBND Phường An Hải:\n\n` +
      `     ${otp}\n\n` +
      `⏰ Mã có hiệu lực trong 5 phút.\n` +
      `⚠️ Không chia sẻ mã này cho bất kỳ ai.`
    )

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/reset-password — xác minh OTP và đặt mật khẩu mới
router.post('/reset-password', otpLimit, async (req, res) => {
  const { username, otp, newPassword } = req.body
  if (!username || !otp || !newPassword) return res.status(400).json({ error: 'Thiếu thông tin' })

  const key = username.trim().toLowerCase()
  const entry = otpStore.get(key)

  if (!entry) return res.status(400).json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' })
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key)
    return res.status(400).json({ error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' })
  }
  // Huỷ mã sau 5 lần nhập sai — chặn dò hết 1 triệu tổ hợp bằng nhiều IP khác nhau
  entry.attempts = (entry.attempts || 0) + 1
  if (entry.attempts > OTP_MAX_ATTEMPTS) {
    otpStore.delete(key)
    return res.status(400).json({ error: 'Nhập sai mã quá nhiều lần. Vui lòng yêu cầu mã mới.' })
  }
  if (entry.otp !== String(otp).trim()) return res.status(400).json({ error: 'Mã OTP không đúng' })
  if (newPassword.length < 6) return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' })

  try {
    const user = await AdminUser.findOne({ username: key })
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' })

    user.password = newPassword
    await user.save()
    otpStore.delete(key)

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.adminUser?.id
    const user = await AdminUser.findById(userId, '-password').lean()
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    res.json({
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      categoryIds: user.categoryIds?.map(c => c.toString()) || [],
      zaloUserId: user.zaloUserId || '',
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
