const router = require('express').Router()
const Category = require('../../src/models/Category')
const ZaloGroupMember = require('../../src/models/ZaloGroupMember')
const requireRole = require('../middleware/requireRole')
const { getZaloGroupMembers } = require('../../src/utils/zaloApi')

// GET / — danh sách members đã cache theo categoryId
router.get('/:categoryId', async (req, res) => {
  try {
    const members = await ZaloGroupMember.find({ categoryId: req.params.categoryId })
      .sort({ displayName: 1 })
      .lean()
    res.json({ members })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /sync/:categoryId — sync từ Zalo API (superadmin)
router.post('/sync/:categoryId', requireRole('superadmin'), async (req, res) => {
  try {
    const cat = await Category.findById(req.params.categoryId).lean()
    if (!cat) return res.status(404).json({ error: 'Không tìm thấy danh mục' })

    const members = await getZaloGroupMembers(cat.zaloGroupId)
    if (!members.length) {
      return res.json({ ok: true, synced: 0, message: 'Nhóm không có thành viên hoặc API trả về rỗng' })
    }

    let synced = 0
    for (const m of members) {
      await ZaloGroupMember.findOneAndUpdate(
        { zaloUserId: m.user_id, categoryId: cat._id },
        {
          zaloUserId: m.user_id,
          displayName: m.display_name || '',
          avatar: m.avatar || '',
          categoryId: cat._id,
          groupId: cat.zaloGroupId,
          syncedAt: new Date(),
        },
        { upsert: true, new: true }
      )
      synced++
    }

    res.json({ ok: true, synced })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
