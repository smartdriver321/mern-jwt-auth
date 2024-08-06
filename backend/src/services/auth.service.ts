import jwt from 'jsonwebtoken'

import UserModel from '../models/user.model'
import SessionModel from '../models/session.model'
import VerificationCodeModel from '../models/verificationCode.model'
import {
	CONFLICT,
	INTERNAL_SERVER_ERROR,
	NOT_FOUND,
	UNAUTHORIZED,
} from '../constants/http'
import { APP_ORIGIN, JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/env'
import VerificationCodeType from '../constants/verificationCodeType'
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from '../utils/date'
import appAssert from '../utils/appAssert'
import {
	RefreshTokenPayload,
	refreshTokenSignOptions,
	signToken,
	verifyToken,
} from '../utils/jwt'
import { sendMail } from '../utils/sendMail'
import { getVerifyEmailTemplate } from '../utils/emailTemplates'

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

	// Send verification email
	const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`
	const { error } = await sendMail({
		to: user.email,
		...getVerifyEmailTemplate(url),
	})
	// Ignore email errors for now
	if (error) console.error(error)

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

export const refreshUserAccessToken = async (refreshToken: string) => {
	const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
		secret: refreshTokenSignOptions.secret,
	})

	appAssert(payload, UNAUTHORIZED, 'Invalid refresh token')

	const session = await SessionModel.findById(payload.sessionId)
	const now = Date.now()
	appAssert(
		session && session.expiresAt.getTime() > now,
		UNAUTHORIZED,
		'Session expired'
	)

	// Refresh the session if it expires in the next 24hrs
	const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS

	if (sessionNeedsRefresh) {
		session.expiresAt = thirtyDaysFromNow()
		await session.save()
	}

	const newRefreshToken = sessionNeedsRefresh
		? signToken(
				{
					sessionId: session._id,
				},
				refreshTokenSignOptions
		  )
		: undefined

	const accessToken = signToken({
		userId: session.userId,
		sessionId: session._id,
	})

	return {
		accessToken,
		newRefreshToken,
	}
}

export const verifyEmail = async (code: string) => {
	const validCode = await VerificationCodeModel.findOne({
		_id: code,
		type: VerificationCodeType.EmailVerification,
		expiresAt: { $gt: new Date() },
	})
	appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code')

	const updatedUser = await UserModel.findByIdAndUpdate(
		validCode.userId,
		{
			verified: true,
		},
		{ new: true }
	)

	appAssert(updatedUser, INTERNAL_SERVER_ERROR, 'Failed to verify email')

	await validCode.deleteOne()

	return {
		user: updatedUser.omitPassword(),
	}
}
