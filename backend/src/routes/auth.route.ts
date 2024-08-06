import { Router } from 'express'

import {
	loginHandler,
	logoutHandler,
	registerHandler,
} from '../controllers/auth.controller'

const authRoute = Router()

// prefix: /auth
authRoute.post('/register', registerHandler)
authRoute.post('/login', loginHandler)
authRoute.get('/logout', logoutHandler)

export default authRoute
