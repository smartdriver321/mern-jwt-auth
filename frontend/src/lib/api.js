import API from '../config/apiClient'

export const register = async (data) => API.post('/auth/register', data)

export const login = async (data) => API.post('/auth/login', data)
