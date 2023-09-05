'use strict'

const { cacheSave, cacheGet } = require('@utils/redis')
const { internalRequests } = require('@helpers/requests')
const { itemQueries } = require('@database/storage/item/queries')

const categoriesFlattener = (categories) => {
	return categories.map((category) => {
		return {
			id: category.id.replace(/ /g, '-').toLowerCase(),
			name: category.descriptor.name,
		}
	})
}

const fulfillmentsFlattener = (fulfillments) => {
	return fulfillments.map((fulfillment) => {
		const flattenedFulfillment = {
			id: fulfillment.id,
			startTime: fulfillment.time.range.start,
			endTime: fulfillment.time.range.end,
			// language: fulfillment.language,
			// type: fulfillment.type,
			// status: fulfillment.tags[0].list[0].descriptor.name,
			mentor: {
				id: fulfillment.agent.person.id,
				name: fulfillment.agent.person.name,
				state: fulfillment.agent.person.state,
				capacity: fulfillment.agent.person.capacity,
				description: fulfillment.agent.person.description,
				facilities:  fulfillment.agent.person.facilities,
				institute:  fulfillment.agent.person.institute
			},
		}
		for (const tag of fulfillment.tags) {
			flattenedFulfillment[`${tag.descriptor.name}`] = tag.list[0].descriptor.name
		}
		// if (fulfillment.customer) {
		// 	flattenedFulfillment.customer = fulfillment.customer
		// }
		return flattenedFulfillment
	})
}

function getRandomImageURL() {
	const baseUrl = 'https://raw.githubusercontent.com/VISHNUDAS-tunerlabs/karmayogi-room-images/master/rooms/';
	const randomNumber = Math.floor(Math.random() * 91) + 1; // Generates a random number between 1 and 91
	const fileName = `File ${randomNumber}.png`;
	return baseUrl + encodeURIComponent(fileName);
}
  
  

const catalogHandler = async (providers, transactionId, bppMongoId) => {
	try {
		for (const provider of providers) {
			// const categories = categoriesFlattener(provider.categories)
			const fulfillments = fulfillmentsFlattener(provider.fulfillments)
			// const providerInfo = {
			// 	id: provider.id,
			// 	code: provider.descriptor.code,
			// 	name: provider.descriptor.name,
			// }
			const randomImageURL = getRandomImageURL();
			for (const item of provider.items) {
				const itemId = item.id
				// Sample bpp object
				const bppMeta = {
					one: { id: 'K-BPP-1', code: 'K-BPP-1' },
					two: { id: 'K-BPP-2', code: 'K-BPP-2' }
				};
				// Randomly select either bpp.one or bpp.two
				const randomKey = Math.random() < 0.5 ? 'one' : 'two';
				const bppInfo = bppMeta[randomKey]
				// const categoryIds = item.category_ids.map((categoryId) => {
				// 	return categoryId.replace(/ /g, '-').toLowerCase()
				// })
				// const itemCategories = categories.filter((category) => categoryIds.includes(category.id))
				const fulfillmentId = item.fulfillment_ids[0]
				// const sessionImage = item.descriptor.images[0].url
				// const sessionTitle = item.descriptor.name
				// const sessionDescription = item.descriptor.short_desc
				// const sessionPrice = item.price.value
				// const recommendedFor = item.tags[0].list.map((menteeType) => {
				// 	return menteeType.descriptor
				// })
				const itemFulfillment = fulfillments.find((fulfillment) => fulfillment.id === fulfillmentId)
				const mentorInfo = {
					// id: itemFulfillment.mentor.id,
					// name: itemFulfillment.mentor.name,
					// name: itemFulfillment.mentor.name,
					id: itemFulfillment.mentor.id,
					name: itemFulfillment.mentor.name,
					state: itemFulfillment.mentor.state,
					capacity: itemFulfillment.mentor.capacity,
					description: itemFulfillment.mentor.description,
					facilities:  itemFulfillment.mentor.facilities,
					institute:  itemFulfillment.mentor.institute,
					image: randomImageURL
					// aboutMentor: item.tags[1].list[0].descriptor.name,
					// professionalExperience: item.tags[2].list[0].descriptor.name,
					// qualification: item.tags[3].list[0].descriptor.name,
					// experience: item.tags[4].list[0].descriptor.name,
					// totalMeetings: item.tags[5].list[0].descriptor.name,
					// specialistIn: item.tags[6].list[0].descriptor.name,
				}

				delete itemFulfillment.mentor
				const session = {
					item: {
						id: itemId,
						// image: sessionImage,
						// title: sessionTitle,
						// description: sessionDescription,
						// price: sessionPrice,
					},
					// recommendedFor,
					// categories: itemCategories,
					mentor: mentorInfo,
					// provider: providerInfo,
					fulfillment: itemFulfillment,
					bpp: bppInfo
				}
				if (itemFulfillment.customer) {
					session.customer = itemFulfillment.customer
					delete session.fulfillment.customer
				}
				await cacheSave(`SESSION:${itemId}`, session)
				
				// const response = await internalRequests.recommendationPOST({
				// 	route: process.env.RECOMMENDATION_ADD_ITEM,
				// 	body: {
				// 		payload: session,
				// 	},
				// })
				const { storedItem } = await itemQueries.findOrCreate({
					where: { itemId },
					defaults: { details: JSON.stringify(session), bppMongoId },
				})
				// if (!response.status) throw 'Neo4j Item Injection Failed'
				await cacheSave(`SESSION:BPP_ID:${itemId}`, bppMongoId)
				const sessionsList = await cacheGet(`SESSION_LIST:${transactionId}`)
				if (!sessionsList) await cacheSave(`SESSION_LIST:${transactionId}`, [itemId])
				else {
					if (!sessionsList.includes(itemId)) {
						sessionsList.push(itemId)
					}
					await cacheSave(`SESSION_LIST:${transactionId}`, sessionsList)
				}
			}
		}
		console.log(`SESSION_LIST:${transactionId}`, await cacheGet(`SESSION_LIST:${transactionId}`))
		return true
	} catch (err) {
		console.log(err)
		return false
	}
}

exports.catalogService = {
	catalogHandler,
	fulfillmentsFlattener,
}
