const { setState, getState, clearState } = require('./chatState');
const { sendZaloText } = require('../utils/zaloApi');
const Feedback = require('../models/Feedback');
const cgy1022 = require('./cgy1022Service');
const { isResolvedOnCgy, extractResultContent } = require('./cgy1022StatusService');

// Mã tra cứu = mã thật trên Cổng góp ý 1022 (gopyId, số, VD 105227) — KHÔNG còn dùng mã nội
// bộ tự sinh nữa. Chỉ liệt kê/tra cứu các phản ánh ĐÃ đồng bộ 1022 (có cgy1022.gopyId).
const CODE_RE = /^#?(\d{4,8})$/;
const MAX_LIST = 5;
const CANCEL_WORDS = ['huỷ', 'hủy', 'huy', 'cancel', 'thoát', 'thoat'];

function isLookupTrigger(text) {
  const lower = text.toLowerCase().trim();
  return (
    lower === '#tracuuhoso' ||
    lower === '#tracuugoopy' ||
    lower === '#theodoi' ||
    lower === '#theodoigopy' ||
    lower.includes('tra cứu hồ sơ') ||
    lower.includes('tra cuu ho so') ||
    lower.includes('theo dõi phản ánh') ||
    lower.includes('theo doi phan anh') ||
    lower.includes('theo dõi hồ sơ') ||
    lower.includes('theo doi ho so') ||
    lower.includes('tra cứu góp ý') ||
    lower.includes('tra cuu gop y') ||
    lower.includes('tra cứu phản ánh') ||
    lower.includes('tra cuu phan anh')
  );
}

function isDirectCode(text) {
  return CODE_RE.test(text.trim());
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

// Danh sách phản ánh ĐÃ có mã 1022 (bỏ qua bản chưa đồng bộ — không có mã thật để tra cứu)
async function startLookup(userId) {
  const synced = await Feedback.find({ userId, 'cgy1022.gopyId': { $exists: true, $ne: '' } })
    .sort({ createdAt: -1 })
    .limit(MAX_LIST)
    .lean();

  if (synced.length === 0) {
    const anyPending = await Feedback.exists({ userId, 'cgy1022.gopyId': '' });
    await sendZaloText(userId,
      anyPending
        ? '⏳ Phản ánh của bạn đang được đồng bộ mã, vui lòng thử lại sau ít phút.'
        : '📭 Bạn chưa có phản ánh nào được ghi nhận.\n\nBấm "Gửi góp ý, phản ánh" trong menu để gửi mới.'
    );
    return;
  }

  setState(userId, { step: 'lookup_list', gopyIds: synced.map((fb) => fb.cgy1022.gopyId) });

  const lines = synced.map((fb, i) =>
    `${i + 1}️⃣ Mã ${fb.cgy1022.gopyId} · ${formatDate(fb.createdAt)}`
  );

  await sendZaloText(userId,
    '📋 Các phản ánh đã gửi lên Cổng góp ý của bạn:\n\n' +
    lines.join('\n') +
    `\n\nNhắn số (1-${synced.length}) để xem trạng thái xử lý, hoặc nhắn thẳng mã phản ánh.\n` +
    '(Nhắn "huỷ" để thoát)'
  );
}

// Tra trạng thái LIVE trực tiếp từ 1022 (không dùng trạng thái nội bộ) — theo đúng yêu cầu:
// tình trạng hồ sơ dựa vào trường trạng thái thật trên Cổng góp ý.
async function replyStatus(userId, fb) {
  const gopyId = fb.cgy1022.gopyId;
  let detail;
  try {
    detail = await cgy1022.getFeedbackDetail(gopyId);
  } catch (err) {
    await sendZaloText(userId,
      `⚠️ Không lấy được trạng thái mới nhất từ Cổng góp ý cho mã ${gopyId} lúc này. Vui lòng thử lại sau.`
    );
    return;
  }

  const resolved = isResolvedOnCgy(detail);
  const statusLabel = detail?.tinhTrangXuLy || (resolved ? 'Đã xử lý' : 'Đang xử lý');
  const locationLine = fb.location?.address ? `📍 Địa chỉ: ${fb.location.address}\n` : '';

  let msg =
    `━━━━━━ THÔNG TIN HỒ SƠ ━━━━━━\n` +
    `🆔 Mã phản ánh: ${gopyId}\n` +
    `🗓️ Ngày gửi: ${formatDate(fb.createdAt)}\n` +
    `${locationLine}` +
    `📝 Nội dung: ${fb.content}\n\n` +
    `📊 Trạng thái (Cổng góp ý): ${resolved ? '✅' : '🕐'} ${statusLabel}`;

  if (resolved) {
    const result = extractResultContent(detail);
    if (result) msg += `\n\n━━━━━━ KẾT QUẢ XỬ LÝ ━━━━━━\n${result}`;
  }

  await sendZaloText(userId, msg);
}

async function lookupByCode(userId, rawCode) {
  const match = rawCode.trim().match(CODE_RE);
  const gopyId = match ? match[1] : rawCode.replace(/^#/, '').trim();

  clearState(userId);

  // Chỉ tìm trong CHÍNH phản ánh của user này — không cho tra mã của người khác dù đoán đúng số.
  const fb = await Feedback.findOne({ userId, 'cgy1022.gopyId': gopyId }).lean();
  if (!fb) {
    await sendZaloText(userId, `⚠️ Không tìm thấy phản ánh mã ${gopyId} trong các phản ánh của bạn.`);
    return;
  }
  await replyStatus(userId, fb);
}

async function handleLookupReply(userId, text) {
  const lower = text.toLowerCase().trim();

  if (CANCEL_WORDS.includes(lower)) {
    clearState(userId);
    await sendZaloText(userId, '❌ Đã huỷ.');
    return;
  }

  if (isDirectCode(text)) {
    await lookupByCode(userId, text);
    return;
  }

  const state = getState(userId);
  const gopyIds = state?.gopyIds || [];
  const idx = parseInt(lower, 10) - 1;

  if (Number.isInteger(idx) && gopyIds[idx]) {
    const gopyId = gopyIds[idx];
    clearState(userId);
    const fb = await Feedback.findOne({ userId, 'cgy1022.gopyId': gopyId }).lean();
    if (fb) await replyStatus(userId, fb);
    return;
  }

  await sendZaloText(userId, `⚠️ Vui lòng nhắn số (1-${gopyIds.length}) hoặc mã phản ánh.`);
}

module.exports = { isLookupTrigger, isDirectCode, startLookup, handleLookupReply, lookupByCode };
