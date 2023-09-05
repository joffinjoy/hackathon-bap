'use strict'
const { cacheGet } = require('@utils/redis')
const rfdc = require('rfdc')()

exports.searchItemListGenerator = async (transactionId, type) => {
	try {
		const itemList = await cacheGet(`SESSION_LIST:${transactionId}`)
		const items = await Promise.all(
			itemList.map(async (itemId) => {
				return await cacheGet(`SESSION:${itemId}`)
			})
		)
		if (type === 'session') {
			return items
		} else if (type === 'mentor') {
			// Iterate over each item in the 'items' array
			const mentorMap = new Map()
			items.map((item) => {
				// Extract the mentor ID from the current item
				const mentorId = item.mentor.id

				// Create a deep copy of the current item to avoid modifying the original
				const itemCopy = rfdc(item)

				// Remove the 'mentor' and 'bpp' property from the copied item
				delete itemCopy.mentor
				delete itemCopy.bpp

				// Attempt to retrieve the mentor object associated with the mentor ID from the map
				const mentor = mentorMap.get(mentorId)

				// Check if a mentor object exists for the current mentor ID
				if (!mentor) mentorMap.set(item.mentor.id, { room: item.mentor, slots: [itemCopy], bpp: item.bpp })
				else {
					// If a mentor already exists, retrieve the 'slots' array and add the itemCopy to it
					const slots = mentor.slots
					slots.push(itemCopy)
					// Update the mentor's entry in the map with the updated 'slots'
					mentorMap.set(item.mentor.id, { room: item.mentor, slots, bpp: item.bpp })
				}
			})
			// Convert the values of the mentorMap into an array and return it
			return Array.from(mentorMap.values())
		}
	} catch (err) {
		console.log(err)
	}
}
