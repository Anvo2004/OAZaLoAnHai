const router = require('express').Router()
const ExcelJS = require('exceljs')
const Feedback = require('../../src/models/Feedback')
const requireRole = require('../middleware/requireRole')

router.use(requireRole('superadmin', 'dept_leader'))

// ── Tính khoảng thời gian + đơn vị nhóm theo loại kỳ báo cáo ──────────
function getDateRange(period, value) {
  const now = new Date()

  if (period === 'day') {
    const d = value ? new Date(value) : now
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const end = new Date(start); end.setDate(end.getDate() + 1)
    return { start, end, granularity: 'hour', label: `Ngày ${start.toLocaleDateString('vi-VN')}` }
  }

  if (period === 'week') {
    // value dạng "YYYY-Www" (input type=week)
    let start
    if (value && /^\d{4}-W\d{2}$/.test(value)) {
      const [y, w] = value.split('-W').map(Number)
      start = new Date(y, 0, 1 + (w - 1) * 7)
      const dow = start.getDay() || 7
      start.setDate(start.getDate() - dow + 1) // về thứ 2
    } else {
      start = new Date(now)
      const dow = start.getDay() || 7
      start.setDate(start.getDate() - dow + 1)
    }
    start.setHours(0, 0, 0, 0)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    return { start, end, granularity: 'day', label: `Tuần từ ${start.toLocaleDateString('vi-VN')} đến ${new Date(end.getTime() - 86400000).toLocaleDateString('vi-VN')}` }
  }

  if (period === 'month') {
    let y = now.getFullYear(), m = now.getMonth()
    if (value && /^\d{4}-\d{2}$/.test(value)) {
      const [yy, mm] = value.split('-').map(Number)
      y = yy; m = mm - 1
    }
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 1)
    return { start, end, granularity: 'day', label: `Tháng ${m + 1}/${y}` }
  }

  if (period === 'quarter') {
    let y = now.getFullYear(), q = Math.floor(now.getMonth() / 3) + 1
    if (value && /^\d{4}-[1-4]$/.test(value)) {
      const [yy, qq] = value.split('-').map(Number)
      y = yy; q = qq
    }
    const start = new Date(y, (q - 1) * 3, 1)
    const end = new Date(y, q * 3, 1)
    return { start, end, granularity: 'month', label: `Quý ${q}/${y}` }
  }

  if (period === 'year') {
    let y = now.getFullYear()
    if (value && /^\d{4}$/.test(value)) y = Number(value)
    const start = new Date(y, 0, 1)
    const end = new Date(y + 1, 0, 1)
    return { start, end, granularity: 'month', label: `Năm ${y}` }
  }

  // fallback: 30 ngày gần nhất
  const start = new Date(now); start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0)
  const end = new Date(now); end.setDate(end.getDate() + 1)
  return { start, end, granularity: 'day', label: '30 ngày gần nhất' }
}

function bucketKey(date, granularity) {
  const d = new Date(date)
  if (granularity === 'hour') return `${d.getHours()}h`
  if (granularity === 'month') return `${d.getMonth() + 1}/${d.getFullYear()}`
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function buildTimeline(start, end, granularity) {
  const buckets = []
  if (granularity === 'hour') {
    for (let h = 0; h < 24; h++) buckets.push(`${h}h`)
  } else if (granularity === 'month') {
    const cur = new Date(start)
    while (cur < end) {
      buckets.push(`${cur.getMonth() + 1}/${cur.getFullYear()}`)
      cur.setMonth(cur.getMonth() + 1)
    }
  } else {
    const cur = new Date(start)
    while (cur < end) {
      buckets.push(`${cur.getDate()}/${cur.getMonth() + 1}`)
      cur.setDate(cur.getDate() + 1)
    }
  }
  return buckets
}

function isResolvedStatus(s) { return s === 'resolved' || s === 'done' }
function isProcessingStatus(s) { return s === 'draft' || s === 'processing' }

async function buildReportData(period, value) {
  const { start, end, granularity, label } = getDateRange(period, value)

  const feedbacks = await Feedback.find({ createdAt: { $gte: start, $lt: end } })
    .populate('categoryId', 'name icon')
    .populate('assignedTo', 'fullName')
    .sort({ createdAt: 1 })
    .lean()

  const totals = { total: feedbacks.length, pending: 0, processing: 0, resolved: 0 }
  const categoryMap = new Map()
  const timelineMap = new Map()

  for (const fb of feedbacks) {
    if (isResolvedStatus(fb.status)) totals.resolved++
    else if (isProcessingStatus(fb.status)) totals.processing++
    else totals.pending++

    const catName = fb.categoryId?.name || 'Chưa phân loại'
    categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)

    const key = bucketKey(fb.createdAt, granularity)
    timelineMap.set(key, (timelineMap.get(key) || 0) + 1)
  }

  const timelineBuckets = buildTimeline(start, end, granularity)
  const timeline = timelineBuckets.map((k) => ({ label: k, count: timelineMap.get(k) || 0 }))
  const byCategory = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))

  return { range: { start, end, label }, totals, byCategory, timeline, feedbacks }
}

// GET /api/reports/summary?period=day|week|month|quarter|year&value=...
router.get('/summary', async (req, res) => {
  try {
    const { period = 'month', value } = req.query
    const data = await buildReportData(period, value)
    res.json({
      range: data.range,
      totals: data.totals,
      byCategory: data.byCategory,
      timeline: data.timeline,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/reports/export?period=...&value=... — xuất file Excel
router.get('/export', async (req, res) => {
  try {
    const { period = 'month', value } = req.query
    const data = await buildReportData(period, value)

    const wb = new ExcelJS.Workbook()
    wb.creator = 'UBND Phường An Hải'
    wb.created = new Date()

    // ── Sheet 1: Tổng hợp ──
    const s1 = wb.addWorksheet('Tổng hợp')
    s1.mergeCells('A1:B1')
    s1.getCell('A1').value = `BÁO CÁO THỐNG KÊ GÓP Ý - PHẢN ÁNH — ${data.range.label}`
    s1.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1B5E20' } }
    s1.addRow([])
    s1.addRow(['Chỉ số', 'Số lượng']).font = { bold: true }
    s1.addRow(['Tổng số phản ánh', data.totals.total])
    s1.addRow(['Chờ xử lý', data.totals.pending])
    s1.addRow(['Đang xử lý', data.totals.processing])
    s1.addRow(['Đã xử lý', data.totals.resolved])
    s1.addRow([])
    s1.addRow(['Phân loại theo danh mục']).font = { bold: true }
    s1.addRow(['Danh mục', 'Số lượng']).font = { bold: true }
    data.byCategory.forEach((c) => s1.addRow([c.name, c.count]))
    s1.columns = [{ width: 36 }, { width: 16 }]

    // ── Sheet 2: Theo thời gian ──
    const s2 = wb.addWorksheet('Theo thời gian')
    s2.addRow(['Thời điểm', 'Số lượng']).font = { bold: true }
    data.timeline.forEach((t) => s2.addRow([t.label, t.count]))
    s2.columns = [{ width: 20 }, { width: 14 }]

    // ── Sheet 3: Chi tiết hồ sơ ──
    const s3 = wb.addWorksheet('Chi tiết hồ sơ')
    const headers = ['Mã hồ sơ', 'Ngày gửi', 'Người gửi', 'Liên hệ', 'Danh mục', 'Địa chỉ', 'Nội dung', 'Trạng thái', 'Người phụ trách', 'Hạn xử lý']
    s3.addRow(headers).font = { bold: true }
    data.feedbacks.forEach((fb) => {
      const statusLabel = isResolvedStatus(fb.status) ? 'Đã xử lý' : isProcessingStatus(fb.status) ? 'Đang xử lý' : 'Chờ xử lý'
      s3.addRow([
        fb._id.toString().slice(-5).toUpperCase(),
        new Date(fb.createdAt).toLocaleDateString('vi-VN'),
        fb.displayName || '',
        fb.contact || '',
        fb.categoryId?.name || 'Chưa phân loại',
        fb.location?.address || '',
        fb.content || '',
        statusLabel,
        fb.assignedTo?.fullName || '',
        fb.deadline ? new Date(fb.deadline).toLocaleDateString('vi-VN') : '',
      ])
    })
    s3.columns = headers.map((h) => ({ width: h === 'Nội dung' ? 40 : h === 'Địa chỉ' ? 28 : 18 }))

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="BaoCao_GopY_${period}_${Date.now()}.xlsx"`)
    await wb.xlsx.write(res)
    res.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
