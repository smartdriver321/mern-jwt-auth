import { RequestHandler } from 'express'

import { UNAUTHORIZED } from '../constants/http'
import AppErrorCode from '../constants/appErrorCode'
import appAssert from '../utils/appAssert'
import { verifyToken } from '../utils/jwt'

// Wrap with catchErrors() if you need this to be async
const authenticate: RequestHandler = (req, res, next) => {
	const accessToken = req.cookies.accessToken as string | undefined

	appAssert(
		accessToken,
		UNAUTHORIZED,
		'Not authorized',
		AppErrorCode.InvalidAccessToken
	)

	const { error, payload } = verifyToken(accessToken)

	appAssert(
		payload,
		UNAUTHORIZED,
		error === 'jwt expired' ? 'Token expired' : 'Invalid token',
		AppErrorCode.InvalidAccessToken
	)

	req.userId = payload.userId
	req.sessionId = payload.sessionId
	next()
}

export default authenticate
