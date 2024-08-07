import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import queryClient from './config/queryClient.js'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
	<QueryClientProvider client={queryClient}>
		<BrowserRouter>
			<App />
			<ReactQueryDevtools position='bottom-right' initialIsOpen={false} />
		</BrowserRouter>
	</QueryClientProvider>
)
