import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import { logout } from '../lib/api'

const UserMenu = () => {
	const navigate = useNavigate()

	const queryClient = useQueryClient()
	const { mutate: logOut } = useMutation({
		mutationFn: logout,
		onSettled: () => {
			queryClient.clear()
			navigate('/login', { replace: true })
		},
	})

	return (
		<Menu isLazy placement='right-start'>
			<MenuButton position='absolute' left='1.5rem' bottom='1.5rem'>
				<Avatar src='#' />
			</MenuButton>

			<MenuList>
				<MenuItem onClick={() => navigate('/')}>Profile</MenuItem>
				<MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
				<MenuItem onClick={logOut}>Log out</MenuItem>
			</MenuList>
		</Menu>
	)
}
export default UserMenu
