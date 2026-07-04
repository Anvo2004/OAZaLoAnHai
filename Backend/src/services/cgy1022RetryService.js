const Feedback = require('../models/Feedback');
const cgy1022 = require('./cgy1022Service');

// ============================================================
// Retry đồng bộ phản ánh → Cổng góp ý 1022.
// - syncFeedbackById: đẩy 1 phản ánh + cập nhật trạng thái sync vào DB
//   (dùng ngay khi tạo phản ánh mới VÀ trong retry job).
// - startCgy1022Retry: quét định kỳ các bản chưa sync để đẩy lại.
// ============================================================

const RETRY_INTERVAL_MS = 10 * 60 * 1000; // quét mỗi 10 phút
const MAX_ATTEMPTS = 10;                  // quá 10 lần thì bỏ cuộc (log cảnh báo)
const BATCH_SIZE = 20;                    // mỗi lượt tối đa 20 bản, tuần tự

async function syncFeedbackById(feedbackId) {
  const fb = await Feedback.findById(feedbackId).populate('categoryId', 'name').lean();
  if (!fb) return { ok: false, error: `Không tìm thấy phản ánh ${feedbackId}` };
  if (fb.cgy1022?.synced) return { ok: true, gopyId: fb.cgy1022.gopyId };

  const r = await cgy1022.pushFeedback(fb);
  if (r.ok) {
    await Feedback.updateOne({ _id: feedbackId }, {
      'cgy1022.synced': true,
      'cgy1022.gopyId': r.gopyId || '',
      'cgy1022.syncedAt': new Date(),
      'cgy1022.lastError': '',
    });
  } else {
    await Feedback.updateOne({ _id: feedbackId }, {
      $inc: { 'cgy1022.attempts': 1 },
      'cgy1022.lastError': r.error || 'unknown',
    });
  }
  return r;
}

async function runRetrySweep() {
  try {
    // Chỉ quét bản đã tạo >5 phút để không giẫm chân luồng tạo mới (đang tự đẩy lần đầu);
    // vẫn bao được cả bản attempts=0 (server crash trước khi kịp thử lần nào).
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pending = await Feedback.find({
      'cgy1022.synced': false,
      'cgy1022.attempts': { $lt: MAX_ATTEMPTS },
      createdAt: { $lte: fiveMinAgo },
    })
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE)
      .select('_id')
      .lean();

    if (pending.length === 0) return;

    console.log(`[CGY1022] Retry: ${pending.length} phản ánh chờ đồng bộ lại`);
    for (const { _id } of pending) {
      const r = await syncFeedbackById(_id);
      const shortCode = _id.toString().slice(-5).toUpperCase();
      if (!r.ok) {
        console.warn(`[CGY1022] Retry #${shortCode} thất bại: ${r.error}`);
      }
    }

    // Cảnh báo các bản đã bỏ cuộc để admin biết mà xử lý tay
    const gaveUp = await Feedback.countDocuments({
      'cgy1022.synced': false,
      'cgy1022.attempts': { $gte: MAX_ATTEMPTS },
    });
    if (gaveUp > 0) console.warn(`[CGY1022] ⚠️ Có ${gaveUp} phản ánh đã quá ${MAX_ATTEMPTS} lần thử, không retry nữa`);
  } catch (err) {
    console.error('[CGY1022] Retry sweep lỗi:', err.message);
  }
}

function startCgy1022Retry() {
  if (!cgy1022.isConfigured()) {
    console.log('[CGY1022] Chưa cấu hình (.env) — bỏ qua đồng bộ Cổng góp ý 1022');
    return;
  }
  // Lần đầu sau 2 phút khởi động, sau đó mỗi 10 phút
  setTimeout(() => {
    runRetrySweep();
    setInterval(runRetrySweep, RETRY_INTERVAL_MS);
  }, 2 * 60 * 1000);
  console.log('[CGY1022] Retry job khởi động (quét mỗi 10 phút)');
}

module.exports = { syncFeedbackById, startCgy1022Retry };
