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
  try {
    const res = await zaloPost(
      'https://openapi.zalo.me/v2.0/oa/message',
      {
        recipient: { user_id: String(userId) },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text,
              buttons: buttons.map(b => ({
                title: b.title,
                type: 'oa.query.show',
                payload: b.payload || b.title,
              })),
            },
          },
        },
      }
    );
    if (res.data?.error !== 0) {
      console.error('[Zalo] Lỗi gửi button, fallback text:', res.data);
      const btnLabels = buttons.map(b => `• ${b.title}`).join('\n');
      await sendZaloText(userId, `${text}\n\n${btnLabels}`);
    }
  } catch (err) {
    console.error('[Zalo] Gửi button thất bại, fallback text:', err.message);
    const btnLabels = buttons.map(b => `• ${b.title}`).join('\n');
    await sendZaloText(userId, `${text}\n\n${btnLabels}`);
  }
}

async function sendZaloGroupText(text) {
  const groupId = CONFIG.ZALO_GROUP_ID;
  if (!groupId) {
    console.warn('[Zalo] ZALO_GROUP_ID chưa được cấu hình, bỏ qua gửi nhóm.');
    return;
  }
  try {
    const res = await zaloPost(
      'https://openapi.zalo.me/v2.0/oa/message',
      { recipient: { group_id: String(groupId) }, message: { text } }
    );
    if (res.data?.error !== 0) console.error('[Zalo] Lỗi gửi tin nhóm:', res.data);
  } catch (err) {
    console.error('[Zalo] Gửi tin nhóm thất bại:', err.message);
  }
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

module.exports = { sendZaloText, sendZaloButtons, sendZaloGroupText, getZaloUserProfile, uploadImageBufferToZalo };
