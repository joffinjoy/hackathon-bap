'use strict'

const { signup, addProfile } = require('./generateUserAccount')
const { getSessions } = require('./getSessions')
const { confirmSession } = require('./confirmSession')
const { markCompleted } = require('./markCompleted')
const { faker } = require('@faker-js/faker')

const getRandomNumber = (min, max) => Math.floor(Math.random() * max) + min

const shuffleArray = async (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

const generateUserNames = async (count) => {
	try {
		const mentorSet = new Set()
		do {
			mentorSet.add(faker.name.fullName())
		} while (mentorSet.size !== count)
		return Array.from(mentorSet)
	} catch (err) {
		console.log(err)
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

const generateBAPData = async () => {
	try {
		for (let i = 1; i <= 10; i++) {
			console.log('I: ', i)
			const sessions = await getSessions({
				sessionTitle: 'ClusterNumber' + i,
				type: 'session',
			})

			const userCountForCluster = 10 //getRandomNumber(15, 30)
			const userNames = await generateUserNames(userCountForCluster)

			for (let j = 0; j < userCountForCluster; j++) {
				const enrollmentCountForThisUser = 5 //getRandomNumber(5, 10)
				const user = await signup({
					email: userNames[j].toLowerCase().replace(/[^a-zA-Z]+/g, '') + i + '@shikshalokam.org',
					password: 'password',
				})
				const accessToken = user.accessToken
				await addProfile(accessToken, {
					name: userNames[j],
					phone: '9895000000',
				})
				const shuffledSessions = await shuffleArray(sessions)
				for (let k = 0; k < enrollmentCountForThisUser; k++) {
					const session = shuffledSessions[k]
					const itemId = session.item.id
					const fulfillmentId = session.fulfillment.id
					const confirm = await confirmSession(accessToken, {
						itemId,
						fulfillmentId,
						type: 'session',
					})
					await sleep(1000)
					const orderId = confirm.fulfillment.orderId
					const completed = await markCompleted(accessToken, {
						orderId,
						rating: getRandomNumber(1, 5),
					})
					console.log(completed)
				}
			}
		}
	} catch (err) {
		console.log(err)
	}
}

generateBAPData()
