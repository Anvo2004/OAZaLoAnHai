const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const requireRole = require('../middleware/requireRole')
const { syncFollowers, getStoredFollowers, getSyncedAt } = require('../../src/admin/followerService')
const { getStoredGroups, addGroup, removeGroup } = require('../../src/admin/groupService')
const { sendToUsers, getJob } = require('../../src/admin/broadcastService')
const { getLogs } = require('../../src/admin/logService')
const { uploadImageToZalo, uploadFileToZalo, getZaloUserProfile } = require('../../src/utils/zaloApi')

const UPLOAD_DIR = path.join(__dirname, '../../public/images')

// ── Debug getprofile (public — không cần auth để test) ────────────
router.get('/debug-profile/:userId', async (req, res) => {
  const axios = require('axios')
  const { getToken } = require('../../src/utils/zaloToken')
  try {
    const token = getToken()
    const data = encodeURIComponent(JSON.stringify({ user_id: req.params.userId }))
    const result = await axios.get(
      `https://openapi.zalo.me/v2.0/oa/getprofile?data=${data}`,
      { headers: { access_token: token } }
    )
    res.json({ raw: result.data, token_prefix: token.slice(0, 20) + '...' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Tất cả endpoints bên dưới chỉ cho superadmin
router.use(requireRole('superadmin'))

// ── Seed profile cache từ Feedback MongoDB ─────────────────────────
// Chạy 1 lần để có ngay tên của những người đã từng gửi phản ánh
router.post('/seed-profiles', async (req, res) => {
  try {
    const Feedback = require('../../src/models/Feedback')
    const { saveProfile } = require('../../src/admin/profileCache')

    const feedbacks = await Feedback.find(
      { displayName: { $exists: true, $ne: '' } },
      { userId: 1, displayName: 1 }
    ).lean()

    const uniqueMap = {}
    for (const fb of feedbacks) {
      if (fb.userId && fb.displayName && fb.displayName !== fb.userId) {
        uniqueMap[fb.userId] = fb.displayName
      }
    }

    const entries = Object.entries(uniqueMap)
    await Promise.all(entries.map(([userId, name]) => saveProfile(userId, name)))

    res.json({ ok: true, seeded: entries.length, message: `Đã seed ${entries.length} profile từ Feedback DB` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Followers ──────────────────────────────────────────────────────
router.get('/followers', async (req, res) => {
  const followers = await getStoredFollowers()
  const syncedAt = await getSyncedAt()
  res.json({ followers, syncedAt, count: followers.length })
})

router.post('/followers/sync', async (req, res) => {
  try {
    const followers = await syncFollowers()
    res.json({ ok: true, count: followers.length })
  } catch (err) {
    if (err.message === 'TOKEN_EXPIRED') {
      return res.status(503).json({
        error: 'Token Zalo OA đã hết hạn. Vui lòng cập nhật token tại /admin/set-tokens',
        code: 'TOKEN_EXPIRED',
      })
    }
    res.status(500).json({ error: err.message })
  }
})

// ── Groups ─────────────────────────────────────────────────────────
router.get('/groups', async (req, res) => {
  const groups = await getStoredGroups()
  res.json({ groups, count: groups.length })
})

router.post('/groups', async (req, res) => {
  const { group_id, name } = req.body
  if (!group_id) return res.status(400).json({ error: 'Cần group_id' })
  try {
    const groups = await addGroup({ group_id: group_id.trim(), name: (name || '').trim() || group_id.trim() })
    res.json({ ok: true, groups, count: groups.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/groups/:id', async (req, res) => {
  try {
    const groups = await removeGroup(req.params.id)
    res.json({ ok: true, groups, count: groups.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Upload ảnh ─────────────────────────────────────────────────────
router.post('/upload/image', (req, res) => {
  const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_, file, cb) =>
      cb(null, `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${path.extname(file.originalname)}`),
  })
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true)
      else cb(new Error('Chỉ nhận file ảnh'))
    },
  }).array('images', 5)

  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.files?.length) return res.status(400).json({ error: 'Không có file' })
    try {
      const attachmentIds = await Promise.all(
        req.files.map(async (file) => {
          const id = await uploadImageToZalo(file.path)
          fs.unlink(file.path, () => {})
          return id
        })
      )
      res.json({ ok: true, attachmentIds })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
})

// ── Upload video ───────────────────────────────────────────────────
router.post('/upload/video', (req, res) => {
  const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_, file, cb) =>
      cb(null, `vid_${Date.now()}${path.extname(file.originalname)}`),
  })
  const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
  }).single('video')

  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Không có file video' })

    const videoUrl = `${process.env.PUBLIC_URL || ''}/images/${req.file.filename}`
    // Giữ video 6 giờ rồi xoá
    setTimeout(() => fs.unlink(req.file.path, () => {}), 6 * 60 * 60 * 1000)
    res.json({ ok: true, articleToken: videoUrl })
  })
})

// ── Upload file ────────────────────────────────────────────────────
router.post('/upload/file', (req, res) => {
  const ALLOWED_EXT = ['.docx', '.pdf', '.xlsx', '.xls']
  const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_, file, cb) =>
      cb(null, `file_${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
  })
  const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      if (ALLOWED_EXT.includes(ext)) cb(null, true)
      else cb(new Error('Chỉ nhận file .docx, .pdf, .xlsx, .xls'))
    },
  }).single('file')

  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Không có file' })
    try {
      const attachmentId = await uploadFileToZalo(req.file.path, req.file.originalname)
      fs.unlink(req.file.path, () => {})
      res.json({ ok: true, attachmentId, filename: req.file.originalname })
    } catch (e) {
      fs.unlink(req.file.path, () => {})
      res.status(500).json({ error: e.message })
    }
  })
})

// ── Gửi tin nhắn ──────────────────────────────────────────────────
router.post('/send', async (req, res) => {
  const { userIds, message, attachmentIds, videoAttachmentId, fileAttachmentId, adminNote, linkUrl, linkTitle } = req.body
  if (!userIds?.length) return res.status(400).json({ error: 'Cần danh sách userIds' })

  const hasContent = message || attachmentIds?.length || videoAttachmentId || fileAttachmentId || linkUrl
  if (!hasContent) return res.status(400).json({ error: 'Cần nội dung, ảnh, video, file hoặc link' })

  const jobId = await sendToUsers(
    userIds,
    message,
    {
      attachmentIds: attachmentIds || [],
      videoAttachmentId: videoAttachmentId || null,
      fileAttachmentId: fileAttachmentId || null,
    },
    adminNote,
    linkUrl,
    linkTitle
  )
  res.json({ ok: true, jobId, total: userIds.length })
})

// ── Trạng thái job ─────────────────────────────────────────────────
router.get('/status/:jobId', (req, res) => {
  const job = getJob(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'Không tìm thấy job' })
  res.json(job)
})

// ── Lịch sử gửi ───────────────────────────────────────────────────
router.get('/logs', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50
  const logs = await getLogs(limit)
  res.json({ logs })
})

module.exports = router
