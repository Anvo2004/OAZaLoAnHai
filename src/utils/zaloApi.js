const axios = require('axios');
const { getToken, refreshAccessToken } = require('./zaloToken');

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

module.exports = { sendZaloText, uploadImageBufferToZalo };
