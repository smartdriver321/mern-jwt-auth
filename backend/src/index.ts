import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import connectToDatabase from './config/db'
import { OK } from './constants/http'
import { APP_ORIGIN, NODE_ENV, PORT } from './constants/env'
import errorHandler from './middleware/errorHandler'
import authenticate from './middleware/authenticate'
import authRoute from './routes/auth.route'
import userRoute from './routes/user.route'

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
app.get('/health', (_, res) => {
	return res.status(OK).json({
		status: 'Healthy',
	})
})

// Auth routes
app.use('/auth', authRoute)

// protected routes
app.use('/user', authenticate, userRoute)

// Error handler
app.use(errorHandler)

app.listen(PORT, async () => {
	await connectToDatabase()

	console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`)
})
