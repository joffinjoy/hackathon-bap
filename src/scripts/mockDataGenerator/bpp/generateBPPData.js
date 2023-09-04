'use strict'
const { generateMentorAccount, loginMentorAccount } = require('./generateMentorAccount')
const { generateOrganization } = require('./generateOrganization')
const { generateSession } = require('./generateSession')
const { faker } = require('@faker-js/faker')
const { sessionTitles } = require('./sessionTitles')
const crypto = require('crypto')

const generateMentorNames = () => {
	try {
		/* const count = 42
		const mentorSet = new Set()
		let i = 0
		do {
			i++
			mentorSet.add(faker.name.fullName())
		} while (mentorSet.size !== count)
		return Array.from(mentorSet) */
		return [
			'Academic Commons',
			'Ethics Library',
			'Philosophy Forum',
			'Economics Lecture Hall',
			'Academic Excellence Center',
			'Leadership Institute',
			'Career Development Center',
			'Alumni Lounge',
			'Graduation Auditorium',
			'Thesis Presentation Room',
			'Quiet Study Zone',
			'Grad Student Hub',
			'Exam Proctoring Center',
			'Peer Tutoring Lab',
			'History Archive',
			'Math Society Room',
			'Science Discovery Lab',
			'Writing Support Center',
			'Art Studio Workshop',
			'Music Recital Hall',
			'Drama Performance Stage',
			'Biology Ecology Lab',
			'Chemistry Materials Lab',
			'Astronomy Galaxy Room',
			'Theater Costume Studio',
			'Psychology Research Lab',
			'Sociology Discussion Room',
			'Debate Practice Hall',
			'Robotics Development Lab',
			'Research Collaboration Space',
			'Innovation Hub',
			'Ethics Roundtable',
			'Philosophy Seminar Space',
			'Economics Policy Center',
			'Academic Advising Lounge',
			'Leadership Training Room',
			'Career Coaching Office',
			'Alumni Networking Lounge',
			'Graduation Ceremony Hall',
			'Thesis Review Chamber',
			'Silent Study Zone',
			'Grad Student Hangout',
			'Exam Assistance Room',
			'Peer Tutoring Hub',
			'History Research Archive',
			'Math Problem-Solving Room',
			'Science Exploration Hub',
			'Writing Assistance Center',
			'Art Studio Gallery',
			'Music Practice Studio',
			'Drama Rehearsal Space',
			'Biology Lab Discovery',
			'Chemistry Lab Innovations',
			'Astronomy Observation Room',
			'Theater Design Studio',
			'Psychology Counseling Suite',
			'Sociology Research Lounge',
			'Debate Club Meeting Room',
			'Robotics Workshop',
			'Research Collaboration Hub',
			'Innovation Workshop',
			'Ethics Lecture Hall',
			'Philosophy Discussion Room',
			'Economics Research Space',
			'Academic Success Room',
			'Leadership Development Space',
			'Career Advancement Center',
			'Alumni Engagement Space',
			'Graduation Planning Office',
			'Thesis Presentation Chamber',
			'Silent Study Retreat',
			'Grad Student Collaboration Space',
			'Exam Preparation Zone',
			'Peer Tutoring Lounge',
			'History Symposium Room',
			'Math Society Meeting Space',
			'Science Lab Inquiry',
			'Writing Workshop',
			'Creative Writing Studio',
			'Art Studio Gallery',
		]
	} catch (err) {
		console.log(err)
	}
}

const generateCategoryNames = () => {
	try {
		const firstOptions = [
			'Academic',
			'Educational',
			'Co-curricular',
			'Administrative',
			'Financial',
			'Office',
			'Infrastructure',
		]
		const secondOptions = [
			'Leadership',
			'Improvement',
			'Activities',
			'Management',
			'Training',
			'Analysis',
			'Research',
		]
		const count = 40
		const categorySet = new Set()
		let i = 0
		do {
			i++
			const first = faker.helpers.arrayElement(firstOptions)
			const second = faker.helpers.arrayElement(secondOptions)
			categorySet.add(`${first} ${second}`)
		} while (categorySet.size !== count)
		return Array.from(categorySet)
	} catch (err) {
		console.log(err)
	}
}

const generateOrganizationNames = () => {
	try {
		const options = ['Drishti', 'Aakash', 'FIITJEE', 'Allen', 'Taj', 'NITC', 'IITB', 'EduMentor']
		const count = 8
		const organizationSet = new Set()
		let i = 0
		do {
			i++
			organizationSet.add(faker.helpers.arrayElement(options))
		} while (organizationSet.size !== count)
		return Array.from(organizationSet)
	} catch (err) {
		console.log(err)
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

const timeSlots = [
	{
		startDate: 1694403000, //9:00 AM IST March 1st
		endDate: 1694406600, //10:00 AM IST March 1st
	},
	{
		startDate: 1694406600, //10:00 AM IST March 1st
		endDate: 1694410200, //11:00 AM IST March 1st
	},
	{
		startDate: 1694514600, //4:00 PM IST March 2nd
		endDate: 1694518200, //5:00 PM IST March 2nd
	},
	{
		startDate: 1694518200, //5:00 PM IST March 2nd
		endDate: 1694521800, //6:00 PM IST March 2nd
	},
	{
		startDate: 1694593800, //2:00 PM IST March 3rd
		endDate: 1694597400, //3:00 PM IST March 3rd
	},
]

const generateBPPData = async () => {
	try {
		const initialMentorAccount = await loginMentorAccount({
			email: 'hackathonMentor@shikshalokam.org',
			password: 'testing',
		})
		const initialAccessToken = initialMentorAccount.access_token
		const mentorNames = generateMentorNames() // Assuming generateMentorNames() returns an array of mentor names
		const categoryNames = generateCategoryNames() // Assuming generateCategoryNames() returns an array of category names
		const organizations = generateOrganizationNames() // Assuming generateOrganizationNames() returns an array of organization names

		let organizationNameIndex = 0
		let mentorNameIndex = 0
		let categoryNameIndex = 0
		let timeSlotIndex = 0
		let access_token = initialAccessToken
		let mentor = null

		let category
		let organisation
		for (let i = 0; i < 400; i++) {
			// Create 400 sessions
			console.log('i: ', i)
			if (i % 50 === 0) {
				// Create 8 organizations
				organisation = await generateOrganization(access_token, {
					name: organizations[organizationNameIndex],
					code: crypto.randomUUID().replace(/-/g, ''),
					description: organizations[organizationNameIndex] + 'Description',
				})
				++organizationNameIndex
			}
			if (i % 5 === 0) {
				// Create 80 mentors
				timeSlotIndex = 0
				mentor = await generateMentorAccount({
					name: mentorNames[mentorNameIndex].replace(/[^a-zA-Z\s ]+/g, ''),
					email:
						mentorNames[mentorNameIndex].toLowerCase().replace(/[^a-zA-Z]+/g, '') +
						`@${organizations[organizationNameIndex - 1].toLowerCase()}.com`,
					password: 'hackathonpassword',
					isAMentor: true,
					secretCode: '4567',
					otp: '319044',
					organisationId: organisation.id,
				})
				access_token = mentor.access_token
				++mentorNameIndex
			}
			if (i % 10 === 0) {
				// Create 40 categories
				category = {
					value: categoryNames[categoryNameIndex],
					label: categoryNames[categoryNameIndex],
				}
				++categoryNameIndex
			}

			await generateSession(access_token, {
				title: `Karmayogi Room Slot TEST 200`,
				description: `Karmayogi Room Slot TEST 200`,
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
		}
	} catch (err) {
		console.log(err)
	}
}

generateBPPData()
