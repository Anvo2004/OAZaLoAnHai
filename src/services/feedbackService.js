const { sendZaloText, sendZaloGroupText } = require('../utils/zaloApi');
const { uploadFromUrl, uploadFromZaloImageUrl } = require('../utils/cloudinary');
const Feedback = require('../models/Feedback');

// State machine lưu trạng thái từng user trong memory (10 phút timeout)
const userStates = new Map();

function setState(userId, data) {
  userStates.set(userId, { ...data, ts: Date.now() });
  setTimeout(() => {
    const cur = userStates.get(userId);
    if (cur && cur.ts === userStates.get(userId)?.ts) userStates.delete(userId);
  }, 10 * 60 * 1000);
}

function getState(userId) {
  return userStates.get(userId) || null;
}

function clearState(userId) {
  userStates.delete(userId);
}

function isPhone(text) {
  return /^(0|\+84)[3-9]\d{8}$/.test(text.replace(/\s/g, ''));
}

function isEmail(text) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

function isUrl(text) {
  return /^https?:\/\/.+/i.test(text.trim());
}

// Bắt đầu luồng góp ý
async function startFeedback(userId) {
  setState(userId, { step: 'waiting_contact' });
  await sendZaloText(userId,
    '💬 Chào mừng bạn đến với tính năng Góp ý - Phản ánh của UBND phường An Hải!\n\n' +
    '📞 Vui lòng nhập **SĐT (09xxxxxxxx)** hoặc **email** của bạn để chúng tôi có thể liên hệ lại:\n\n' +
    '(Nhắn "huỷ" để thoát bất cứ lúc nào)'
  );
}

// Xử lý tin nhắn text từ user
async function handleText(userId, text, displayName) {
  const state = getState(userId);

  // Lệnh huỷ toàn cục
  const lower = text.toLowerCase().trim();
  if (['huỷ', 'huy', 'cancel', 'thoát', 'thoat'].includes(lower)) {
    clearState(userId);
    await sendZaloText(userId, '❌ Đã huỷ. Bạn có thể bắt đầu lại bằng cách chọn "Góp ý, phản ánh" trong menu.');
    return;
  }

  if (!state) return; // Không trong luồng → bỏ qua

  if (state.step === 'waiting_contact') {
    if (!isPhone(text) && !isEmail(text)) {
      await sendZaloText(userId,
        '⚠️ Thông tin liên hệ không hợp lệ.\n\n' +
        'Vui lòng nhập:\n• SĐT: 10 chữ số (VD: 0912345678)\n• Email: vd@gmail.com\n\n' +
        '(Nhắn "huỷ" để thoát)'
      );
      return;
    }
    setState(userId, { step: 'waiting_content', contact: text.trim(), displayName: displayName || '' });
    await sendZaloText(userId,
      '✅ Đã ghi nhận thông tin liên hệ.\n\n' +
      '✏️ Nhập **nội dung góp ý / phản ánh** của bạn (tối thiểu 5 ký tự):\n\n' +
      '(Nhắn "huỷ" để thoát)'
    );
    return;
  }

  if (state.step === 'waiting_content') {
    if (text.trim().length < 5) {
      await sendZaloText(userId, '⚠️ Nội dung quá ngắn. Vui lòng nhập ít nhất 5 ký tự.');
      return;
    }
    setState(userId, { ...state, step: 'waiting_image', content: text.trim() });
    await sendZaloText(userId,
      '📎 Bạn có muốn gửi hình ảnh minh hoạ không?\n\n' +
      '• Gõ **Không có hình ảnh** nếu không có\n' +
      '• Hoặc gửi **URL ảnh** (http/https)\n' +
      '• Hoặc **gửi ảnh trực tiếp** từ điện thoại\n\n' +
      '(Nhắn "huỷ" để thoát)'
    );
    return;
  }

  if (state.step === 'waiting_image') {
    const noImageKeywords = ['không có', 'khong co', 'không', 'khong', 'no', 'bỏ qua', 'bo qua'];
    if (noImageKeywords.some(k => lower.includes(k))) {
      setState(userId, { ...state, step: 'waiting_confirm', imageUrl: '' });
      await sendConfirmation(userId, { ...state, imageUrl: '' });
      return;
    }
    if (isUrl(text)) {
      await sendZaloText(userId, '⏳ Đang tải ảnh lên...');
      try {
        const imageUrl = await uploadFromUrl(text.trim());
        setState(userId, { ...state, step: 'waiting_confirm', imageUrl });
        await sendConfirmation(userId, { ...state, imageUrl });
      } catch (err) {
        console.error('[Cloudinary] Upload URL thất bại:', err.message);
        await sendZaloText(userId, '⚠️ Không thể tải ảnh từ URL đó. Hãy thử URL khác hoặc gõ "Không có hình ảnh".');
      }
      return;
    }
    await sendZaloText(userId,
      '⚠️ Không nhận ra định dạng.\n\n' +
      '• Gõ **Không có hình ảnh** để bỏ qua ảnh\n' +
      '• Gửi **URL ảnh** (http/https)\n' +
      '• Hoặc **gửi ảnh trực tiếp** từ điện thoại'
    );
    return;
  }

  if (state.step === 'waiting_confirm') {
    if (['xác nhận gửi', 'xac nhan gui', 'xác nhận', 'xac nhan', 'gửi', 'gui', 'ok', 'đồng ý', 'dong y'].some(k => lower.includes(k))) {
      await saveFeedback(userId, state);
      return;
    }
    if (['nhập lại', 'nhap lai', 'làm lại', 'lam lai', 'sửa', 'sua'].some(k => lower.includes(k))) {
      await startFeedback(userId);
      return;
    }
    await sendZaloText(userId,
      'Vui lòng chọn:\n• **Xác nhận gửi** — để gửi góp ý\n• **Nhập lại** — để nhập lại từ đầu\n• **Huỷ** — để thoát'
    );
    return;
  }
}

// Xử lý khi user gửi ảnh trực tiếp (event user_send_image)
async function handleImage(userId, imageUrl) {
  const state = getState(userId);
  if (!state || state.step !== 'waiting_image') return;

  await sendZaloText(userId, '⏳ Đang tải ảnh lên...');
  try {
    const cloudUrl = await uploadFromZaloImageUrl(imageUrl);
    setState(userId, { ...state, step: 'waiting_confirm', imageUrl: cloudUrl });
    await sendConfirmation(userId, { ...state, imageUrl: cloudUrl });
  } catch (err) {
    console.error('[Cloudinary] Upload ảnh Zalo thất bại:', err.message);
    await sendZaloText(userId, '⚠️ Không thể tải ảnh. Hãy thử lại hoặc gõ "Không có hình ảnh".');
  }
}

// Xử lý khi user gửi contact card (event user_send_text có attachment contact)
async function handleContactCard(userId, phone, displayName) {
  const state = getState(userId);
  if (!state || state.step !== 'waiting_contact') return;

  setState(userId, { step: 'waiting_content', contact: phone, displayName: displayName || '' });
  await sendZaloText(userId,
    `✅ Đã ghi nhận SĐT: ${phone}\n\n` +
    '✏️ Nhập **nội dung góp ý / phản ánh** của bạn (tối thiểu 5 ký tự):\n\n' +
    '(Nhắn "huỷ" để thoát)'
  );
}

async function sendConfirmation(userId, state) {
  const imageStatus = state.imageUrl ? `✅ Đã đính kèm ảnh.` : '❌ Không có ảnh.';
  await sendZaloText(userId,
    '📋 Xác nhận góp ý:\n' +
    `• Liên hệ: ${state.contact}\n` +
    `• Nội dung: ${state.content}\n` +
    `• Hình ảnh: ${imageStatus}\n\n` +
    'Vui lòng chọn: **Xác nhận gửi / Nhập lại / Hủy**'
  );
}

async function saveFeedback(userId, state) {
  try {
    const feedback = await Feedback.create({
      userId,
      displayName: state.displayName || '',
      contact: state.contact,
      content: state.content,
      imageUrl: state.imageUrl || '',
    });
    clearState(userId);

    await sendZaloText(userId,
      '✅ Đã tiếp nhận góp ý, cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất 💙\n\n' +
      'Mọi ý kiến của bạn giúp UBND phường An Hải phục vụ người dân ngày càng tốt hơn.'
    );

    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const nameInfo = state.displayName ? `👤 Tên: ${state.displayName}\n` : '';
    const imageInfo = state.imageUrl ? `🖼️ Ảnh: ${state.imageUrl}` : '🖼️ Ảnh: Không có';
    const groupMsg =
      `📩 GÓP Ý MỚI - ${now}\n` +
      `${'─'.repeat(30)}\n` +
      `${nameInfo}` +
      `📞 Liên hệ: ${state.contact}\n` +
      `📝 Nội dung:\n${state.content}\n` +
      `${imageInfo}\n` +
      `🆔 ID: ${feedback._id}`;

    await sendZaloGroupText(groupMsg);
    console.log(`[Feedback] Đã lưu góp ý từ userId=${userId} contact=${state.contact}`);
  } catch (err) {
    console.error('[Feedback] Lưu DB thất bại:', err.message);
    await sendZaloText(userId, '⚠️ Có lỗi xảy ra khi lưu góp ý. Vui lòng thử lại sau.');
  }
}

function isFeedbackTrigger(text) {
  const lower = text.toLowerCase();
  return (
    lower.includes('#goopy') ||
    lower.includes('góp ý') ||
    lower.includes('gop y') ||
    lower.includes('phản ánh') ||
    lower.includes('phan anh') ||
    lower === 'goopy'
  );
}

module.exports = { startFeedback, handleText, handleImage, handleContactCard, isFeedbackTrigger };
