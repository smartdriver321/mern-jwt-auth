import mongoose from 'mongoose'

declare global {
	namespace Express {
		interface Request {
			userId: mongoose.Types.ObjectId | AccessTokenPayload
			sessionId: mongoose.Types.ObjectId | AccessTokenPayload
		}
	}
}
export {}
