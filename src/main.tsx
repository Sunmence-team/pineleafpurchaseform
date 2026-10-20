import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { ClientsProvider } from './context/ClientsContext.jsx'
import { UserProvider } from './context/UserProvider.js'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.js'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ClientsProvider>
            <App />
          </ClientsProvider>
        </UserProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Router>
  </StrictMode>,
)
