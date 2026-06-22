const ScheduledMessage = require('../models/ScheduledMessage');
const { sendToUsers, getJob } = require('./broadcastService');

const CHECK_INTERVAL_MS = 30 * 1000;

function waitForJob(jobId) {
  return new Promise((resolve) => {
    const poll = setInterval(() => {
      const job = getJob(jobId);
      if (!job || job.done) {
        clearInterval(poll);
        resolve(job);
      }
    }, 1000);
  });
}

function dispatch(sm) {
  (async () => {
    try {
      const jobId = await sendToUsers(
        sm.userIds,
        sm.message,
        {
          attachmentIds: sm.attachmentIds || [],
          videoAttachmentId: sm.videoAttachmentId || null,
          fileAttachmentId: sm.fileAttachmentId || null,
        },
        sm.adminNote,
        sm.linkUrl,
        sm.linkTitle
      );
      const job = await waitForJob(jobId);
      await ScheduledMessage.findByIdAndUpdate(sm._id, {
        status: 'sent',
        sentAt: new Date(),
        result: { sent: job?.sent ?? 0, failed: job?.failed ?? 0 },
      });
    } catch (err) {
      console.error('[ScheduledMessage] Lỗi gửi lịch hẹn', sm._id.toString(), ':', err.message);
      await ScheduledMessage.findByIdAndUpdate(sm._id, { status: 'failed' });
    }
  })();
}

async function runDueMessages() {
  const due = await ScheduledMessage.find({ status: 'pending', scheduledAt: { $lte: new Date() } });
  for (const sm of due) {
    sm.status = 'sending';
    await sm.save();
    dispatch(sm);
  }
}

function startScheduledMessageRunner() {
  setInterval(() => {
    runDueMessages().catch((err) => console.error('[ScheduledMessage] runner lỗi:', err.message));
  }, CHECK_INTERVAL_MS);
  console.log(`[ScheduledMessage] Runner kiểm tra lịch gửi mỗi ${CHECK_INTERVAL_MS / 1000}s`);
}

module.exports = { startScheduledMessageRunner };
