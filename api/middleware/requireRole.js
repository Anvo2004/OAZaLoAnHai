module.exports = (...roles) => (req, res, next) => {
  if (roles.includes(req.session.adminUser?.role)) return next()
  res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này' })
}
