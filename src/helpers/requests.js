'use strict'
const { externalPOSTRequest, internalPOSTRequest } = require('@utils/requester')

exports.externalRequests = {
	dsepPOST: externalPOSTRequest(),
}

exports.internalRequests = {
	recommendationPOST: internalPOSTRequest(process.env.RECOMMENDATION_URI),
}
