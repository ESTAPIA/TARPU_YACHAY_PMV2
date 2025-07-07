import './App.css'
import AppRouter from './router/AppRouter'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <div className="app">
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </div>
  )
}

export default App
