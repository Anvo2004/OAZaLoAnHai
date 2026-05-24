const router = require('express').Router()
const Feedback = require('../../src/models/Feedback')
const AdminUser = require('../../src/models/AdminUser')
const requireRole = require('../middleware/requireRole')
const { sendZaloText } = require('../../src/utils/zaloApi')

// GET / — danh sách
router.get('/', async (req, res) => {
  try {
    const { status, assignedTo, q, page = 1 } = req.query
    const limit = 20
    const skip = (parseInt(page) - 1) * limit
    const filter = {}
    if (status) filter.status = status
    if (assignedTo === 'none') filter.assignedTo = null
    else if (assignedTo) filter.assignedTo = assignedTo
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ displayName: regex }, { contact: regex }, { content: regex }]
    }
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('assignedTo', 'fullName').lean(),
      Feedback.countDocuments(filter),
    ])
    res.json({ feedbacks, pagination: { page: parseInt(page), totalPages: Math.ceil(total / limit), total } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /:id — chi tiết
router.get('/:id', async (req, res) => {
  try {
    const [feedback, admins] = await Promise.all([
      Feedback.findById(req.params.id)
        .populate('assignedTo', 'fullName username')
        .populate('respondedBy', 'fullName')
        .lean(),
      AdminUser.find({}, 'fullName username').lean(),
    ])
    if (!feedback) return res.status(404).json({ error: 'Không tìm thấy góp ý' })
    res.json({ feedback, admins })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /:id — cập nhật
router.put('/:id', async (req, res) => {
  try {
    const { status, note } = req.body
    const update = { updatedAt: new Date() }
    if (status) update.status = status
    if (note !== undefined) update.note = note
    await Feedback.findByIdAndUpdate(req.params.id, update)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:id — xóa (superadmin)
router.delete('/:id', requireRole('superadmin'), async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /:id/reply — gửi Zalo
router.post('/:id/reply', async (req, res) => {
  try {
    const { response } = req.body
    if (!response?.trim()) return res.status(400).json({ error: 'Vui lòng nhập nội dung phản hồi' })
    const feedback = await Feedback.findById(req.params.id)
    if (!feedback) return res.status(404).json({ error: 'Không tìm thấy góp ý' })
    await sendZaloText(feedback.userId, response.trim())
    await Feedback.findByIdAndUpdate(req.params.id, {
      response: response.trim(),
      respondedAt: new Date(),
      respondedBy: req.session.adminUser.id,
      status: feedback.status === 'pending' ? 'processing' : feedback.status,
      updatedAt: new Date(),
    })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /:id/assign — phân công
router.post('/:id/assign', async (req, res) => {
  try {
    const { assignedTo } = req.body
    await Feedback.findByIdAndUpdate(req.params.id, { assignedTo: assignedTo || null, updatedAt: new Date() })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
