import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import theme from './theme/index.js'
import queryClient from './config/queryClient.js'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
	<ChakraProvider theme={theme}>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<App />
				<ReactQueryDevtools position='bottom-right' initialIsOpen={false} />
			</BrowserRouter>
		</QueryClientProvider>
	</ChakraProvider>
)
