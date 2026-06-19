const router = require('express').Router()
const Category = require('../../src/models/Category')
const ZaloGroupMember = require('../../src/models/ZaloGroupMember')
const requireRole = require('../middleware/requireRole')
const { syncGroupsFromZalo } = require('../../src/services/groupSyncService')

// POST /sync-all — đồng bộ toàn bộ nhóm Zalo → web (superadmin)
router.post('/sync-all', requireRole('superadmin'), async (req, res) => {
  try {
    const result = await syncGroupsFromZalo()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET / — danh sách tất cả loại phản ánh
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ order: 1 }).lean()
    res.json({ categories })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST / — tạo mới (superadmin)
router.post('/', requireRole('superadmin'), async (req, res) => {
  try {
    const { name, zaloGroupId, icon, order } = req.body
    if (!name || !zaloGroupId) return res.status(400).json({ error: 'Thiếu name hoặc zaloGroupId' })
    const cat = await Category.create({ name, zaloGroupId, icon, order: order ?? 0 })
    res.status(201).json({ category: cat })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /create-zalo-group — tạo nhóm trên Zalo rồi lưu vào DB (superadmin)
router.post('/create-zalo-group', requireRole('superadmin'), async (req, res) => {
  try {
    const { name, icon, order, members } = req.body
    if (!name || !members || members.length === 0) {
      return res.status(400).json({ error: 'Thiếu name hoặc danh sách members' })
    }

    // 1. Gọi Zalo API
    const memberIds = members.map(m => m.userId)
    const { createZaloGroup } = require('../../src/utils/zaloApi')
    const zaloGroupId = await createZaloGroup(name, memberIds)

    // 2. Tạo Category
    const cat = await Category.create({ name, zaloGroupId, icon, order: order ?? 0 })

    // 3. Thêm thành viên vào ZaloGroupMember
    for (const m of members) {
      await ZaloGroupMember.create({
        zaloUserId: String(m.userId),
        displayName: m.displayName || 'Người dùng Zalo',
        avatar: m.avatar || '',
        categoryId: cat._id,
        groupId: zaloGroupId,
      }).catch(e => console.error('[ZaloGroupMember] Lỗi insert:', e.message))
    }

    res.status(201).json({ category: cat })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /:id — cập nhật (superadmin)
router.put('/:id', requireRole('superadmin'), async (req, res) => {
  try {
    const { name, zaloGroupId, icon, order } = req.body
    await Category.findByIdAndUpdate(req.params.id, { name, zaloGroupId, icon, order })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:id — xóa danh mục và toàn bộ thành viên (superadmin)
router.delete('/:id', requireRole('superadmin'), async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id)
    if (!cat) return res.status(404).json({ error: 'Không tìm thấy nhóm' })

    // Gọi API Zalo giải tán nhóm thực tế
    if (cat.zaloGroupId) {
      try {
        const { deleteZaloGroup } = require('../../src/utils/zaloApi')
        await deleteZaloGroup(cat.zaloGroupId)
      } catch (e) {
        console.warn(`[Category] Bỏ qua lỗi khi giải tán Zalo Group ${cat.zaloGroupId}:`, e.message)
        // Vẫn tiếp tục xóa dưới Database kể cả khi Zalo báo lỗi (vd: nhóm đã xóa sẵn, hoặc ko có quyền)
      }
    }

    await ZaloGroupMember.deleteMany({ categoryId: req.params.id })
    await Category.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
