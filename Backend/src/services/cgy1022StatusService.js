const Feedback = require('../models/Feedback');
const cgy1022 = require('./cgy1022Service');
const { sendZaloText, sendZaloToGroup } = require('../utils/zaloApi');
const CONFIG = require('../config');

// ============================================================
// Theo dõi ngược trạng thái xử lý từ Cổng góp ý 1022.
// 1022 KHÔNG có cơ chế webhook đẩy dữ liệu về (đã xác nhận qua tài liệu +
// thực nghiệm — xem Document/TichHop_1022_TomTat.md) nên dùng POLL định kỳ
// GET chi tiết từng gopyId đã đồng bộ, phát hiện khi chuyển "Đã xử lý" thì
// tự nhắn Zalo cho công dân VÀ nhóm cán bộ phụ trách danh mục.
// Nguyên tắc giống cgy1022RetryService: KHÔNG throw ra ngoài, lỗi chỉ log.
// ============================================================

// 1022 không có webhook — poll là cách duy nhất phát hiện thay đổi trạng thái. Rút ngắn xuống
// 5 phút để giảm độ trễ (gần đúng nhất có thể thay cho webhook thật không tồn tại).
const POLL_INTERVAL_MS = 5 * 60 * 1000; // quét mỗi 5 phút
const BATCH_SIZE = 20;

// Nhận diện linh hoạt trạng thái "đã xử lý" — production đã chứng minh khác tài liệu 2022,
// nên so khớp cả mã lẫn nhãn text để không bỏ sót khi 1022 đổi tên field.
function isResolvedOnCgy(detail) {
  const ma = String(detail?.maTinhTrangXuLy || '').toUpperCase();
  const label = String(detail?.tinhTrangXuLy || '');
  return ma === 'DA_XU_LY' || label.includes('Đã xử lý');
}

function extractResultContent(detail) {
  const list = Array.isArray(detail?.thongTinXuLy) ? detail.thongTinXuLy : [];
  if (list.length === 0) return '';
  return list
    .map((xl) => `${xl.tenCoQuan ? `[${xl.tenCoQuan}] ` : ''}${xl.noiDungXuLy || ''}`.trim())
    .filter(Boolean)
    .join('\n');
}

async function checkOne(fb) {
  const gopyId = fb.cgy1022?.gopyId;
  if (!gopyId) return;

  let detail;
  try {
    detail = await cgy1022.getFeedbackDetail(gopyId);
  } catch (err) {
    const d = err.response ? `HTTP ${err.response.status}` : err.message;
    console.warn(`[CGY1022] Tra cứu trạng thái gopyId=${gopyId} thất bại: ${d}`);
    return;
  }

  await Feedback.updateOne(
    { _id: fb._id },
    { 'cgy1022.resultStatus': detail?.maTinhTrangXuLy || detail?.tinhTrangXuLy || '' }
  );

  if (!isResolvedOnCgy(detail)) return;

  const resultContent = extractResultContent(detail) || 'Phản ánh của bạn đã được xử lý.';
  const now = new Date();
  const categoryName = fb.categoryId?.name || '';
  const groupId = fb.categoryId?.zaloGroupId || '';

  // Báo cho công dân
  if (fb.userId) {
    await sendZaloText(
      fb.userId,
      `✅ Phản ánh ${gopyId} của bạn đã được xử lý trên Cổng góp ý 1022:\n\n${resultContent}`
    ).catch((err) => console.error('[CGY1022] Lỗi nhắn kết quả cho dân:', err.message));
  }

  // Báo cho nhóm cán bộ phụ trách danh mục — nêu Mã ý kiến, nguồn góp ý, lĩnh vực
  if (groupId) {
    const groupMsg =
      `📣 KẾT QUẢ XỬ LÝ TỪ CỔNG GÓP Ý 1022 — ${now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n` +
      `${'─'.repeat(30)}\n` +
      `🆔 Mã phản ánh: ${gopyId}\n` +
      `📡 Nguồn góp ý: ${CONFIG.CGY1022_NGUON}\n` +
      `🏷️ Lĩnh vực: ${categoryName || 'Chưa rõ'}\n` +
      `📝 Nội dung xử lý:\n${resultContent}`;
    await sendZaloToGroup(groupMsg, groupId).catch((err) =>
      console.error('[CGY1022] Lỗi nhắn kết quả cho nhóm:', err.message)
    );
  }

  await Feedback.updateOne(
    { _id: fb._id },
    {
      status: 'resolved',
      finalResponse: resultContent,
      sentAt: now,
      'cgy1022.resultNotifiedAt': now,
      'cgy1022.resultStatus': detail?.maTinhTrangXuLy || detail?.tinhTrangXuLy || '',
    }
  );

  console.log(`[CGY1022] gopyId=${gopyId} đã xử lý — đã báo dân + nhóm`);
}

async function runPollSweep() {
  try {
    const pending = await Feedback.find({
      'cgy1022.synced': true,
      'cgy1022.gopyId': { $exists: true, $ne: '' },
      'cgy1022.resultNotifiedAt': null,
      status: { $ne: 'resolved' },
    })
      .sort({ 'cgy1022.syncedAt': 1 })
      .limit(BATCH_SIZE)
      .populate('categoryId', 'name zaloGroupId')
      .lean();

    if (pending.length === 0) return;

    console.log(`[CGY1022] Poll trạng thái: kiểm tra ${pending.length} phản ánh`);
    for (const fb of pending) {
      await checkOne(fb);
    }
  } catch (err) {
    console.error('[CGY1022] Poll sweep lỗi:', err.message);
  }
}

function startCgy1022StatusPoll() {
  if (!cgy1022.isConfigured()) {
    console.log('[CGY1022] Chưa cấu hình (.env) — bỏ qua poll trạng thái xử lý');
    return;
  }
  // Lần đầu sau 2 phút khởi động (lệch với retry job 10 phút để không dồn tải), sau đó mỗi 5 phút
  setTimeout(() => {
    runPollSweep();
    setInterval(runPollSweep, POLL_INTERVAL_MS);
  }, 2 * 60 * 1000);
  console.log('[CGY1022] Poll trạng thái xử lý khởi động (quét mỗi 5 phút)');
}

module.exports = { startCgy1022StatusPoll, runPollSweep, isResolvedOnCgy, extractResultContent };
