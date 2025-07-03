// src/components/auth/LogoutButton.jsx
// Componente de botón de logout con manejo de estados
// Actualizado para Paso 8: Soporte para modo compacto en header

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../contexts/AuthContext'

function LogoutButton({ compact = false }) {
  const { logout, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // No mostrar el botón si no está autenticado
  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = async () => {
    try {
      setMessage('')
      setIsLoading(true)

      // Llamar a la función logout de Firebase
      await logout()

      // Mensaje de éxito (opcional, se puede quitar si es molesto)
      setMessage('✅ Sesión cerrada correctamente')

      // Redirigir a la página de login
      navigate('/login')

      // Opcional: Limpiar datos locales adicionales si los hubiera
      // localStorage.removeItem('userData')
      // sessionStorage.clear()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setMessage('❌ Error al cerrar sesión. Intenta nuevamente.')
    }

    setIsLoading(false)
  }

  return (
    <div style={compact ? styles.compactContainer : styles.container}>
      {/* Información del usuario - solo en modo normal */}
      {!compact && (
        <div style={styles.userInfo}>
          <span style={styles.welcomeText}>👋 Hola, {user.email}</span>
        </div>
      )}

      {/* Botón de logout */}
      <button
        onClick={handleLogout}
        disabled={isLoading}
        style={{
          ...(compact ? styles.compactLogoutButton : styles.logoutButton),
          ...(isLoading ? styles.buttonDisabled : {}),
        }}
        aria-label={compact ? 'Cerrar sesión' : undefined}
        title={compact ? 'Cerrar sesión' : undefined}
      >
        {(() => {
          if (compact) {
            return isLoading ? '🔄' : '🚪'
          }
          return isLoading ? '🔄 Cerrando sesión...' : '🚪 Cerrar Sesión'
        })()}
      </button>

      {/* Mensaje de estado - solo en modo normal */}
      {!compact && message && (
        <div
          style={{
            ...styles.message,
            ...(message.includes('✅')
              ? styles.messageSuccess
              : styles.messageError),
          }}
        >
          {message}
        </div>
      )}
    </div>
  )
}

// Estilos del componente
const styles = {
  container: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  compactContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  userInfo: {
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: '16px',
    color: '#495057',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '180px',
  },
  compactLogoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },
  message: {
    padding: '10px 15px',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '10px',
  },
  messageSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  messageError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
}

// PropTypes para validación
LogoutButton.propTypes = {
  compact: PropTypes.bool,
}

export default LogoutButton
