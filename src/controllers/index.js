'use strict'
const { itemAttendanceQueries } = require('@database/storage/itemAttendance/queries')
const { itemQueries } = require('@database/storage/item/queries')
const { internalRequests } = require('@helpers/requests')
const rfdc = require('rfdc')()

exports.getConfirmedList = async (req, res) => {
	try {
		const userId = req.user.id
		const itemAttendances = await itemAttendanceQueries.findByUserMongoId(userId)
		const attendances = await Promise.all(
			itemAttendances.map(async (itemAttendance) => {
				const item = await itemQueries.findById(itemAttendance.itemMongoId)
				return {
					orderId: itemAttendance.orderId,
					type: itemAttendance.type,
					details: JSON.parse(item.details),
					status: itemAttendance.status,
					joinLink: itemAttendance.joinLink,
				}
			})
		)
		res.status(200).json({
			status: true,
			message: 'Fetched Confirmed List',
			data: attendances,
		})
	} catch (err) {
		console.log(err)
	}
}

exports.markAttendanceCompleted = async (req, res) => {
	const failedRes = (message) => res.status(400).json({ status: false, message })
	try {
		const userId = req.user.id
		const orderId = req.body.orderId
		const rating = req.body.rating
		console.log(userId)
		console.log(orderId)
		const itemAttendance = await itemAttendanceQueries.findOne({ orderId, userMongoId: userId })
		if (!itemAttendance) return failedRes('Attendance Not Found')
		const updatedAttendance = await itemAttendanceQueries.setAsCompleted(orderId, rating)
		const item = await itemQueries.findById(itemAttendance.itemMongoId)
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_ADD_RATING,
			body: {
				userId,
				itemId: item.itemId,
				rating,
			},
		})
		console.log(response)
		if (!response.status) throw 'Neo4j Item Injection Failed'
		res.status(200).json({
			status: true,
			message: `Recommendations For User ${userId} Retrieved`,
			data: updatedAttendance,
		})
	} catch (err) {
		console.log(err)
	}
}

exports.getRecommendations = async (req, res) => {
	const failedRes = (message) => res.status(400).json({ status: false, message })
	try {
		const userId = req.user.id
		const type = req.body.type
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_GET_RECOMMENDATIONS,
			body: {
				userId,
			},
		})
		if (!response.status) failedRes('Something Went Wrong!')
		const recommendedItems = response.data
		const items = await Promise.all(
			recommendedItems.map(async (item) => {
				const itemDoc = await itemQueries.findByItemId(item.itemId)
				return JSON.parse(itemDoc.details)
			})
		)
		let recommendations
		let listName
		if (type === 'session') {
			recommendations = items
			listName = 'sessions'
		} else {
			listName = 'mentors'
			const mentorMap = new Map()
			items.map((item) => {
				const mentorId = item.mentor.id
				const itemCopy = rfdc(item)
				delete itemCopy.mentor
				const mentor = mentorMap.get(mentorId)
				if (!mentor) mentorMap.set(item.mentor.id, { mentor: item.mentor, slots: [itemCopy] })
				else {
					const slots = mentor.slots
					slots.push(itemCopy)
					mentorMap.set(item.mentor.id, { mentor: item.mentor, slots })
				}
			})
			recommendations = Array.from(mentorMap.values())
		}
		res.status(200).json({
			status: true,
			message: 'Recommendations For ' + userId,
			data: { count: recommendations.length, [`${listName}`]: recommendations },
		})
	} catch (err) {
		console.log(err)
	}
}

exports.triggerProjectionAndKNN = async (req, res) => {
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

exports.setUniqueConstraints = async (req, res) => {
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
