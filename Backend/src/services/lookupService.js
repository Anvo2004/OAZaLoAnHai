const { setState, getState, clearState } = require('./chatState');
const { sendZaloText } = require('../utils/zaloApi');
const Feedback = require('../models/Feedback');

const CODE_RE = /^#?([0-9a-f]{5})$/i;
const MAX_LIST = 5;
const CANCEL_WORDS = ['huỷ', 'hủy', 'huy', 'cancel', 'thoát', 'thoat'];

function isLookupTrigger(text) {
  const lower = text.toLowerCase().trim();
  return (
    lower === '#tracuugoopy' ||
    lower.includes('tra cứu góp ý') ||
    lower.includes('tra cuu gop y') ||
    lower.includes('tra cứu phản ánh') ||
    lower.includes('tra cuu phan anh')
  );
}

function isDirectCode(text) {
  return CODE_RE.test(text.trim());
}

function shortCode(fb) {
  return fb._id.toString().slice(-5).toUpperCase();
}

function isResolved(fb) {
  return fb.status === 'resolved' || fb.status === 'done';
}

function statusLine(fb) {
  return isResolved(fb) ? '✅ Đã xử lý xong' : '🕐 Đang xử lý';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

function truncate(text, max) {
  const t = (text || '').trim();
  return t.length > max ? t.slice(0, max).trim() + '...' : t;
}

async function startLookup(userId) {
  const items = await Feedback.find({ userId })
    .sort({ createdAt: -1 })
    .limit(MAX_LIST)
    .populate('categoryId', 'name')
    .lean();

  if (items.length === 0) {
    await sendZaloText(userId,
      '📭 Bạn chưa có phản ánh nào được ghi nhận.\n\n' +
      'Chọn "Góp ý, phản ánh" trong menu để gửi mới.'
    );
    return;
  }

  setState(userId, { step: 'lookup_list', items: items.map((i) => i._id.toString()) });

  const lines = items.map((fb, i) =>
    `${i + 1}️⃣ #${shortCode(fb)} · ${formatDate(fb.createdAt)} · ${statusLine(fb)}\n` +
    `   ${truncate(fb.content, 60)}`
  );

  await sendZaloText(userId,
    '📋 Các phản ánh gần đây của bạn:\n\n' +
    lines.join('\n\n') +
    `\n\nNhắn số (1-${items.length}) để xem chi tiết, hoặc nhắn mã (#XXXXX).\n` +
    '(Nhắn "huỷ" để thoát)'
  );
}

async function replyDetail(userId, fb) {
  const catName = fb.categoryId?.name || 'Chưa rõ';
  let msg =
    `📄 Phản ánh #${shortCode(fb)}\n` +
    `🗓️ Ngày gửi: ${formatDate(fb.createdAt)}\n` +
    `🏷️ Loại: ${catName}\n` +
    `📝 Nội dung: ${fb.content}\n\n` +
    `${statusLine(fb)}`;

  if (isResolved(fb)) {
    const reply = fb.finalResponse || fb.response || '';
    if (reply) msg += `\n💬 Phản hồi: ${reply}`;
  }

  await sendZaloText(userId, msg);
}

async function lookupByCode(userId, rawCode) {
  const match = rawCode.trim().match(CODE_RE);
  const code = (match ? match[1] : rawCode.replace(/^#/, '')).toUpperCase();

  const candidates = await Feedback.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('categoryId', 'name')
    .lean();

  const fb = candidates.find((f) => shortCode(f) === code);
  clearState(userId);

  if (!fb) {
    await sendZaloText(userId, `⚠️ Không tìm thấy phản ánh #${code} trong các phản ánh của bạn.`);
    return;
  }
  await replyDetail(userId, fb);
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
  const ids = state?.items || [];
  const idx = parseInt(lower, 10) - 1;

  if (Number.isInteger(idx) && ids[idx]) {
    const fb = await Feedback.findById(ids[idx]).populate('categoryId', 'name').lean();
    clearState(userId);
    if (fb) await replyDetail(userId, fb);
    return;
  }

  await sendZaloText(userId, `⚠️ Vui lòng nhắn số (1-${ids.length}) hoặc mã phản ánh (#XXXXX).`);
}

module.exports = { isLookupTrigger, isDirectCode, startLookup, handleLookupReply, lookupByCode };
