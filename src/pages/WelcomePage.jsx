// src/pages/WelcomePage.jsx
// Página de bienvenida para nuevos usuarios registrados

import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LogoutButton from '../components/auth/LogoutButton'

function WelcomePage({ onNavigateToProfile }) {
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
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorMessage}>
            <h2 style={styles.errorTitle}>🔒 Acceso restringido</h2>
            <p style={styles.errorText}>
              Debes iniciar sesión para ver esta página.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header de bienvenida */}
        <div style={styles.welcomeHeader}>
          <div style={styles.welcomeIcon}>🎉</div>
          <h1 style={styles.welcomeTitle}>¡Bienvenido a Tarpu Yachay!</h1>
          <p style={styles.welcomeSubtitle}>
            Tu cuenta ha sido creada exitosamente
          </p>
        </div>

        {/* Información del usuario */}
        <div style={styles.userInfo}>
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              {user?.email?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div style={styles.userDetails}>
              <h3 style={styles.userName}>{user?.displayName || 'Usuario'}</h3>
              <p style={styles.userEmail}>{user?.email}</p>
              <p style={styles.userJoinDate}>
                Miembro desde: {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        {/* Información sobre la plataforma */}
        <div style={styles.platformInfo}>
          <h2 style={styles.infoTitle}>🌱 ¿Qué puedes hacer aquí?</h2>
          <div style={styles.featureList}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>📝</span>
              <div>
                <h4 style={styles.featureTitle}>Registrar Semillas</h4>
                <p style={styles.featureText}>
                  Documenta tus semillas nativas con fotos y descripción
                </p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🔄</span>
              <div>
                <h4 style={styles.featureTitle}>Intercambiar</h4>
                <p style={styles.featureText}>
                  Conecta con otros usuarios para intercambios
                </p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🌍</span>
              <div>
                <h4 style={styles.featureTitle}>Conservación</h4>
                <p style={styles.featureText}>
                  Contribuye a preservar la biodiversidad local
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div style={styles.actions}>
          <button style={styles.primaryButton} onClick={handleGoToProfile}>
            🚀 Configurar mi perfil
          </button>
          <button style={styles.secondaryButton} onClick={handleStartExploring}>
            🌱 Comenzar a explorar
          </button>
        </div>

        {/* Logout */}
        <div style={styles.logoutSection}>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

// Validación de PropTypes
WelcomePage.propTypes = {
  onNavigateToProfile: PropTypes.func,
}

// Estilos consistentes con el diseño existente
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    width: '100%',
    maxWidth: '600px',
    margin: '10px',
  },
  welcomeHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  welcomeIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '8px',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '0',
  },
  userInfo: {
    marginBottom: '30px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e9ecef',
  },
  userAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    marginRight: '16px',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#667eea',
    marginBottom: '4px',
  },
  userJoinDate: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '0',
  },
  platformInfo: {
    marginBottom: '30px',
  },
  infoTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '20px',
    textAlign: 'center',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  featureIcon: {
    fontSize: '24px',
    minWidth: '32px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  featureText: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '0',
    lineHeight: '1.4',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  },
  secondaryButton: {
    background: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  },
  logoutSection: {
    textAlign: 'center',
    borderTop: '1px solid #e9ecef',
    paddingTop: '20px',
  },
  errorMessage: {
    textAlign: 'center',
    padding: '20px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: '12px',
  },
  errorText: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '0',
  },
}

export default WelcomePage
