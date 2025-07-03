// src/components/ui/ErrorBoundary.jsx
// Componente para manejo de errores en React

import { Component } from 'react'
import PropTypes from 'prop-types'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })

    // Log del error (en producción enviar a servicio de logging)
    console.error('ErrorBoundary capturó un error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // UI de error personalizada
      return (
        <div style={styles.container} role="alert">
          <div style={styles.errorCard}>
            <div style={styles.iconContainer}>
              <span style={styles.errorIcon}>⚠️</span>
            </div>

            <div style={styles.content}>
              <h2 style={styles.title}>
                {this.props.title || 'Algo salió mal'}
              </h2>

              <p style={styles.message}>
                {this.props.message ||
                  'Ha ocurrido un error inesperado. Por favor, intenta recargar la página.'}
              </p>

              {this.props.showDetails && this.state.error && (
                <details style={styles.details}>
                  <summary style={styles.summary}>
                    Ver detalles técnicos
                  </summary>
                  <div style={styles.errorDetails}>
                    <pre style={styles.errorText}>
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <pre style={styles.errorStack}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div style={styles.actions}>
                <button onClick={this.handleReset} style={styles.primaryButton}>
                  🔄 Intentar de nuevo
                </button>

                <button
                  onClick={this.handleReload}
                  style={styles.secondaryButton}
                >
                  ↻ Recargar página
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Estilos del error boundary
const styles = {
  container: {
    minHeight: '50vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },

  errorCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #ffcdd2',
    textAlign: 'center',
  },

  iconContainer: {
    marginBottom: '20px',
  },

  errorIcon: {
    fontSize: '3rem',
    display: 'block',
  },

  content: {
    textAlign: 'left',
  },

  title: {
    color: '#d32f2f',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    textAlign: 'center',
  },

  message: {
    color: '#666',
    fontSize: '1rem',
    lineHeight: 1.5,
    margin: '0 0 25px 0',
    textAlign: 'center',
  },

  details: {
    margin: '20px 0',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
  },

  summary: {
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#666',
  },

  errorDetails: {
    padding: '15px',
    backgroundColor: '#fff',
  },

  errorText: {
    color: '#d32f2f',
    fontSize: '0.85rem',
    margin: '0 0 10px 0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },

  errorStack: {
    color: '#666',
    fontSize: '0.8rem',
    margin: '0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },

  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  primaryButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },

  secondaryButton: {
    backgroundColor: 'white',
    color: '#1976d2',
    border: '2px solid #1976d2',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
}

// PropTypes para validación
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  showDetails: PropTypes.bool,
}

ErrorBoundary.defaultProps = {
  showDetails: false,
}

export default ErrorBoundary
