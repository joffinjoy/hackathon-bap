'use strict'
const crypto = require('crypto')
const { contextBuilder } = require('@utils/contextBuilder')
// const { searchMentorMessageDTO } = require('@dtos/searchMentorMessage')
// const { searchSessionMessageDTO } = require('@dtos/searchSessionMessage')
const { requestBodyDTO } = require('@dtos/requestBody')
const { externalRequests } = require('@helpers/requests')
const { bppQueries } = require('@database/storage/bpp/queries')
const { catalogService } = require('@services/catalog')
const { searchItemListGenerator } = require('@helpers/searchItemListGenerator')
const { searchInstituteMessageDTO } = require('@dtos/searchInstituteMessage')
const { searchRoomMessageDTO } = require('@dtos/searchRoomMessage')

exports.search = async (req, res) => {
	const failedRes = (message) => res.status(400).json({ status: false, message })
	try {
		const transactionId = crypto.randomUUID()
		const messageId = crypto.randomUUID()
		// Get either institute name or room name from request body.
		const instituteName = req.body.instituteName
		const roomName = req.body.roomName
		const date = req.body.filter.date
		// const type = req.body.type
		
		// Build context for BPP request
		const context = await contextBuilder(transactionId, messageId, process.env.SEARCH_ACTION)
		let message

		// Check required key value pairs are received from request if not retun error.
		if (!instituteName && !roomName) return failedRes('Either institute name Or room name must be provided')
		if (instituteName && roomName) return failedRes("Hybrid searching using both institute name and room names aren't currently supported")
		if (!date) return failedRes('missing date, which is mandatory for search')
		// Construct message object based on the request BAP received.
		if (instituteName) message = searchInstituteMessageDTO(instituteName, req.body.filter)
		else message = searchRoomMessageDTO(roomName, req.body.filter)

		// Create request body using context and message
		const searchRequestBody = requestBodyDTO(context, message)

		// Call BPP to get search data
		await externalRequests.dsepPOST({
			baseURL: process.env.BECKN_BG_URI,
			body: searchRequestBody,
			route: process.env.SEARCH_ROUTE,
		})
		setTimeout(async () => {
			try {
				let items
				let listName
				// if (type === 'session') {
				// 	listName = 'sessions'
				// 	items = await searchItemListGenerator(transactionId, 'session')
				// } else if (type === 'mentor') {
				// 	listName = 'mentors'
				// 	items = await searchItemListGenerator(transactionId, 'mentor')
				// }
				listName = 'rooms'
				items = await searchItemListGenerator(transactionId, 'mentor')
				res.status(200).json({
					status: true,
					message: 'Search Success',
					data: {
						count: items.length,
						[`${listName}`]: items,
					},
				})
			} catch (err) {
				console.log(err)
				return failedRes('Something Went Wrong')
			}
		}, process.env.SEARCH_MINIMUM_WAIT_TIME)
	} catch (err) {
		console.log(err)
	}
}

exports.onSearch = async (req, res) => {
	try {
		const context = req.body.context
		const bppUriFromContext = context.bpp_uri
		const bppIdFromContext = context.bpp_id
		const { bpp } = await bppQueries.findOrCreate({
			where: { bppId: bppIdFromContext },
			defaults: { bppUri: bppUriFromContext },
		})
		const transactionId = context.transaction_id
		const bppMongoId = bpp._id
		const providers = req.body.message.catalog.providers
		const isCatalogHandled = await catalogService.catalogHandler(providers, transactionId, bppMongoId, 'onSearch')
		res.status(200).json({
			status: true,
			message: 'On_Search Success',
			data: {},
		})
	} catch (err) {
		console.log(err)
	}
}
