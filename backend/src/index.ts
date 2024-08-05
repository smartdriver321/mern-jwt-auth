import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import connectToDatabase from './config/db'
import { APP_ORIGIN, NODE_ENV, PORT } from './constants/env'
import errorHandler from './middleware/errorHandler'
import catchErrors from './utils/catchErrors'
import { OK } from './constants/http'

const app = express()

// Add middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
	cors({
		origin: APP_ORIGIN,
		credentials: true,
	})
)

// Health check
app.get('/', (req, res, next) => {
	return res.status(OK).json({
		status: 'Healthy',
	})
})

// Error handler
app.use(errorHandler)

app.listen(PORT, async () => {
	console.log(`Server listening on port ${PORT} in development ${NODE_ENV}`)
	await connectToDatabase()
})
