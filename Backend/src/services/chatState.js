// State machine lưu trạng thái từng user trong memory (10 phút timeout)
// Dùng chung cho mọi luồng chat (góp ý, tra cứu...) — 1 user chỉ ở 1 luồng/state tại 1 thời điểm.
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

module.exports = { setState, getState, clearState };
