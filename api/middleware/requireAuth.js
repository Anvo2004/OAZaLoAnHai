module.exports = (req, res, next) => {
  if (req.session && req.session.adminUser) return next()
  res.status(401).json({ error: 'Chưa đăng nhập' })
}
