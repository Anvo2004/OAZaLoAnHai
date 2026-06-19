const router = require('express').Router()
const Notification = require('../../src/models/Notification')

// GET / — danh sách thông báo của tôi (mới nhất trước) + số chưa đọc
router.get('/', async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('feedbackId', 'content status')
        .lean(),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ])
    res.json({ notifications, unreadCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /:id/read — đánh dấu 1 thông báo đã đọc
router.post('/:id/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true }
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /read-all — đánh dấu tất cả đã đọc
router.post('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
