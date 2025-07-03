import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { OfflineProvider } from './contexts/OfflineContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OfflineProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </OfflineProvider>
  </StrictMode>
)
