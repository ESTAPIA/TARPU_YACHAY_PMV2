// src/components/ui/Loading.jsx
// Componente de indicador de carga reutilizable
// Actualizado para Paso 9: Animaciones y feedback visual

import PropTypes from 'prop-types'

function Loading({
  size = 'medium',
  variant = 'primary',
  text = '',
  fullScreen = false,
  className = '',
}) {
  const LoadingContent = () => (
    <div
      style={{
        ...styles.container,
        ...(fullScreen ? styles.fullScreen : {}),
      }}
      className={`fade-in ${className}`}
      role="status"
      aria-label={text || 'Cargando'}
    >
      <div
        style={{
          ...styles.spinner,
          ...styles[size],
          ...styles[variant],
        }}
        className="spin-animation gpu-accelerated"
        aria-hidden="true"
      />
      {text && (
        <p style={styles.text} className="pulse-animation">
          {text}
        </p>
      )}
    </div>
  )

  return <LoadingContent />
}

// Estilos responsivos
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
  },

  fullScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999,
  },

  spinner: {
    border: '3px solid #f3f3f3',
    borderTop: '3px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // Tamaños
  small: {
    width: '20px',
    height: '20px',
    borderWidth: '2px',
  },
  medium: {
    width: '40px',
    height: '40px',
    borderWidth: '3px',
  },
  large: {
    width: '60px',
    height: '60px',
    borderWidth: '4px',
  },

  // Variantes de color
  primary: {
    borderTopColor: '#1976d2',
  },
  secondary: {
    borderTopColor: '#666',
  },
  success: {
    borderTopColor: '#4caf50',
  },
  warning: {
    borderTopColor: '#ff9800',
  },

  text: {
    margin: '0',
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
}

// CSS Animation (se podría mover a un archivo CSS global)
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
if (!document.head.querySelector('style[data-loading-spinner]')) {
  styleSheet.setAttribute('data-loading-spinner', 'true')
  document.head.appendChild(styleSheet)
}

// PropTypes para validación
Loading.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
}

export default Loading
