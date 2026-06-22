const AdminUser = require('../models/AdminUser')
const Notification = require('../models/Notification')
const { sendZaloToGroup } = require('../utils/zaloApi')
const { sendMail, buildFeedbackEmailHtml } = require('../utils/mailer')

// Thông báo cho cán bộ được phân công (chuông app + email + @mention nhóm Zalo).
// Dùng chung cho route phân công ở React API (api/routes/feedbacks.js) và admin EJS legacy (admin/routes/feedbacks.js)
// để tránh tình trạng phân công qua 1 trong 2 nơi mà cán bộ không nhận được thông báo nào.
async function notifyAssignment(feedback, assignedTo, { hasAttachments = false } = {}) {
  const officer = await AdminUser.findById(assignedTo, 'fullName zaloUserId email').lean()
  const catName = feedback.categoryId?.name || ''
  const groupId = feedback.categoryId?.zaloGroupId
  const shortCode = feedback._id.toString().slice(-5).toUpperCase()

  await Notification.create({
    userId: assignedTo,
    type: 'assigned',
    feedbackId: feedback._id,
    message: `Bạn được phân công xử lý phản ánh #${shortCode}`,
  })

  if (officer?.email) {
    await sendMail({
      to: officer.email,
      subject: `[UBND An Hải] Phân công xử lý phản ánh #${shortCode}`,
      html: buildFeedbackEmailHtml({ heading: 'Bạn được phân công xử lý phản ánh mới', feedback, shortCode }),
    })
  }

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
}

module.exports = { notifyAssignment }
