import express from 'express'

const app = express()

app.get('/', (_, res) => {
	return res.status(200).json({
		status: 'healthy',
	})
})

app.listen(4004, async () => {
	console.log(`Server listening on port 4004 in development environment`)
})
