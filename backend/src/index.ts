import 'dotenv/config'
import express from 'express'

import connectToDatabase from './config/db'
import { NODE_ENV, PORT } from './constants/env'

const app = express()

app.get('/', (_, res) => {
	return res.status(200).json({
		status: 'healthy',
	})
})

app.listen(4004, async () => {
	console.log(`Server listening on port ${PORT} in development ${NODE_ENV}`)
	await connectToDatabase()
})
