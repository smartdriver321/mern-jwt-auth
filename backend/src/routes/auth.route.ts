import { Router } from 'express'

import {
	loginHandler,
	logoutHandler,
	refreshHandler,
	registerHandler,
} from '../controllers/auth.controller'

const authRoute = Router()

// prefix: /auth
authRoute.post('/register', registerHandler)
authRoute.post('/login', loginHandler)
authRoute.get('/logout', logoutHandler)
authRoute.get('/refresh', refreshHandler)

export default authRoute
