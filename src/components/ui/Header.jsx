// src/components/ui/Header.jsx
// Componente de encabezado reutilizable

import PropTypes from 'prop-types'

function Header({
  title,
  subtitle,
  icon,
  variant = 'primary',
  centered = true,
  className = '',
}) {
  return (
    <header
      style={{
        ...styles.header,
        ...styles[variant],
        ...(centered ? styles.centered : styles.left),
      }}
      className={className}
      role="banner"
    >
      <div style={styles.content}>
        {icon && (
          <div style={styles.iconContainer}>
            <span style={styles.icon}>{icon}</span>
          </div>
        )}
        <div style={styles.textContainer}>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}

// Estilos responsivos
const styles = {
  header: {
    padding: '16px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '0',
  },

  // Variantes de color
  primary: {
    backgroundColor: '#1976d2',
    color: 'white',
  },
  secondary: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #e0e0e0',
  },
  success: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  warning: {
    backgroundColor: '#ff9800',
    color: 'white',
  },

  // Alineación
  centered: {
    textAlign: 'center',
  },
  left: {
    textAlign: 'left',
  },

  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  iconContainer: {
    flexShrink: 0,
  },

  icon: {
    fontSize: '2rem',
    display: 'block',
  },

  textContainer: {
    flex: 1,
  },

  title: {
    margin: '0 0 4px 0',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    lineHeight: 1.2,

    // Responsive
    '@media (max-width: 768px)': {
      fontSize: '1.3rem',
    },
  },

  subtitle: {
    margin: '0',
    fontSize: '0.9rem',
    opacity: 0.9,
    lineHeight: 1.3,

    // Responsive
    '@media (max-width: 768px)': {
      fontSize: '0.85rem',
    },
  },
}

// PropTypes para validación
Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning']),
  centered: PropTypes.bool,
  className: PropTypes.string,
}

export default Header
