const router = require('express').Router()
const requireAuth = require('../middleware/requireAuth')
const authRoutes = require('./auth')
const statsRoutes = require('./stats')
const feedbackRoutes = require('./feedbacks')
const userRoutes = require('./users')

router.use('/auth', authRoutes)

router.use(requireAuth)
router.use('/stats', statsRoutes)
router.use('/feedbacks', feedbackRoutes)
router.use('/users', userRoutes)

module.exports = router
