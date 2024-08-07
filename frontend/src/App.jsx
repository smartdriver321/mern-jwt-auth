import { Route, Routes, useNavigate } from 'react-router-dom'

import AppContainer from './components/AppContainer'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import { setNavigate } from './lib/navigation'

export const Home = () => {
	return <div>Home</div>
}

function App() {
	//  Set the navigate function on our API client for using in the axios error interceptor.This allows us to redirect to the login page when an auth error occurs.
	const navigate = useNavigate()
	setNavigate(navigate)

	return (
		<Routes>
			<Route path='/' element={<AppContainer />}>
				<Route index element={<Profile />} />
				<Route path='settings' element={<Settings />} />
			</Route>
			<Route path='/register' element={<Register />} />
			<Route path='/login' element={<Login />} />
			<Route path='/email/verify/:code' element={<VerifyEmail />} />
			<Route path='/password/forgot' element={<ForgotPassword />} />
			<Route path='/password/reset' element={<ResetPassword />} />
		</Routes>
	)
}

export default App
