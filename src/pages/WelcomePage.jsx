// src/pages/WelcomePage.jsx
// Página de bienvenida para nuevos usuarios registrados

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LogoutButton from '../components/auth/LogoutButton'
import './WelcomePage.css'

function WelcomePage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleGoToProfile = () => {
    navigate('/profile')
  }

  const handleStartExploring = () => {
    navigate('/home')
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return (
      <div className="welcome-container">
        <div className="welcome-card">
          <div className="error-message">
            <h2 className="error-title">🔒 Acceso restringido</h2>
            <p className="error-text">
              Debes iniciar sesión para ver esta página.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        {/* Header de bienvenida */}
        <div className="welcome-header">
          <div className="welcome-icon">🎉</div>
          <h1 className="welcome-title">¡Bienvenido a Tarpu Yachay!</h1>
          <p className="welcome-subtitle">
            Tu cuenta ha sido creada exitosamente
          </p>
        </div>

        {/* Información del usuario */}
        <div className="user-info">
          <div className="user-card">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div className="user-details">
              <h3 className="user-name">{user?.displayName || 'Usuario'}</h3>
              <p className="user-email">{user?.email}</p>
              <p className="user-join-date">
                Miembro desde: {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        {/* Información sobre la plataforma */}
        <div className="platform-info">
          <h2 className="info-title">🌱 ¿Qué puedes hacer aquí?</h2>
          <div className="feature-list">
            <div className="feature">
              <span className="feature-icon">📝</span>
              <div className="feature-content">
                <h4 className="feature-title">Registrar Semillas</h4>
                <p className="feature-text">
                  Documenta tus semillas nativas con fotos y descripción
                </p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🔄</span>
              <div className="feature-content">
                <h4 className="feature-title">Intercambiar</h4>
                <p className="feature-text">
                  Conecta con otros usuarios para intercambios
                </p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🌍</span>
              <div className="feature-content">
                <h4 className="feature-title">Conservación</h4>
                <p className="feature-text">
                  Contribuye a preservar la biodiversidad local
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="actions">
          <button className="primary-button" onClick={handleGoToProfile}>
            🚀 Configurar mi perfil
          </button>
          <button className="secondary-button" onClick={handleStartExploring}>
            🌱 Comenzar a explorar
          </button>
        </div>

        {/* Logout */}
        <div className="logout-section">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
