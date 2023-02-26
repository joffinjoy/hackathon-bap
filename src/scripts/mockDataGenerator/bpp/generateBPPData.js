'use strict'
const { generateMentorAccount, loginMentorAccount } = require('./generateMentorAccount')
const { generateOrganization } = require('./generateOrganization')
const { generateSession } = require('./generateSession')
const { faker } = require('@faker-js/faker')
const { sessionTitles } = require('./sessionTitles')
const crypto = require('crypto')

const generateMentorNames = () => {
	try {
		const count = 42
		const mentorSet = new Set()
		let i = 0
		do {
			i++
			mentorSet.add(faker.name.fullName())
		} while (mentorSet.size !== count)
		//console.log(Array.from(mentorSet))
		//console.log('i: ', i)
		return Array.from(mentorSet)
	} catch (err) {
		console.log(err)
	}
}

const generateCategoryNames = () => {
	try {
		const firstOptions = ['Academic', 'Educational', 'Co-curricular', 'Administrative', 'Financial']
		const secondOptions = ['Leadership', 'Improvement', 'Activities', 'Management']
		const count = 12
		const categorySet = new Set()
		let i = 0
		do {
			i++
			const first = faker.helpers.arrayElement(firstOptions)
			const second = faker.helpers.arrayElement(secondOptions)
			categorySet.add(`${first} ${second}`)
		} while (categorySet.size !== count)
		/* console.log(Array.from(categorySet))
		console.log('i: ', i) */
		return Array.from(categorySet)
	} catch (err) {
		console.log(err)
	}
}

const generateOrganizationNames = () => {
	try {
		const options = [
			'MentorMe',
			'EduCare',
			'LearnCo',
			'EducationPlus',
			'FutureMinds',
			'MentorLink',
			'StudentSuccess',
			'EduMentor',
			'LearningBridge',
			'AcademyNow',
			'MentorMatch',
			'SmartStart',
			'EduQuest',
			'KnowledgeCore',
			'MentorMindset',
			'TeachForward',
			'EduPilot',
			'MentorNet',
			'InspireU',
		]
		const count = 10
		const organizationSet = new Set()
		let i = 0
		do {
			i++
			organizationSet.add(faker.helpers.arrayElement(options))
		} while (organizationSet.size !== count)
		/* console.log(Array.from(organizationSet))
		console.log('i: ', i) */
		return Array.from(organizationSet)
	} catch (err) {
		console.log(err)
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

const generateBPPData = async () => {
	try {
		const initialMentorAccount = await loginMentorAccount({
			email: 'hackathonMentor@shikshalokam.org',
			password: 'testing',
		})
		const initialAccessToken = initialMentorAccount.access_token
		const mentorName = generateMentorNames()
		const categoryNames = generateCategoryNames()
		const organizations = generateOrganizationNames()

		let clusterNumber = 1
		let organizationNameIndex = 0
		let mentorNameIndex = 0
		let categoryNameIndex = 0
		let timeSlotIndex = 0
		let organisation = await generateOrganization(initialAccessToken, {
			name: organizations[organizationNameIndex],
			code: crypto.randomUUID().replace(/-/g, ''),
			description: organizations[organizationNameIndex] + 'Description',
		})
		++organizationNameIndex
		let mentor = null

		for (let i = 1; i <= 200; i++) {
			console.log('i: ', i)
			/* console.log('I: ', i)
			console.log('ORGANIZATION INDEX VALUE: ', organizationNameIndex)
			console.log()
			console.log('ORGANIZATION: ', {
				name: organizations[organizationNameIndex],
				code: crypto.randomUUID().replace(/-/g, ''),
				description: organizations[organizationNameIndex] + 'Description',
			})

			console.log('MENTOR INDEX VALUE: ', mentorNameIndex)
			console.log('MENTOR: ', {
				name: mentorName[mentorNameIndex].replace(/[^a-zA-Z\s ]+/g, ''),
				email:
					mentorName[mentorNameIndex].toLowerCase().replace(/[^a-zA-Z]+/g, '') +
					`@${organizations[organizationNameIndex].toLowerCase()}.com`,
				password: 'hackathonpassword',
				isAMentor: true,
				secretCode: '4567',
				otp: '319044',
				//organisationId: organisation.id,
			}) */

			let category = {
				value: categoryNames[categoryNameIndex],
				label: categoryNames[categoryNameIndex],
			}

			let access_token = mentor ? mentor.access_token : initialAccessToken
			if (i % 25 === 0) {
				++organizationNameIndex
				organisation = await generateOrganization(access_token, {
					name: organizations[organizationNameIndex],
					code: crypto.randomUUID().replace(/-/g, ''),
					description: organizations[organizationNameIndex] + 'Description',
				})
			}

			const timeSlots = [
				{
					startDate: 1677641400, //9:00 AM IST March 1st
					endDate: 1677645000, //10:00 AM IST March 1st
				},
				{
					startDate: 1677645000, //10:00 AM IST March 1st
					endDate: 1677648600, //11:00 AM IST March 1st
				},
				{
					startDate: 1677753000, //4:00 PM IST March 2nd
					endDate: 1677756600, //5:00 PM IST March 2nd
				},
				{
					startDate: 1677756600, //5:00 PM IST March 2nd
					endDate: 1677760200, //6:00 PM IST March 2nd
				},
				{
					startDate: 1677832200, //2:00 PM IST March 3rd
					endDate: 1677835800, //3:00 PM IST March 3rd
				},
			]

			if (i % 5 === 0) {
				timeSlotIndex = 0
				++mentorNameIndex
				mentor = await generateMentorAccount({
					name: mentorName[mentorNameIndex].replace(/[^a-zA-Z\s ]+/g, ''),
					email:
						mentorName[mentorNameIndex].toLowerCase().replace(/[^a-zA-Z]+/g, '') +
						`@${organizations[organizationNameIndex].toLowerCase()}.com`,
					password: 'hackathonpassword',
					isAMentor: true,
					secretCode: '4567',
					otp: '319044',
					organisationId: organisation.id,
				})
				access_token = mentor.access_token
			}

			if (i % 20 === 0) {
				++categoryNameIndex
				console.log('CATEGORY: ', category)
				console.log('ORGANIZATION INDEX VALUE: ', categoryNameIndex)
				category = {
					value: categoryNames[categoryNameIndex],
					label: categoryNames[categoryNameIndex],
				}
			}
			if (i % 20 === 0) {
				++clusterNumber
			}

			const session = await generateSession(access_token, {
				title: `${sessionTitles[i - 1]} ClusterNumber${clusterNumber}`,
				description: `${sessionTitles[i - 1]} ClusterNumber${clusterNumber}`,
				startDate: timeSlots[timeSlotIndex].startDate,
				endDate: timeSlots[timeSlotIndex].endDate,
				recommendedFor: [
					{
						value: 'deo',
						label: 'District education officer',
					},
				],
				categories: [category],
				medium: [
					{
						label: 'English',
						value: '1',
					},
				],
				timeZone: 'Asia/Calcutta',
				image: ['users/1232s2133sdd1-12e2dasd3123.png'],
			})
			++timeSlotIndex
			await sleep(100)
		}
		/* console.log('TIME SLOT INDEX: ', timeSlotIndex)
			console.log({
				title: `${sessionTitles[i - 1]} Cluster${clusterNumber}`,
				description: `${sessionTitles[i - 1]} Cluster${clusterNumber}`,
				startDate: timeSlots[timeSlotIndex].startDate,
				endDate: timeSlots[timeSlotIndex].endDate,
				recommendedFor: [
					{
						value: 'deo',
						label: 'District education officer',
					},
				],
				categories: [category],
				medium: [
					{
						label: 'English',
						value: '1',
					},
				],
				timeZone: 'Asia/Calcutta',
				image: ['users/1232s2133sdd1-12e2dasd3123.png'],
			}) */
	} catch (err) {
		console.log(err)
	}
}

generateBPPData()
