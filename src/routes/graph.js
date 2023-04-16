'use strict'
const router = require('express').Router()
const graphController = require('@controllers/graph')

router.post('/recompute-recommendations', graphController.recomputeRecommendations)
router.post('/set-unique-constraints', graphController.setUniqueConstraints)
router.post('/recompute-content-recommendations', graphController.recomputeContentRecommendations)
router.post('/recompute-page-rank', graphController.recomputePageRank)

module.exports = router
