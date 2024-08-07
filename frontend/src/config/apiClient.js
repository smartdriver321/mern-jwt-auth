import axios from 'axios'

import queryClient from './queryClient'
import { UNAUTHORIZED } from '../constants/http.mjs'
import { navigate } from '../lib/navigation'

const options = {
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
}

// Create a separate client for refreshing the access token to avoid infinite loops with the error interceptor
const TokenRefreshClient = axios.create(options)
TokenRefreshClient.interceptors.response.use((response) => response.data)

const API = axios.create(options)

API.interceptors.response.use(
	(response) => response.data,
	async (error) => {
		const { config, response } = error
		const { status, data } = response || {}

		// Try to refresh the access token behind the scenes
		if (status === UNAUTHORIZED && data?.errorCode === 'InvalidAccessToken') {
			try {
				// Refresh the access token, then retry the original request
				await TokenRefreshClient.get('/auth/refresh')

				return TokenRefreshClient(config)
			} catch (error) {
				// handle refresh errors by clearing the query cache & redirecting to login
				queryClient.clear()
				navigate('/login', {
					state: {
						redirectUrl: window.location.pathname,
					},
				})
			}
		}

		return Promise.reject({ status, ...data })
	}
)

export default API
