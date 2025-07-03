// src/components/auth/PrivateRoute.jsx
// Componente para proteger rutas que requieren autenticación

import PropTypes from 'prop-types'
import { useAuth } from '../../contexts/AuthContext'

function PrivateRoute({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth()

  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <h3 style={styles.loadingTitle}>🔄 Verificando sesión...</h3>
          <p style={styles.loadingText}>
            Espera un momento mientras confirmamos tu identidad
          </p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar componente de fallback o mensaje de login
  if (!isAuthenticated) {
    // Si se proporciona un fallback personalizado, usarlo
    if (fallback) {
      return fallback
    }

    // Mensaje por defecto de redirección a login
    return (
      <div style={styles.unauthorizedContainer}>
        <div style={styles.unauthorizedCard}>
          <div style={styles.iconContainer}>
            <span style={styles.lockIcon}>🔒</span>
          </div>
          <h2 style={styles.unauthorizedTitle}>Acceso Restringido</h2>
          <p style={styles.unauthorizedText}>
            Para acceder a esta sección necesitas iniciar sesión primero.
          </p>
          <div style={styles.messageBox}>
            <p style={styles.messageText}>
              📱 <strong>Tarpu Yachay</strong> protege tu información y la de tu
              comunidad
            </p>
          </div>
          <p style={styles.instructionText}>
            👆{' '}
            <em>
              Usa los formularios de arriba para iniciar sesión o registrarte
            </em>
          </p>
        </div>
      </div>
    )
  }

  // Si está autenticado, renderizar el componente hijo
  return children
}

// Estilos para el componente
const styles = {
  // Estilos para loading
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    padding: '20px',
  },
  loadingCard: {
    textAlign: 'center',
    padding: '40px 30px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2e7d32',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px auto',
  },
  loadingTitle: {
    color: '#2e7d32',
    margin: '0 0 10px 0',
    fontSize: '1.4rem',
  },
  loadingText: {
    color: '#666',
    margin: '0',
    fontSize: '14px',
  },

  // Estilos para acceso no autorizado
  unauthorizedContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    padding: '20px',
  },
  unauthorizedCard: {
    textAlign: 'center',
    padding: '40px 30px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: '2px solid #ffebee',
    maxWidth: '500px',
    width: '100%',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  lockIcon: {
    fontSize: '4rem',
    display: 'block',
  },
  unauthorizedTitle: {
    color: '#d32f2f',
    margin: '0 0 15px 0',
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  unauthorizedText: {
    color: '#666',
    margin: '0 0 20px 0',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  messageBox: {
    background: '#f3e5f5',
    border: '1px solid #ce93d8',
    borderRadius: '8px',
    padding: '15px',
    margin: '20px 0',
  },
  messageText: {
    color: '#7b1fa2',
    margin: '0',
    fontSize: '14px',
    fontWeight: '500',
  },
  instructionText: {
    color: '#888',
    fontSize: '13px',
    margin: '15px 0 0 0',
    fontStyle: 'italic',
  },
}

// Agregar la animación del spinner mediante CSS-in-JS
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

// Validación de PropTypes
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
}

PrivateRoute.defaultProps = {
  fallback: null,
}

export default PrivateRoute

// Ejemplos de uso:
// 1. Básico: <PrivateRoute><ComponenteProtegido /></PrivateRoute>
// 2. Con fallback personalizado: <PrivateRoute fallback={<MiComponentePersonalizado />}><ComponenteProtegido /></PrivateRoute>
