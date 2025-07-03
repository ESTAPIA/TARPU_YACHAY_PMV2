// src/components/layout/AppLayout.jsx
// Layout principal de la aplicación con Bottom Navigation Bar
// Actualizado para Paso 8: Integración completa con sistema de autenticación

import { useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import BottomNavigationBar from '../navigation/BottomNavigationBar'
import LogoutButton from '../auth/LogoutButton'
import ConnectivityIndicator from '../ui/ConnectivityIndicator'
import { useAuth } from '../../contexts/AuthContext'

function AppLayout({ children }) {
  const location = useLocation()
  const currentPath = location.pathname
  const { user } = useAuth()

  // Determinar si mostrar el header y navegación
  const authRoutes = ['/login', '/register', '/forgot-password']
  const showHeader = !authRoutes.includes(currentPath)
  const showBottomNav = !authRoutes.includes(currentPath)

  return (
    <>
      {/* Skip to main content para accesibilidad */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <div className="app-container">
        {/* Header semántico con ARIA y logout integrado */}
        {showHeader && (
          <header className="app-header" role="banner">
            <div className="container">
              <div className="app-header-content">
                <div className="app-header-branding">
                  <h1 className="app-header-title">🌱 Tarpu Yachay</h1>
                  <p className="app-header-subtitle">
                    Intercambio de Semillas Nativas
                  </p>
                </div>

                {/* Sección de usuario y logout */}
                <div className="app-header-user">
                  {user && (
                    <>
                      <div className="user-info">
                        <span className="user-greeting">
                          {'👋 '}
                          {user.displayName ||
                            user.email?.split('@')[0] ||
                            'Usuario'}
                        </span>
                      </div>
                      <div className="logout-container">
                        <LogoutButton compact />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Área de contenido principal con ID para skip link */}
        <main
          id="main-content"
          className={`main-content ${!showBottomNav ? 'main-content-no-nav' : ''}`}
          role="main"
          tabIndex="-1"
        >
          {children}
        </main>

        {/* Bottom Navigation Bar - solo en rutas autenticadas */}
        {showBottomNav && <BottomNavigationBar />}

        {/* Indicador de conectividad - Paso 4 Bloque 4 */}
        <ConnectivityIndicator />
      </div>
    </>
  )
}

// PropTypes para validación
AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout
