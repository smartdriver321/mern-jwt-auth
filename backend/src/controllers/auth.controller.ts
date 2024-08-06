import { createAccount, loginUser } from '../services/auth.service'
import { loginSchema, registerSchema } from './auth.schema'
import catchErrors from '../utils/catchErrors'
import { setAuthCookies } from '../utils/cookies'
import { CREATED, OK } from '../constants/http'

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
