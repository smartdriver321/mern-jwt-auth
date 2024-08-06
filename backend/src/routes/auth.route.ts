import { Router } from 'express'

import { registerHandler } from '../controllers/auth.controller'

const authRoute = Router()

// prefix: /auth
authRoute.post('/register', registerHandler)

export default authRoute
