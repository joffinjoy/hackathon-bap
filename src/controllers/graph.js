'use strict'
const { internalRequests } = require('@helpers/requests')

const recomputeRecommendations = async (req, res) => {
	const failedRes = () => res.status(400).json({ status: false, message: 'Profile Creation Failed' })
	try {
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_TRIGGER_PROJECTION_KNN,
		})
		res.status(200).json({
			status: true,
			message: 'Request Success',
			data: response.data,
		})
	} catch (err) {
		failedRes('Something Went Wrong')
		console.log(err)
	}
}

const setUniqueConstraints = async (req, res) => {
	const failedRes = () => res.status(400).json({ status: false, message: 'Profile Creation Failed' })
	try {
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_SET_UNIQUE_CONSTRAINTS,
		})
		res.status(200).json({
			status: true,
			message: 'Request Success',
			data: response.data,
		})
	} catch (err) {
		failedRes('Something Went Wrong')
		console.log(err)
	}
}

const graphController = {
	recomputeRecommendations,
	setUniqueConstraints,
}

module.exports = graphController
