import { createAccount, loginUser } from '../services/auth.service'
import { loginSchema, registerSchema } from './auth.schema'
import catchErrors from '../utils/catchErrors'
import { clearAuthCookies, setAuthCookies } from '../utils/cookies'
import { CREATED, OK } from '../constants/http'
import { verifyToken } from '../utils/jwt'
import SessionModel from '../models/session.model'

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
