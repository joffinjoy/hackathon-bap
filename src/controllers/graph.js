'use strict'
const { internalRequests } = require('@helpers/requests')
const { responses } = require('@helpers/responses')

const recomputeRecommendations = async (req, res) => {
	try {
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_TRIGGER_RECOMPUTATION,
		})
		if (response.status) responses.success(res, 'Recommendations Recomputed Successfully')
		else responses.failBad(res, 'Recommendations Recomputation Failed')
	} catch (err) {
		console.log(err)
	}
}

const recomputeContentRecommendations = async (req, res) => {
	try {
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_TRIGGER_CONTENT_RECOMPUTATION,
		})
		if (response.status) responses.success(res, 'Recommendations Recomputed Successfully')
		else responses.failBad(res, 'Recommendations Recomputation Failed')
	} catch (err) {
		console.log(err)
	}
}

const setUniqueConstraints = async (req, res) => {
	try {
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_SET_UNIQUE_CONSTRAINTS,
		})
		if (response.status) responses.success(res, 'Setting Unique Constraints Successful')
		else responses.failBad(res, 'Setting Unique Constraints Failed')
	} catch (err) {
		console.log(err)
	}
}

const graphController = {
	recomputeRecommendations,
	setUniqueConstraints,
	recomputeContentRecommendations,
}

module.exports = graphController
