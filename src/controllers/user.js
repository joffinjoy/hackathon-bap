'use strict'

const { userQueries } = require('@database/storage/user/queries')
const { profileQueries } = require('@database/storage/profile/queries')
const authentication = require('@utils/authentication')
const { internalRequests } = require('@helpers/requests')

exports.login = async (req, res) => {
	const errorResponse = () => res.status(401).json({ status: false, message: 'Authentication Failure' })
	try {
		const email = req.body.email
		const password = req.body.password
		const user = await userQueries.findByEmail(email)
		if (!user) return errorResponse()
		const isValidPassword = await authentication.verifyPassword(password, user.hash, user.salt)
		if (!isValidPassword) return errorResponse()
		const jwtTokens = await authentication.generateJWTs(user)
		if (!jwtTokens) return errorResponse()
		res.status(200).json({
			status: true,
			message: 'Login Successful',
			data: {
				email: user.email,
				accessToken: jwtTokens.accessToken,
				expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
			},
		})
	} catch (err) {
		errorResponse()
		console.log(err)
	}
}

exports.signup = async (req, res) => {
	const emailAlreadyExistsRes = () => res.status(400).json({ status: false, message: 'Email Id Already Exists' })
	const signUpFailedRes = () => res.status(400).json({ status: false, message: 'SignUp Failed' })
	try {
		const email = req.body.email
		const password = req.body.password
		console.log('EMAIL: ', email)
		console.log('PASSWORD: ', password)
		if (await userQueries.findByEmail(email)) return emailAlreadyExistsRes()
		const { salt, hash } = await authentication.generateHashAndSalt(password)
		const user = await userQueries.create(email, hash, salt)
		const jwtTokens = await authentication.generateJWTs(user)
		if (!jwtTokens) {
			await userQueries.deleteOne(user)
			return signUpFailedRes()
		}
		res.status(200).json({
			status: true,
			message: 'SignUp Successful',
			data: {
				email: user.email,
				accessToken: jwtTokens.accessToken,
				expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
			},
		})
	} catch (err) {
		console.log(err)
	}
}

exports.addProfile = async (req, res) => {
	const failedRes = () => res.status(400).json({ status: false, message: 'Profile Creation Failed' })
	try {
		const userId = req.user.id
		const user = await userQueries.findById(userId)
		const email = user.email
		const name = req.body.name
		const phone = req.body.phone
		const newProfile = await profileQueries.updateOrCreateOne(userId, { name, phone })
		if (!newProfile) return failedRes()
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_ADD_USER,
			body: {
				userId,
				email,
				phone,
				name,
			},
		})
		if (!response.status) return failedRes()
		res.status(200).json({
			status: true,
			message: 'Profile Created Successfully',
			data: newProfile,
		})
	} catch (err) {
		console.log(err)
		failedRes()
	}
}

/* exports.editProfile = async (req, res) => {
	const failedRes = () => res.status(400).json({ status: false, message: 'Profile Creation Failed' })
	try {
		const userId = req.user.id
		const name = req.body.name
		const phone = req.body.phone
		const updatedProfile = await profileQueries.updateByUserId(userId, { name, phone })
		if (!updatedProfile) return failedRes()
		else {
			res.status(200).json({
				status: true,
				message: 'Profile Created Successfully',
				data: updatedProfile,
			})
		}
	} catch (err) {
		console.log(err)
		failedRes()
	}
}
 */

exports.getUserEmails = async (req, res) => {
	const failedRes = () => res.status(400).json({ status: false, message: 'Profile Creation Failed' })
	try {
		const response = await internalRequests.recommendationPOST({
			route: process.env.RECOMMENDATION_GET_USER_EMAILS,
		})
		res.status(200).json({
			status: true,
			message: 'Request Success',
			data: response.data,
		})
	} catch (err) {
		console.log(err)
		failedRes()
	}
}
