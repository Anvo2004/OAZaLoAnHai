const router = require('express').Router()
const Feedback = require('../../src/models/Feedback')
const { getProfiles } = require('../../src/admin/profileCache')
const { withScope } = require('../middleware/feedbackScope')

router.get('/', async (req, res) => {
  try {
    // "processing" = đang xử lý (cán bộ đã nhận và soạn dự thảo)
    // "done" = đã xử lý / đã giải quyết (đã duyệt và gửi phản hồi cho dân)
    // Mọi con số + danh sách đều giới hạn theo quyền người đang đăng nhập
    const scope = (extra) => withScope(req.user, extra)
    const [total, pending, processing, done] = await Promise.all([
      Feedback.countDocuments(scope({})),
      Feedback.countDocuments(scope({ status: 'pending' })),
      Feedback.countDocuments(scope({ status: { $in: ['draft', 'processing'] } })),
      Feedback.countDocuments(scope({ status: { $in: ['resolved', 'done'] } })),
    ])

    const recent = await Feedback.find(scope({}))
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'fullName')
      .lean()

    // Enrich displayName + avatar từ Redis profile cache
    const needProfile = recent.filter((f) => f.userId && (!f.displayName || !f.avatar)).map((f) => f.userId)
    if (needProfile.length) {
      const profiles = await getProfiles(needProfile)
      recent.forEach((f) => {
        const p = f.userId && profiles[f.userId]
        if (!p) return
        if (!f.displayName && p.display_name) f.displayName = p.display_name
        if (!f.avatar) f.avatar = p.avatar || ''
      })
    }

    const days = [], counts = []
    for (let i = 6; i >= 0; i--) {
      const start = new Date()
      start.setDate(start.getDate() - i)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      const count = await Feedback.countDocuments(scope({ createdAt: { $gte: start, $lt: end } }))
      days.push(`${start.getDate()}/${start.getMonth() + 1}`)
      counts.push(count)
    }

    res.json({ stats: { total, pending, processing, done }, recent, chartDays: days, chartCounts: counts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
