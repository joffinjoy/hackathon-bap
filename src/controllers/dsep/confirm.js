'use strict'
const crypto = require('crypto')
const { contextBuilder } = require('@utils/contextBuilder')
const { requestBodyDTO } = require('@dtos/requestBody')
const { externalRequests } = require('@helpers/requests')
const { profileQueries } = require('@database/storage/profile/queries')
const { userQueries } = require('@database/storage/user/queries')
const { confirmMessageDTO } = require('@dtos/confirmMessage')
const { bppQueries } = require('@database/storage/bpp/queries')
const { getMessage, sendMessage, cacheGet, cacheSave, listDelete } = require('@utils/redis')
const { catalogService } = require('@services/catalog')
const { wait } = require('@utils/wait')
const { itemQueries } = require('@database/storage/item/queries')
const { itemAttendanceQueries } = require('@database/storage/itemAttendance/queries')

exports.confirm = async (req, res) => {
	const failedRes = (message) => res.status(400).json({ status: false, message })
	try {
		const transactionId = crypto.randomUUID()
		const messageId = crypto.randomUUID()
		const itemId = req.body.itemId
		const fulfillmentId = req.body.fulfillmentId
		const userId = req.user.id
		const type = req.body.type
		const context = await contextBuilder(transactionId, messageId, process.env.CONFIRM_ACTION)
		if (!itemId || !fulfillmentId) return failedRes('Either itemId Or fulfillmentId id is missing')

		const userFulfillmentBlackListId = userId + "_" +  fulfillmentId
		const userFulfillmentBlackList = await cacheGet('USER_FULLFILLMENT_BLACKLIST')

		// Check if fulfillmentId exists in the userFulfillmentBlackList array
		const isConfirmed = userFulfillmentBlackList.includes(userFulfillmentBlackListId);
		if(isConfirmed)return failedRes('User already fulfilled this item')

		const userProfile = await profileQueries.findByUserId(userId)
		const user = await userQueries.findById(userId)

		const message = confirmMessageDTO({
			itemId,
			fulfillmentId,
			name: userProfile.name,
			phone: userProfile.phone,
			email: user.email,
		})

		const initRequestBody = requestBodyDTO(context, message)
		const bppMongoId = await cacheGet(`SESSION:BPP_ID:${itemId}`)
		const bpp = await bppQueries.findById(bppMongoId)
		if (!bpp) failedRes('Bpp Not Found')
		await externalRequests.dsepPOST({
			baseURL: bpp.bppUri,
			body: initRequestBody,
			route: process.env.CONFIRM_ROUTE,
		})
		const redisMessage = await Promise.race([
			getMessage(`CONFIRM:${transactionId}`),
			wait(process.env.CALLBACK_MAXIMUM_WAIT_TIME).then(() => {
				return false
			}),
		])
		if (redisMessage !== `CONFIRM:${transactionId}`) return failedRes('Something Went Wrong')
		let fulfillment = await cacheGet(`FULFILLMENT:${transactionId}`)
		if (fulfillment && fulfillment.mentor) {
			// Replace "mentor" with "room" and remove "joinLink" from the object
			fulfillment.room = fulfillment.mentor;
			delete fulfillment.mentor;
			delete fulfillment.joinLink;
		}
		const userFulfillmentId = userId + "_" +  fulfillment.id
		await cacheSave('USER_FULLFILLMENT_BLACKLIST', [userFulfillmentId])
		
		res.status(200).json({
			status: true,
			message: 'Confirm Success',
			data: { fulfillment },
		})
		const itemDoc = await cacheGet(`SESSION:${itemId}`)
		const { item } = await itemQueries.findOrCreate({
			where: { itemId },
			defaults: { details: JSON.stringify(itemDoc), bppMongoId: bpp._id },
		})
		await itemAttendanceQueries.create({
			userMongoId: userId,
			itemMongoId: item._id,
			orderId: fulfillment.orderId,
			// joinLink: fulfillment.joinLink,
			type: type === 'mentor' ? 'mentor' : 'session',
		})
	} catch (err) {
		console.log(err)
	}
}

exports.onConfirm = async (req, res) => {
	try {
		
		const context = req.body.context
		const message = req.body.message
		const bppUriFromContext = context.bpp_uri
		const bppIdFromContext = context.bpp_id
		const bpp = await bppQueries.findOrCreate({
			where: { bppId: bppIdFromContext },
			defaults: { bppUri: bppUriFromContext },
		})
		const transactionId = context.transaction_id
		const bppId = bpp._id
		const orderId = message.order.id
		const flattenedFulfillment = await catalogService.fulfillmentsFlattener(message.order.fulfillments)
		flattenedFulfillment[0].orderId = orderId
		await cacheSave('FULLFILLMENT_BLACKLIST', [flattenedFulfillment[0].id])
		await cacheSave(`FULFILLMENT:${transactionId}`, flattenedFulfillment[0])
		await sendMessage(`CONFIRM:${transactionId}`, `CONFIRM:${transactionId}`)
		res.status(200).json({
			status: true,
			message: 'On_Select Success',
			data: {},
		})
	} catch (err) {
		console.log(err)
	}
}

exports.removeList = async (req, res) => {
	const failedRes = (message) => res.status(400).json({ status: false, message })
	const availableList = ["FULLFILLMENT_BLACKLIST", "USER_FULLFILLMENT_BLACKLIST"]
	try {
		const listKey = req.body.listName
		if(!listKey || !(availableList.includes(listKey))) {
			return failedRes('list name is missing or no list present with given name')
		}
		// Delete the list based on user input
		await listDelete(listKey)
		res.status(200).json({
			status: true,
			message: 'removeList Success',
			data: {},
		})
	} catch (err) {
		console.log(err)
	}
}
