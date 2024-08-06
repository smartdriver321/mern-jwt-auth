import jwt from 'jsonwebtoken'

import UserModel from '../models/user.model'
import SessionModel from '../models/session.model'
import VerificationCodeModel from '../models/verificationCode.model'
import { CONFLICT, UNAUTHORIZED } from '../constants/http'
import { JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/env'
import VerificationCodeType from '../constants/verificationCodeType'
import { oneYearFromNow } from '../utils/date'
import appAssert from '../utils/appAssert'
import {
	RefreshTokenPayload,
	refreshTokenSignOptions,
	signToken,
} from '../utils/jwt'

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

	const userId = user._id

	// Create verification code
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

	// Sign access token & refresh token
	const accessToken = jwt.sign(
		{
			userId,
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

type LoginParams = {
	email: string
	password: string
	userAgent?: string
}
export const loginUser = async ({
	email,
	password,
	userAgent,
}: LoginParams) => {
	const user = await UserModel.findOne({ email })
	appAssert(user, UNAUTHORIZED, 'Invalid email or password')

	const isValid = await user.comparePassword(password)
	appAssert(isValid, UNAUTHORIZED, 'Invalid email or password')

	const userId = user._id
	const session = await SessionModel.create({
		userId,
		userAgent,
	})

	const sessionInfo: RefreshTokenPayload = {
		sessionId: session._id,
	}

	const refreshToken = signToken(sessionInfo, refreshTokenSignOptions)
	const accessToken = signToken({
		...sessionInfo,
		userId,
	})

	return {
		user: user.omitPassword(),
		accessToken,
		refreshToken,
	}
}
