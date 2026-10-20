import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { ClientsProvider } from './context/ClientsContext.jsx'
import { UserProvider } from './context/UserProvider.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <UserProvider>
        <ClientsProvider>
          <App />
        </ClientsProvider>
      </UserProvider>
    </Router>
  </StrictMode>,
)
