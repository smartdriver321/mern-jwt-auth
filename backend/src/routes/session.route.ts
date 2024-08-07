import { Router } from 'express'

import {
	deleteSessionHandler,
	getSessionsHandler,
} from '../controllers/session.controller'

const sessionRoute = Router()

// prefix: /sessions
sessionRoute.get('/', getSessionsHandler)
sessionRoute.delete('/:id', deleteSessionHandler)

export default sessionRoute
