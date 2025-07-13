import './App.css'
import AppRouter from './router/AppRouter'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { OfflineProvider } from './contexts/OfflineContext'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <div className="app">
      <LanguageProvider>
        <AuthProvider>
          <OfflineProvider>
            <NotificationProvider>
              <AppRouter />
            </NotificationProvider>
          </OfflineProvider>
        </AuthProvider>
      </LanguageProvider>
    </div>
  )
}

export default App
