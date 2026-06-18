const Category = require('../models/Category');
const ZaloGroupMember = require('../models/ZaloGroupMember');
const { getZaloGroupMembers } = require('../utils/zaloApi');

const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 phút

async function syncCategoryMembers(category) {
  if (!category.zaloGroupId) return 0;
  const { members } = await getZaloGroupMembers(category.zaloGroupId);
  let synced = 0;
  for (const m of members) {
    const userId = m.user_id || m.id;
    if (!userId) continue;
    await ZaloGroupMember.findOneAndUpdate(
      { zaloUserId: String(userId), categoryId: category._id },
      {
        zaloUserId: String(userId),
        displayName: m.display_name || m.name || '',
        avatar: m.avatar || '',
        categoryId: category._id,
        groupId: category.zaloGroupId,
        syncedAt: new Date(),
      },
      { upsert: true }
    );
    synced++;
  }
  return synced;
}

async function syncAllGroups() {
  const categories = await Category.find({ zaloGroupId: { $ne: '' } }).lean();
  for (const category of categories) {
    try {
      const synced = await syncCategoryMembers(category);
      console.log(`[GroupSync] ${category.name}: đồng bộ ${synced} thành viên`);
    } catch (err) {
      console.error(`[GroupSync] Lỗi đồng bộ nhóm ${category.name}:`, err.message);
    }
  }
}

function startGroupSyncSchedule() {
  setInterval(syncAllGroups, SYNC_INTERVAL_MS);
  console.log(`[GroupSync] Tự động đồng bộ thành viên nhóm mỗi ${SYNC_INTERVAL_MS / 60000} phút`);
}

module.exports = { syncCategoryMembers, syncAllGroups, startGroupSyncSchedule };
