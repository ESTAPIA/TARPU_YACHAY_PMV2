// src/components/ui/Card.jsx
// Componente de tarjeta reutilizable

import PropTypes from 'prop-types'

function Card({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'medium',
  hover = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) {
  const handleClick = e => {
    if (clickable && onClick) {
      onClick(e)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`${hover ? 'interactive-element' : ''} ${clickable ? 'interactive-element' : ''} ${className}`}
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[padding],
        ...(hover ? styles.hover : {}),
        ...(clickable ? styles.clickable : {}),
      }}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {(title || subtitle) && (
        <div style={styles.header}>
          {title && <h3 style={styles.title}>{title}</h3>}
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div style={styles.content}>{children}</div>
    </div>
  )
}

// Estilos base
const styles = {
  base: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  },

  // Variantes
  default: {
    backgroundColor: 'white',
  },

  primary: {
    borderColor: '#1976d2',
    borderWidth: '2px',
  },

  success: {
    backgroundColor: '#f1f8e9',
    borderColor: '#4caf50',
  },

  warning: {
    backgroundColor: '#fff8e1',
    borderColor: '#ff9800',
  },

  danger: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },

  info: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },

  // Padding
  none: {
    padding: '0',
  },

  small: {
    padding: '12px',
  },

  medium: {
    padding: '20px',
  },

  large: {
    padding: '30px',
  },

  // Estados
  hover: {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },

  clickable: {
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
    },
    ':focus': {
      outline: '2px solid #1976d2',
      outlineOffset: '2px',
    },
  },

  // Header
  header: {
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #f0f0f0',
  },

  title: {
    margin: '0 0 8px 0',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 1.2,
  },

  subtitle: {
    margin: '0',
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: 1.4,
  },

  // Content
  content: {
    color: '#333',
    lineHeight: 1.5,
  },
}

// PropTypes para validación
Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'warning',
    'danger',
    'info',
  ]),
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  hover: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
}

export default Card
