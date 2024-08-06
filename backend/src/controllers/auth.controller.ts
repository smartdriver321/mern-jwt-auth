import {
	createAccount,
	loginUser,
	refreshUserAccessToken,
	verifyEmail,
} from '../services/auth.service'
import {
	loginSchema,
	registerSchema,
	verificationCodeSchema,
} from './auth.schema'
import SessionModel from '../models/session.model'
import { CREATED, OK, UNAUTHORIZED } from '../constants/http'
import { verifyToken } from '../utils/jwt'
import appAssert from '../utils/appAssert'
import catchErrors from '../utils/catchErrors'
import {
	clearAuthCookies,
	getAccessTokenCookieOptions,
	getRefreshTokenCookieOptions,
	setAuthCookies,
} from '../utils/cookies'

export const registerHandler = catchErrors(async (req, res) => {
	// Validate request
	const request = registerSchema.parse({
		...req.body,
		userAgent: req.headers['user-agent'],
	})

	// Call service
	const { user, accessToken, refreshToken } = await createAccount(request)

	return setAuthCookies({ res, accessToken, refreshToken })
		.status(CREATED)
		.json(user)
})

export const loginHandler = catchErrors(async (req, res) => {
	const request = loginSchema.parse({
		...req.body,
		userAgent: req.headers['user-agent'],
	})
	const { accessToken, refreshToken } = await loginUser(request)

	// set cookies
	return setAuthCookies({ res, accessToken, refreshToken })
		.status(OK)
		.json({ message: 'Login successful' })
})

export const logoutHandler = catchErrors(async (req, res) => {
	const accessToken = req.cookies.accessToken as string | undefined
	const { payload } = verifyToken(accessToken || '')

	if (payload) {
		// remove session from db
		await SessionModel.findByIdAndDelete(payload.sessionId)
	}

	// clear cookies
	return clearAuthCookies(res).status(OK).json({ message: 'Logout successful' })
})

export const refreshHandler = catchErrors(async (req, res) => {
	const refreshToken = req.cookies.refreshToken as string | undefined
	appAssert(refreshToken, UNAUTHORIZED, 'Missing refresh token')

	const { accessToken, newRefreshToken } = await refreshUserAccessToken(
		refreshToken
	)

	if (newRefreshToken) {
		res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions())
	}

	return res
		.status(OK)
		.cookie('accessToken', accessToken, getAccessTokenCookieOptions())
		.json({ message: 'Access token refreshed' })
})

export const verifyEmailHandler = catchErrors(async (req, res) => {
	const verificationCode = verificationCodeSchema.parse(req.params.code)

	await verifyEmail(verificationCode)

	return res.status(OK).json({ message: 'Email was successfully verified' })
})
