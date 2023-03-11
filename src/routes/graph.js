'use strict'
const router = require('express').Router()
const graphController = require('@controllers/graph')

router.post('/recompute-recommendations', graphController.recomputeRecommendations)
router.post('/set-unique-constraints', graphController.setUniqueConstraints)

module.exports = router
