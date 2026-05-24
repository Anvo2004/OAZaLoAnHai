const { sendZaloText } = require('../utils/zaloApi');
const {
  startFeedback,
  handleText,
  handleImage,
  handleContactCard,
  isFeedbackTrigger,
} = require('../services/feedbackService');

async function handleWebhook(body) {
  const eventName = body.event_name;
  const userId = body.sender?.id || body.follower?.id;
  if (!userId) return;

  console.log(`[Event] ${eventName} | userId: ${userId}`);

  // Chào mừng khi follow OA
  if (eventName === 'follow') {
    await sendZaloText(userId,
      'Xin chào! Chào mừng bạn quan tâm OA UBND phường An Hải 🏘️\n\n' +
      'Bạn có thể gửi góp ý, phản ánh tới chúng tôi bằng cách:\n' +
      '• Chọn mục "Góp ý, phản ánh" trong menu bên dưới\n' +
      '• Hoặc nhắn tin: #goopy'
    );
    return;
  }

  // User gửi text
  if (eventName === 'user_send_text') {
    const text = (body.message?.text || '').trim();
    if (!text) return;

    const displayName = body.sender?.display_name || '';

    // Kiểm tra contact card trong attachment
    const attachments = body.message?.attachments || [];
    const contactAttachment = attachments.find(a => a.type === 'contact');
    if (contactAttachment) {
      const phone = contactAttachment.payload?.phone || contactAttachment.payload?.phoneNumber || '';
      if (phone) {
        await handleContactCard(userId, phone, displayName);
        return;
      }
    }

    // Xử lý trong luồng góp ý (trigger chỉ kích hoạt khi chưa có luồng đang chạy)
    await handleText(userId, text, displayName);
    return;
  }

  // User click menu "Truy vấn tự động" (submit_info)
  if (eventName === 'user_submit_info') {
    const action = (body.info?.action_payload || body.info?.action || body.info?.data || '').trim();
    if (isFeedbackTrigger(action) || action === '#goopy') {
      await startFeedback(userId);
    }
    return;
  }

  // User gửi ảnh trực tiếp
  if (eventName === 'user_send_image') {
    const attachments = body.message?.attachments || [];
    const imageAtt = attachments.find(a => a.type === 'photo' || a.type === 'image');
    const imageUrl = imageAtt?.payload?.url || imageAtt?.payload?.thumbnail || '';
    if (imageUrl) {
      await handleImage(userId, imageUrl);
    }
    return;
  }
}

module.exports = { handleWebhook };
