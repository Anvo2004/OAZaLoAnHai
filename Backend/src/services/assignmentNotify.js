const AdminUser = require('../models/AdminUser')
const Notification = require('../models/Notification')
const { sendZaloToGroup, sendZaloText } = require('../utils/zaloApi')
// Thông báo cho cán bộ được phân công (chuông app + @mention nhóm Zalo + tin nhắn Zalo cá nhân).
// Dùng cho route phân công ở API (api/routes/feedbacks.js)
// để tránh tình trạng phân công qua 1 trong 2 nơi mà cán bộ không nhận được thông báo nào.
async function notifyAssignment(feedback, assignedTo, { hasAttachments = false } = {}) {
  const officer = await AdminUser.findById(assignedTo, 'fullName zaloUserId').lean()
  const catName = feedback.categoryId?.name || ''
  const groupId = feedback.categoryId?.zaloGroupId
  const shortCode = feedback._id.toString().slice(-5).toUpperCase()

  await Notification.create({
    userId: assignedTo,
    type: 'assigned',
    feedbackId: feedback._id,
    message: `Bạn được phân công xử lý phản ánh #${shortCode}`,
  })

  const mentionTag = `@${officer?.fullName || assignedTo}`
  const msg =
    `📋 PHÂN CÔNG XỬ LÝ PHẢN ÁNH\n` +
    `${'─'.repeat(28)}\n` +
    `👤 Cán bộ: ${mentionTag}\n` +
    `🏷️ Loại: ${catName}\n` +
    `🆔 Mã: #${shortCode}\n` +
    `📝 Nội dung: ${feedback.content.slice(0, 80)}...` +
    (hasAttachments ? `\n📎 Có tệp đính kèm — xem trên hệ thống` : '')

  // Nếu cán bộ có zaloUserId thì gửi @mention thật trong nhóm Zalo
  const mentions = []
  if (officer?.zaloUserId) {
    const pos = msg.indexOf(mentionTag)
    if (pos !== -1) {
      mentions.push({
        user_id: officer.zaloUserId,
        display_name: officer.fullName || '',
        pos,
        len: mentionTag.length,
      })
    }
  }
  await sendZaloToGroup(msg, groupId, mentions)

  // Gửi tin nhắn trực tiếp đến Zalo cá nhân của cán bộ được phân công
  if (officer?.zaloUserId) {
    const deadline = feedback.deadline ? new Date(feedback.deadline) : null
    const deadlineStr = deadline
      ? deadline.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      : 'Chưa xác định'
    const personalMsg =
      `🔔 BẠN VỪA ĐƯỢC PHÂN CÔNG HỒ SƠ MỚI!\n` +
      `${'─'.repeat(28)}\n` +
      `🆔 Mã phản ánh: #${shortCode}\n` +
      `📂 Loại: ${catName}\n` +
      `📝 Nội dung: ${feedback.content.slice(0, 80)}${feedback.content.length > 80 ? '...' : ''}\n` +
      `📅 Hạn xử lý: ${deadlineStr}\n` +
      (hasAttachments ? `📎 Có tệp đính kèm — xem trên hệ thống\n` : '') +
      `\nVui lòng đăng nhập để xử lý kịp thời.`
    await sendZaloText(officer.zaloUserId, personalMsg)
  }
}

module.exports = { notifyAssignment }
