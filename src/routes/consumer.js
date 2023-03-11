'use strict'
const router = require('express').Router()
const consumerController = require('@controllers/consumer')
const { tokenVerifier } = require('@middlewares/tokenVerifier')

router.use(tokenVerifier)
router.get('/get-confirmed-list', consumerController.getConfirmedList)
router.post('/mark-attendance-completed', consumerController.markAttendanceCompleted)
router.post('/get-recommendations', consumerController.getRecommendations)

module.exports = router
