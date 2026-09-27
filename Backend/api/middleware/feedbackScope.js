const mongoose = require('mongoose');

// Phạm vi dữ liệu phản ánh mà 1 tài khoản được phép ĐỌC. Dùng chung cho mọi route trả dữ liệu
// (danh sách, thống kê, báo cáo, xuất Excel) để không nơi nào lộ dữ liệu ngoài quyền.
// Trả null = không giới hạn.
//   superadmin                  → toàn bộ
//   dept_leader (có categoryIds)→ danh mục phụ trách + phản ánh được giao trực tiếp
//   officer / staff             → chỉ phản ánh được giao cho mình
function feedbackScopeFilter(user) {
  if (!user) return { _id: null }; // không xác định được người dùng → không trả gì
  if (user.role === 'superadmin') return null;

  if (user.role === 'dept_leader') {
    if (!user.categoryIds?.length) return null; // chưa gán danh mục → quản lý chung
    return {
      $or: [
        { categoryId: { $in: user.categoryIds } },
        { assignedTo: user.id },
      ],
    };
  }
  return { assignedTo: user.id };
}

// Ghép bộ lọc phạm vi với bộ lọc do người dùng chọn — dùng $and để tham số trên URL
// KHÔNG BAO GIỜ ghi đè được phạm vi (lỗi cũ: filter.assignedTo = req.query.assignedTo).
function withScope(user, filter = {}) {
  const scope = feedbackScopeFilter(user);
  if (!scope) return filter;
  if (!Object.keys(filter).length) return scope;
  return { $and: [scope, filter] };
}

// Ép tham số về chuỗi ObjectId hợp lệ; sai định dạng → undefined (bỏ qua bộ lọc đó)
function asObjectId(value) {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value) ? value : undefined;
}

// Ép tham số về 1 trong các giá trị cho phép
function asEnum(value, allowed) {
  return typeof value === 'string' && allowed.includes(value) ? value : undefined;
}

module.exports = { feedbackScopeFilter, withScope, asObjectId, asEnum };
