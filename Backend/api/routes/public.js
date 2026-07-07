const router = require('express').Router()
const axios = require('axios')
const multer = require('multer')
const CONFIG = require('../../src/config')
const Feedback = require('../../src/models/Feedback')
const Category = require('../../src/models/Category')
const { uploadFromBuffer } = require('../../src/utils/cloudinary')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
})

// GET /api/public/categories — danh sách danh mục cho ReportApp chọn (ẩn zaloGroupId nội bộ)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({}, 'name icon order').sort({ order: 1 }).lean()
    res.json({ categories })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Đổi code OAuth v4 (Đăng nhập bằng Zalo, dùng cho ReportApp) lấy access_token cá nhân
async function exchangeCodeForToken(code) {
  const tokenRes = await axios.post(
    'https://oauth.zaloapp.com/v4/access_token',
    new URLSearchParams({ code, app_id: CONFIG.ZALO_APP_ID, grant_type: 'authorization_code' }),
    { headers: { secret_key: CONFIG.ZALO_APP_SECRET, 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  const accessToken = tokenRes.data?.access_token
  if (!accessToken) throw new Error(`Đăng nhập Zalo thất bại: ${JSON.stringify(tokenRes.data)}`)
  return accessToken
}

// Lấy profile thật từ Zalo bằng access_token — verify server-side, không tin userId
// do client tự gửi (tránh giả mạo danh tính để gửi phản ánh thay người khác)
async function fetchZaloProfile(accessToken) {
  const profileRes = await axios.get('https://graph.zalo.me/v2.0/me', {
    params: { fields: 'id,name,picture' },
    headers: { access_token: accessToken },
  })
  const { id, name, picture } = profileRes.data || {}
  if (!id) throw new Error(`Không lấy được thông tin Zalo: ${JSON.stringify(profileRes.data)}`)
  return { id: String(id), name: name || '', avatar: picture?.data?.url || '' }
}

// POST /api/public/zalo-login — đổi code lấy access_token + profile cho ReportApp
router.post('/zalo-login', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ error: 'Thiếu code đăng nhập Zalo' })
    const accessToken = await exchangeCodeForToken(code)
    const profile = await fetchZaloProfile(accessToken)
    res.json({ accessToken, profile })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/public/feedbacks — tạo phản ánh từ ReportApp (multipart, tối đa 5 ảnh)
// Đẩy 1022 ĐỒNG BỘ trong request này — xem createFeedbackEntry() trong feedbackService.js
router.post('/feedbacks', upload.array('images', 5), async (req, res) => {
  try {
    const { accessToken, contact, categoryId, title, content, address, lat, lng, source } = req.body
    if (!accessToken) return res.status(400).json({ error: 'Thiếu thông tin đăng nhập Zalo' })

    const { isPhone, isEmail, createFeedbackEntry } = require('../../src/services/feedbackService')
    if (!contact || (!isPhone(contact) && !isEmail(contact))) {
      return res.status(400).json({ error: 'SĐT hoặc email không hợp lệ' })
    }
    if (!title || title.trim().length < 5) {
      return res.status(400).json({ error: 'Tiêu đề quá ngắn (tối thiểu 5 ký tự)' })
    }
    if (!content || content.trim().length < 5) {
      return res.status(400).json({ error: 'Nội dung phản ánh quá ngắn (tối thiểu 5 ký tự)' })
    }

    const profile = await fetchZaloProfile(accessToken)

    let category = null
    if (categoryId) category = await Category.findById(categoryId).lean()

    const files = req.files || []
    const imageUrls = []
    for (const file of files) {
      const url = await uploadFromBuffer(file.buffer, `web-${Date.now()}-${imageUrls.length}`)
      imageUrls.push(url)
    }

    const location = {
      address: address?.trim() || '',
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      source: source === 'gps' || source === 'manual' ? source : '',
    }

    const { sync } = await createFeedbackEntry({
      userId: profile.id,
      displayName: profile.name,
      contact: contact.trim(),
      title: title.trim(),
      content: content.trim(),
      categoryId: category?._id || null,
      categoryName: category?.name || '',
      categoryGroupId: category?.zaloGroupId || null,
      imageUrls,
      location,
    })

    res.status(201).json({
      ok: true,
      code: sync.ok ? sync.gopyId : null,
      pending: !sync.ok,
    })
  } catch (err) {
    console.error('[ReportApp] Lỗi tạo phản ánh:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/public/map-markers — không cần auth, dùng cho bản đồ trang login
// Chỉ trả về hồ sơ chưa giải quyết có tọa độ, không lộ thông tin nhạy cảm
router.get('/map-markers', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      status: { $nin: ['resolved', 'done'] },
      'location.lat': { $ne: null },
      'location.lng': { $ne: null },
    })
      .select('location content categoryId createdAt status')
      .populate('categoryId', 'name icon')
      .lean()

    const markers = feedbacks.map((fb) => ({
      id: fb._id.toString().slice(-5).toUpperCase(),
      lat: fb.location.lat,
      lng: fb.location.lng,
      address: fb.location.address || '',
      category: fb.categoryId?.name || 'Chưa phân loại',
      icon: fb.categoryId?.icon || '📋',
      content: fb.content.slice(0, 80) + (fb.content.length > 80 ? '...' : ''),
      createdAt: fb.createdAt,
      status: fb.status,
    }))

    res.json(markers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/public/location-submit — nhận tọa độ GPS từ mini web page
router.post('/location-submit', async (req, res) => {
  try {
    const { uid, lat, lng } = req.body
    if (!uid || lat == null || lng == null) {
      return res.status(400).json({ ok: false, message: 'Thiếu uid/lat/lng' })
    }
    const { handleLocation } = require('../../src/services/feedbackService')
    await handleLocation(String(uid), { lat: Number(lat), lng: Number(lng), address: '' })
    res.json({ ok: true })
  } catch (err) {
    console.error('[LocationSubmit]', err.message)
    res.status(500).json({ ok: false, message: err.message })
  }
})

module.exports = router
