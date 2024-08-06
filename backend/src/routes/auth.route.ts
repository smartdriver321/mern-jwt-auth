import { Router } from 'express'

import {
	loginHandler,
	logoutHandler,
	refreshHandler,
	registerHandler,
	sendPasswordResetHandler,
	verifyEmailHandler,
} from '../controllers/auth.controller'

const authRoute = Router()

// prefix: /auth
authRoute.post('/register', registerHandler)
authRoute.post('/login', loginHandler)
authRoute.get('/logout', logoutHandler)
authRoute.get('/refresh', refreshHandler)
authRoute.get('/email/verify/:verificationCodeId', verifyEmailHandler)
authRoute.post('/password/forgot', sendPasswordResetHandler)

export default authRoute
