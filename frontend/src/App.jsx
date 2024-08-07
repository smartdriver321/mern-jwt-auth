import { Route, Routes } from 'react-router-dom'

import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AppContainer from './components/AppContainer'
import Profile from './pages/Profile'

export const Home = () => {
	return <div>Home</div>
}

function App() {
	return (
		<Routes>
			<Route path='/' element={<AppContainer />}>
				<Route index element={<Profile />} />
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
