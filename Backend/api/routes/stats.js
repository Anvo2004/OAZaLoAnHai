const router = require('express').Router()
const Feedback = require('../../src/models/Feedback')
const { getProfiles } = require('../../src/admin/profileCache')

router.get('/', async (req, res) => {
  try {
    const [total, pending, processing, done] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ status: 'processing' }),
      Feedback.countDocuments({ status: 'done' }),
    ])

    const recent = await Feedback.find()
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
      const count = await Feedback.countDocuments({ createdAt: { $gte: start, $lt: end } })
      days.push(`${start.getDate()}/${start.getMonth() + 1}`)
      counts.push(count)
    }

    res.json({ stats: { total, pending, processing, done }, recent, chartDays: days, chartCounts: counts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
