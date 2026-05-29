const router = require('express').Router()
const Category = require('../../src/models/Category')
const ZaloGroupMember = require('../../src/models/ZaloGroupMember')
const requireRole = require('../middleware/requireRole')
const { getZaloGroupMembers } = require('../../src/utils/zaloApi')

// GET /:categoryId — danh sách members đã cache
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

    const { members, raw } = await getZaloGroupMembers(cat.zaloGroupId)

    if (!members.length) {
      return res.json({
        ok: false,
        synced: 0,
        debug: raw,
        message: raw?.error !== 0
          ? `Zalo API lỗi ${raw?.error}: ${raw?.message}`
          : 'API trả về 0 thành viên — OA có thể chưa được thêm vào nhóm hoặc chưa có quyền đọc members',
      })
    }

    let synced = 0
    for (const m of members) {
      const userId = m.user_id || m.id || m.userId
      if (!userId) continue
      await ZaloGroupMember.findOneAndUpdate(
        { zaloUserId: String(userId), categoryId: cat._id },
        {
          zaloUserId: String(userId),
          displayName: m.display_name || m.name || '',
          avatar: m.avatar || m.avatar_url || '',
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
