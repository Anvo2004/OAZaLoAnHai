const router = require('express').Router()
const Category = require('../../src/models/Category')
const requireRole = require('../middleware/requireRole')

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

module.exports = router
