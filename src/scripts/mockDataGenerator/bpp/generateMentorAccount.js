'use strict'
const axios = require('axios')
const qs = require('qs')

const config = {
	method: 'post',
	maxBodyLength: Infinity,
	headers: {
		'Content-Type': 'application/json',
	},
}

exports.generateMentorAccount = async (data) => {
	try {
		config.url = 'https://dev.elevate-apis.shikshalokam.org/dsep-user/v1/account/create'
		config.headers['Content-Type'] = 'application/json'
		config.data = JSON.stringify(data)
		//console.log(config)
		const response = await axios(config)
		//console.log(response.data.result)
		return response.data.result
	} catch (err) {
		console.log(JSON.stringify(err, null, 4))
	}
}

exports.loginMentorAccount = async (data) => {
	try {
		config.url = 'https://dev.elevate-apis.shikshalokam.org/dsep-user/v1/account/login'
		config.data = qs.stringify(data)
		config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
		//console.log(config)
		const response = await axios(config)
		return response.data.result
	} catch (err) {
		console.log(err)
	}
}

/* exports.loginMentorAccount({
	email: 'hackathonMentor@shikshalokam.org',
	password: 'testing',
}) */

/* var data = JSON.stringify({
	name: 'joffin Mentor Seventeen',
	email: 'joffinMentorSeventeen@tunerlabs.com',
	password: 'testing',
	isAMentor: true,
	secretCode: '4567',
	otp: '319044',
	organisationId: '63f3b47e62820fd9e6be9ecc',
}) */

/* var axios = require('axios')
var qs = require('qs')
var data = qs.stringify({
	email: 'joffin4@tunerlabs.com',
	password: 'testing',
})
var config = {
	method: 'post',
	maxBodyLength: Infinity,
	url: 'http://localhost:3001/user/v1/account/login',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
	},
	data: data,
}

axios(config)
	.then(function (response) {
		console.log(JSON.stringify(response.data))
	})
	.catch(function (error) {
		console.log(error)
	})
 */
