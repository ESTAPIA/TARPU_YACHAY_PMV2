// src/components/NavigationManager.jsx
// Componente wrapper para navegación con loading
// Actualizado para Paso 8: Integración con sistema de autenticación

import PropTypes from 'prop-types'
import { useNavigationManager } from '../hooks/useNavigationManager'

/**
 * Componente wrapper para uso en páginas que necesiten
 * lógica automática de navegación
 */
function NavigationManager({ children }) {
  const { loading } = useNavigationManager()

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingSpinner}>🔄</div>
          <h2 style={styles.loadingTitle}>Cargando Tarpu Yachay...</h2>
          <p style={styles.loadingText}>
            Verificando tu sesión y preparando la aplicación
          </p>
        </div>
      </div>
    )
  }

  return children
}

// PropTypes
NavigationManager.propTypes = {
  children: PropTypes.node.isRequired,
}

// Estilos para el loading
const styles = {
  loadingContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loadingCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  loadingSpinner: {
    fontSize: '48px',
    marginBottom: '20px',
    animation: 'spin 2s linear infinite',
  },
  loadingTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '12px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '0',
  },
}

export default NavigationManager
