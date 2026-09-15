// Tiện ích xử lý text HTML dùng cho tính năng đăng tin (dangTinService).

const NAMED_ENTITIES = {
  nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>',
  ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bull: '•',
};

// DotNetNuke mã hoá nhiều ký tự tiếng Việt thành &#224; / &#x1EA1; — phải giải mã trước khi so trùng tiêu đề
function decodeEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

// Bỏ thẻ HTML, gộp khoảng trắng thành 1 dòng
function stripHtml(html) {
  if (!html) return '';
  return decodeEntities(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

// Như stripHtml nhưng giữ ngắt đoạn (</p>, <br>) để thân bài trên Zalo dễ đọc
function htmlToParagraphs(html) {
  if (!html) return '';
  const withBreaks = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n');
  return decodeEntities(withBreaks.replace(/<[^>]*>/g, ' '))
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + '…';
}

// Chuẩn hoá tiêu đề để chống trùng: 1 bài có thể gắn nhiều chuyên mục → nhiều link/ID khác nhau
function normalizeTitle(title) {
  return decodeEntities(title || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// So tiêu đề bài trang phường với bài có sẵn trên OA (có thể do hệ thống/người khác đăng, hoặc bị
// cắt còn 140 ký tự "…"): trùng khi bằng nhau, hoặc 1 bên là phần đầu của bên kia và đủ dài.
// KHÔNG so vài chục ký tự đầu — đã thấy khớp nhầm thật: "Đảng ủy phường An Hải công bố quyết định
// thành lập các tổ chức Đảng" ≠ "… thành lập và điều chỉnh mô hình các tổ chức Đảng".
function titlesMatch(a, b) {
  const clean = (t) => normalizeTitle(t).replace(/[“”"'‘’…]/g, '').replace(/\s+/g, ' ').trim();
  const x = clean(a);
  const y = clean(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [shorter, longer] = x.length <= y.length ? [x, y] : [y, x];
  return shorter.length >= 60 && longer.startsWith(shorter);
}

module.exports = { decodeEntities, stripHtml, htmlToParagraphs, truncate, normalizeTitle, titlesMatch };
