// src/components/ui/Button.jsx
// Componente de botón reutilizable

import PropTypes from 'prop-types'

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const handleClick = e => {
    if (disabled || loading) return
    onClick?.(e)
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`btn-feedback interactive-element ${className}`}
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[size],
        ...(fullWidth ? styles.fullWidth : {}),
        ...(disabled || loading ? styles.disabled : {}),
      }}
      {...props}
    >
      {loading ? (
        <span style={styles.loadingSpinner}>⏳</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span style={styles.iconLeft}>{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span style={styles.iconRight}>{icon}</span>
          )}
        </>
      )}
    </button>
  )
}

// Estilos base usando variables CSS
const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-sm)',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    fontFamily: 'var(--font-family-primary)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
    textDecoration: 'none',
    outline: 'none',
    minHeight: 'var(--touch-target)',
    minWidth: 'var(--touch-target)',

    // Focus states para accesibilidad
    ':focus-visible': {
      outline: '2px solid var(--primary-blue)',
      outlineOffset: '2px',
    },
  },

  // Variantes de estilo usando variables CSS
  primary: {
    backgroundColor: 'var(--primary-blue)',
    color: 'var(--text-light)',
    ':hover': {
      backgroundColor: 'var(--primary-green)',
    },
  },

  secondary: {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--primary-blue)',
    border: '2px solid var(--primary-blue)',
    ':hover': {
      backgroundColor: 'var(--bg-secondary)',
    },
  },

  success: {
    backgroundColor: 'var(--light-green)',
    color: 'var(--text-light)',
    ':hover': {
      backgroundColor: '#45a049',
    },
  },

  warning: {
    backgroundColor: '#ff9800',
    color: 'white',
    ':hover': {
      backgroundColor: '#f57c00',
    },
  },

  danger: {
    backgroundColor: '#f44336',
    color: 'white',
    ':hover': {
      backgroundColor: '#d32f2f',
    },
  },

  ghost: {
    backgroundColor: 'transparent',
    color: '#1976d2',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },

  // Tamaños
  small: {
    padding: '6px 12px',
    fontSize: '12px',
    minHeight: '32px',
  },

  medium: {
    padding: '10px 20px',
    fontSize: '14px',
    minHeight: '40px',
  },

  large: {
    padding: '14px 28px',
    fontSize: '16px',
    minHeight: '48px',
  },

  // Estados
  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },

  fullWidth: {
    width: '100%',
  },

  // Iconos
  iconLeft: {
    marginRight: '4px',
  },

  iconRight: {
    marginLeft: '4px',
  },

  loadingSpinner: {
    animation: 'spin 1s linear infinite',
  },
}

// PropTypes para validación
Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
    'ghost',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
}

export default Button
