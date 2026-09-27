// Chặn chèn truy vấn MongoDB (NoSQL injection).
// Express tự gom ?assignedTo[$ne]=null thành object { $ne: null }; nếu giá trị đó đi thẳng vào
// điều kiện find() thì người dùng tự viết được truy vấn (VD lấy phản ánh không thuộc quyền mình).
// Middleware này loại mọi khoá bắt đầu bằng "$" hoặc có dấu "." trong query / body / params.
const BAD_KEY = /^\$|\./;
const MAX_DEPTH = 6;

// Trả về số khoá đã loại bên trong obj (kể cả các cấp con)
function scrub(obj, where, req, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > MAX_DEPTH) return 0;
  let removed = 0;
  for (const key of Object.keys(obj)) {
    if (BAD_KEY.test(key)) {
      delete obj[key];
      removed++;
      console.warn(`[Sanitize] Bỏ khoá nguy hiểm "${key}" trong ${where} — ${req.method} ${req.path}`);
      continue;
    }
    const value = obj[key];
    const removedInside = scrub(value, where, req, depth + 1);
    removed += removedInside;
    // ?assignedTo[$ne]=null còn để lại assignedTo: {} — object rỗng vì vừa bị loại toán tử
    // thì bỏ luôn cả khoá, đừng để nó đi vào điều kiện truy vấn.
    if (removedInside && value && typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length) {
      delete obj[key];
    }
  }
  return removed;
}

module.exports = (req, res, next) => {
  // req.query của Express 4 sửa tại chỗ được; không gán lại object mới để tránh vỡ getter
  scrub(req.query, 'query', req);
  scrub(req.body, 'body', req);
  scrub(req.params, 'params', req);
  next();
};
