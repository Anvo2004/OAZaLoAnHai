const axios = require('axios');
const { getToken, refreshAccessToken } = require('./zaloToken');
const CONFIG = require('../config');

async function zaloPost(url, data) {
  const doRequest = (token) =>
    axios.post(url, data, {
      headers: { access_token: token, 'Content-Type': 'application/json' },
    });

  let res = await doRequest(getToken());

  if (res.data?.error === -216) {
    console.warn('[ZaloToken] Token hết hạn, đang refresh...');
    const newToken = await refreshAccessToken();
    res = await doRequest(newToken);
  }

  return res;
}

async function sendZaloText(userId, text) {
  try {
    const res = await zaloPost(
      'https://openapi.zalo.me/v2.0/oa/message',
      { recipient: { user_id: String(userId) }, message: { text } }
    );
    if (res.data?.error !== 0) console.error('[Zalo] Lỗi gửi tin:', res.data);
  } catch (err) {
    console.error('[Zalo] Gửi tin thất bại:', err.message);
  }
}

async function uploadImageBufferToZalo(buffer, filename) {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', buffer, { filename: filename || 'image.jpg', contentType: 'image/jpeg' });

  const doUpload = (token) =>
    axios.post('https://openapi.zalo.me/v2.0/oa/upload/image', form, {
      headers: { ...form.getHeaders(), access_token: token },
    });

  let res = await doUpload(getToken());

  if (res.data?.error === -216) {
    const newToken = await refreshAccessToken();
    res = await doUpload(newToken);
  }

  if (res.data?.error !== 0) throw new Error(`Upload ảnh thất bại: ${res.data?.message}`);
  const attachmentId = res.data?.data?.attachment_id;
  if (!attachmentId) throw new Error('Không lấy được attachment_id từ Zalo');
  return attachmentId;
}

async function sendZaloButtons(userId, text, buttons) {
  const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
  const btnLabels = buttons.map((b, i) => `${numbers[i]} ${b.title}`).join('\n');
  await sendZaloText(userId, `${text}\n\n${btnLabels}`);
}

// Gửi tin vào nhóm Zalo cụ thể (theo groupId)
// mentions: [{ user_id, display_name, pos, len }] — dùng khi muốn @mention thành viên
async function sendZaloToGroup(text, groupId, mentions = []) {
  const targetId = groupId || CONFIG.ZALO_GROUP_ID;
  if (!targetId) {
    console.warn('[Zalo] Không có groupId, bỏ qua gửi nhóm.');
    return;
  }
  try {
    const message = mentions.length > 0 ? { text, mentions } : { text };
    const res = await zaloPost(
      'https://openapi.zalo.me/v2.0/oa/message',
      { recipient: { group_id: String(targetId) }, message }
    );
    if (res.data?.error !== 0) console.error('[Zalo] Lỗi gửi tin nhóm:', res.data);
  } catch (err) {
    console.error('[Zalo] Gửi tin nhóm thất bại:', err.message);
  }
}

// Tương thích ngược — gửi vào nhóm mặc định
async function sendZaloGroupText(text) {
  return sendZaloToGroup(text, CONFIG.ZALO_GROUP_ID);
}

async function getZaloUserProfile(userId) {
  try {
    const token = getToken();
    const res = await axios.get(
      `https://openapi.zalo.me/v2.0/oa/getprofile?data=${encodeURIComponent(JSON.stringify({ user_id: String(userId) }))}`,
      { headers: { access_token: token } }
    );
    if (res.data?.error === 0) return res.data.data;
    return null;
  } catch (err) {
    console.error('[Zalo] Lấy profile thất bại:', err.message);
    return null;
  }
}

// Lấy danh sách thành viên nhóm Zalo — trả về { members, raw } để debug
async function getZaloGroupMembers(groupId) {
  try {
    const token = getToken();
    const params = JSON.stringify({ group_id: String(groupId), offset: 0, count: 50 });
    const res = await axios.get(
      `https://openapi.zalo.me/v2.0/oa/groupchat/getmember?data=${encodeURIComponent(params)}`,
      { headers: { access_token: token } }
    );

    console.log('[Zalo] getGroupMembers raw response:', JSON.stringify(res.data));

    if (res.data?.error !== 0) {
      console.error('[Zalo] getGroupMembers lỗi API:', res.data?.error, res.data?.message);
      return { members: [], raw: res.data };
    }

    const d = res.data.data;
    // Zalo có thể trả về members tại data.members hoặc trực tiếp data là array
    const members = Array.isArray(d) ? d
      : Array.isArray(d?.members) ? d.members
      : [];

    console.log(`[Zalo] getGroupMembers groupId=${groupId} => ${members.length} thành viên`);
    return { members, raw: res.data };
  } catch (err) {
    console.error('[Zalo] getGroupMembers thất bại:', err.message);
    return { members: [], raw: { error: -1, message: err.message } };
  }
}

module.exports = {
  sendZaloText,
  sendZaloButtons,
  sendZaloToGroup,
  sendZaloGroupText,
  getZaloUserProfile,
  uploadImageBufferToZalo,
  getZaloGroupMembers,
};
