const { sendZaloText, sendZaloButtons, sendZaloToGroup, getZaloUserProfile } = require('../utils/zaloApi');
const { uploadFromUrl, uploadFromZaloImageUrl } = require('../utils/cloudinary');
const Feedback = require('../models/Feedback');
const Category = require('../models/Category');

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
    '📞 Vui lòng nhập SĐT (09xxxxxxxx) hoặc email của bạn để chúng tôi có thể liên hệ lại:\n\n' +
    '(Nhắn "huỷ" để thoát bất cứ lúc nào)'
  );
}

async function sendCategoryMenu(userId) {
  await sendZaloText(userId,
    '🏷️ Chọn loại phản ánh của bạn:\n\n' +
    '1️⃣ Môi trường, Hạ tầng, Xây dựng\n' +
    '2️⃣ Văn hoá, Giáo dục, Y tế\n' +
    '3️⃣ Dịch vụ công, Thủ tục hành chính\n' +
    '4️⃣ An ninh trật tự, PCCC\n\n' +
    '(Gõ số 1-4 để chọn)'
  );
}

// Xử lý tin nhắn text từ user
async function handleText(userId, text, displayName) {
  const state = getState(userId);

  const lower = text.toLowerCase().trim().normalize('NFC');

  // Lệnh huỷ toàn cục
  if (['huỷ', 'hủy', 'huy', 'cancel', 'thoát', 'thoat'].includes(lower)) {
    clearState(userId);
    await sendZaloText(userId, '❌ Đã huỷ. Bạn có thể bắt đầu lại bằng cách chọn "Góp ý, phản ánh" trong menu.');
    return;
  }

  if (!state) {
    if (isFeedbackTrigger(text)) await startFeedback(userId);
    return;
  }

  if (state.step === 'waiting_contact') {
    if (!isPhone(text) && !isEmail(text)) {
      await sendZaloText(userId,
        '⚠️ Thông tin liên hệ không hợp lệ.\n\n' +
        'Vui lòng nhập:\n• SĐT: 10 chữ số (VD: 0912345678)\n• Email: vd@gmail.com\n\n' +
        '(Nhắn "huỷ" để thoát)'
      );
      return;
    }
    setState(userId, { step: 'waiting_category', contact: text.trim(), displayName: displayName || '' });
    await sendCategoryMenu(userId);
    return;
  }

  if (state.step === 'waiting_category') {
    const num = lower.trim();
    const validChoices = ['1', '2', '3', '4'];
    if (!validChoices.includes(num)) {
      await sendZaloText(userId, '⚠️ Vui lòng gõ số từ 1 đến 4 để chọn loại phản ánh.');
      await sendCategoryMenu(userId);
      return;
    }
    // Lấy category theo thứ tự từ DB
    const categories = await Category.find({}).sort({ order: 1 }).lean();
    const idx = parseInt(num) - 1;
    if (!categories[idx]) {
      await sendZaloText(userId, '⚠️ Danh mục chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
      return;
    }
    const cat = categories[idx];
    setState(userId, {
      ...state,
      step: 'waiting_content',
      categoryId: cat._id.toString(),
      categoryName: cat.name,
      categoryGroupId: cat.zaloGroupId,
    });
    await sendZaloText(userId,
      `✅ Loại phản ánh: ${cat.name}\n\n` +
      '✏️ Nhập nội dung góp ý / phản ánh của bạn (tối thiểu 5 ký tự):\n\n' +
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
      '• Gửi URL ảnh (http/https)\n' +
      '• Hoặc gửi ảnh trực tiếp từ điện thoại\n\n' +
      '1️⃣ Không có hình ảnh — gõ số 1 để bỏ qua'
    );
    return;
  }

  if (state.step === 'waiting_image') {
    const noImageKeywords = ['1', 'không có', 'khong co', 'không', 'khong', 'no', 'bỏ qua', 'bo qua'];
    if (noImageKeywords.some(k => lower.trim() === k || lower.includes(k))) {
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
      '⚠️ Bạn đang ở bước gửi hình ảnh.\n\n' +
      '• Gửi URL ảnh (http/https)\n' +
      '• Hoặc gửi ảnh trực tiếp từ điện thoại\n\n' +
      '1️⃣ Không có hình ảnh — gõ số 1 để bỏ qua'
    );
    return;
  }

  if (state.step === 'waiting_confirm') {
    if (lower.trim() === '1' || ['xác nhận gửi', 'xac nhan gui', 'xác nhận', 'xac nhan', 'gửi', 'gui', 'ok', 'đồng ý', 'dong y'].some(k => lower.includes(k.normalize('NFC')))) {
      await saveFeedback(userId, state);
      return;
    }
    if (lower.trim() === '2' || ['nhập lại', 'nhap lai', 'làm lại', 'lam lai', 'sửa', 'sua'].some(k => lower.includes(k.normalize('NFC')))) {
      await startFeedback(userId);
      return;
    }
    if (lower.trim() === '3' || ['huỷ', 'hủy', 'huy', 'cancel'].some(k => lower.includes(k.normalize('NFC')))) {
      clearState(userId);
      await sendZaloText(userId, '❌ Đã huỷ. Bạn có thể bắt đầu lại bằng cách chọn "Góp ý, phản ánh" trong menu.');
      return;
    }
    await sendZaloText(userId,
      '⚠️ Vui lòng trả lời bằng số:\n1️⃣ Xác nhận gửi\n2️⃣ Nhập lại\n3️⃣ Huỷ'
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

// Xử lý khi user gửi contact card
async function handleContactCard(userId, phone, displayName) {
  const state = getState(userId);
  if (!state || state.step !== 'waiting_contact') return;

  setState(userId, { step: 'waiting_category', contact: phone, displayName: displayName || '' });
  await sendZaloText(userId, `✅ Đã ghi nhận SĐT: ${phone}\n`);
  await sendCategoryMenu(userId);
}

async function sendConfirmation(userId, state) {
  const imageStatus = state.imageUrl ? '✅ Đã đính kèm ảnh' : '❌ Không có ảnh';
  await sendZaloText(userId,
    '📋 Xác nhận góp ý:\n' +
    `• Liên hệ: ${state.contact}\n` +
    `• Loại: ${state.categoryName || 'Chưa chọn'}\n` +
    `• Nội dung: ${state.content}\n` +
    `• Hình ảnh: ${imageStatus}\n\n` +
    'Trả lời bằng số:\n' +
    '1️⃣ Xác nhận gửi\n' +
    '2️⃣ Nhập lại\n' +
    '3️⃣ Huỷ'
  );
}

async function saveFeedback(userId, state) {
  try {
    let displayName = state.displayName || '';
    if (!displayName) {
      const profile = await getZaloUserProfile(userId);
      displayName = profile?.display_name || '';
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);

    const feedback = await Feedback.create({
      userId,
      displayName,
      contact: state.contact,
      content: state.content,
      imageUrl: state.imageUrl || '',
      categoryId: state.categoryId || null,
      deadline,
    });
    clearState(userId);

    // Tạo mã phản ánh ngắn từ 5 ký tự cuối của ObjectId
    const shortCode = feedback._id.toString().slice(-5).toUpperCase();

    await sendZaloText(userId,
      '✅ Đã tiếp nhận phản ánh!\n\n' +
      `Mã phản ánh: #${shortCode}\n` +
      'UBND phường An Hải sẽ xử lý\n' +
      'trong 2-3 ngày làm việc kể từ\n' +
      'ngày tiếp nhận. Cảm ơn bạn!'
    );

    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const nameInfo = displayName ? `👤 Tên: ${displayName}\n` : '';
    const imageInfo = state.imageUrl ? `🖼️ Ảnh: ${state.imageUrl}` : '🖼️ Ảnh: Không có';
    const catInfo = state.categoryName ? `🏷️ Loại: ${state.categoryName}\n` : '';
    const groupMsg =
      `📩 PHẢN ÁNH MỚI - ${now}\n` +
      `${'─'.repeat(30)}\n` +
      `${nameInfo}` +
      `📞 Liên hệ: ${state.contact}\n` +
      `${catInfo}` +
      `📝 Nội dung:\n${state.content}\n` +
      `${imageInfo}\n` +
      `🆔 Mã: #${shortCode}`;

    // Gửi vào nhóm Zalo đúng theo loại phản ánh
    const targetGroupId = state.categoryGroupId;
    await sendZaloToGroup(groupMsg, targetGroupId);

    console.log(`[Feedback] Lưu góp ý userId=${userId} contact=${state.contact} category=${state.categoryName}`);
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
