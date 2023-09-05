'use strict'
const redis = require('redis')
const client = redis.createClient({
	url: process.env.REDIS_HOST,
})

client.on('error', (err) => console.log('Redis Client Error: ', err))
client.on('ready', () => console.log('Redis Client Connected'))
client.connect()


exports.cacheGet = async (key) => {
	if (key === 'FULLFILLMENT_BLACKLIST') {
		// Retrieve data as a set
		const data = await client.sMembers(key);
		// Parse the strings back to their original format
		return data.map(JSON.parse);
	} else {
		const data = await client.get(key)
		if (data) return JSON.parse(data)
		else return null
	}
}

exports.listDelete = async (key) => {
	return await client.del(key);	
}

exports.cacheSave = async (key, data) => {
	if (key === 'FULLFILLMENT_BLACKLIST') { 
			
		// Retrieve the current blacklist data (if any)
		const currentData = await client.sMembers(key);
		// Parse the strings back to their original format
		const parsedData = currentData.map(JSON.parse);
		// Combine the parsed data and the new data
		const newData = [...parsedData, ...data];
		// Remove duplicates (optional, depending on your use case)
		const uniqueData = Array.from(new Set(newData));
	
		// Update the blacklist set with the combined data
		await client.del(key); // Remove the existing set (optional)
		for (const fulfillmentId of uniqueData) {
		  await client.sAdd(key, JSON.stringify(fulfillmentId));
		}

	} else {
		// Cache other data as usual
		await client.setEx(key, 60 * 60 * 24, JSON.stringify(data));
	}
}

exports.getKeys = async (pattern) => {
	return await client.keys(pattern)
}

const getPubSubClient = async () => {
	const pubSubClient = client.duplicate()
	await pubSubClient.connect()
	return pubSubClient
}

exports.getMessage = async (channelName) => {
	const subscriberClient = await getPubSubClient()
	try {
		return await new Promise((resolve, reject) => {
			try {
				subscriberClient.subscribe(channelName, (message) => {
					resolve(message)
				})
			} catch (err) {
				reject(err)
			}
		})
	} catch (err) {
		console.log('REDIS getMessage:', err)
	} finally {
		await subscriberClient.unsubscribe(channelName)
		await subscriberClient.quit()
	}
}

exports.sendMessage = async (channelName, message) => {
	const publisherClient = await getPubSubClient()
	try {
		await publisherClient.publish(channelName, message)
	} catch (err) {
		console.log('REDIS sendMessage: ', err)
	} finally {
		await publisherClient.unsubscribe(channelName)
		await publisherClient.quit()
	}
}
