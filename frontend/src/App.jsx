import { Route, Routes } from 'react-router-dom'

import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'

export const Home = () => {
	return <div>Home</div>
}

function App() {
	return (
		<Routes>
			<Route path='/' element={<Home />} />
			<Route path='/register' element={<Register />} />
			<Route path='/login' element={<Login />} />
			<Route path='/email/verify/:code' element={<VerifyEmail />} />
			<Route path='/password/forgot' element={<ForgotPassword />} />
		</Routes>
	)
}

export default App
