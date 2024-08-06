import jwt from 'jsonwebtoken'

import { JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/env'
import VerificationCodeType from '../constants/verificationCodeType'
import SessionModel from '../models/session.model'
import UserModel from '../models/user.model'
import VerificationCodeModel from '../models/verificationCode.model'
import { oneYearFromNow } from '../utils/date'
import appAssert from '../utils/appAssert'
import { CONFLICT } from '../constants/http'

type CreateAccountParams = {
	email: string
	password: string
	userAgent?: string
}
export const createAccount = async (data: CreateAccountParams) => {
	// verify email is not taken
	const existingUser = await UserModel.exists({
		email: data.email,
	})

	// if (existingUser) {
	// 	throw new Error('User already exists')
	// }

	appAssert(!existingUser, CONFLICT, 'Email already in use')

	// Create user
	const user = await UserModel.create({
		email: data.email,
		password: data.password,
	})

	// Create verification code
	const userId = user._id
	const verificationCode = await VerificationCodeModel.create({
		userId,
		type: VerificationCodeType.EmailVerification,
		expiresAt: oneYearFromNow(),
	})

	// create session
	const session = await SessionModel.create({
		userId,
		userAgent: data.userAgent,
	})

	const accessToken = jwt.sign(
		{
			userId: user._id,
			sessionId: session._id,
		},
		JWT_SECRET,
		{
			audience: ['user'],
			expiresIn: '15m',
		}
	)

	const refreshToken = jwt.sign(
		{
			sessionId: session._id,
		},
		JWT_REFRESH_SECRET,
		{
			audience: ['user'],
			expiresIn: '30d',
		}
	)

	return {
		user: user.omitPassword(),
		accessToken,
		refreshToken,
	}
}
