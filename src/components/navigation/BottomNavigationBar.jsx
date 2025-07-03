// src/components/navigation/BottomNavigationBar.jsx
// Barra de navegación inferior con 5 secciones principales

import { useLocation, useNavigate } from 'react-router-dom'

function BottomNavigationBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  // Configuración de las 5 secciones principales
  const navItems = [
    {
      id: 'home',
      path: '/home',
      icon: '🏠',
      label: 'Inicio',
      ariaLabel: 'Ir al dashboard principal',
    },
    {
      id: 'catalog',
      path: '/catalog',
      icon: '🌱',
      label: 'Semillas',
      ariaLabel: 'Ver catálogo de semillas',
    },
    {
      id: 'add-seed',
      path: '/add-seed',
      icon: '➕',
      label: 'Registrar',
      ariaLabel: 'Registrar nueva semilla',
    },
    {
      id: 'exchanges',
      path: '/exchanges',
      icon: '🔄',
      label: 'Trueques',
      ariaLabel: 'Ver intercambios',
    },
    {
      id: 'profile',
      path: '/profile',
      icon: '👤',
      label: 'Perfil',
      ariaLabel: 'Ver perfil de usuario',
    },
  ]

  // Rutas que requieren Bottom Navigation
  const navRoutes = navItems.map(item => item.path)
  const showBottomNav = navRoutes.includes(currentPath)

  // No mostrar en rutas que no corresponden
  if (!showBottomNav) return null

  // Función para manejar la navegación
  const handleNavigate = path => {
    navigate(path)
  }

  // Función para manejar navegación por teclado
  const handleKeyDown = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleNavigate(path)
    }
  }

  // Función para determinar si un item está activo
  const isActive = path => currentPath === path

  return (
    <nav
      style={styles.bottomNav}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div style={styles.navContainer}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.path)}
            onKeyDown={event => handleKeyDown(event, item.path)}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {}),
            }}
            className={`bottom-nav-item interactive-element ${
              isActive(item.path) ? 'active' : ''
            }`}
            aria-label={item.ariaLabel}
            aria-current={isActive(item.path) ? 'page' : undefined}
            tabIndex={0}
          >
            {/* Indicador de página activa */}
            {isActive(item.path) && (
              <div style={styles.activeIndicator} aria-hidden="true" />
            )}

            <span
              style={{
                ...styles.navIcon,
                ...(isActive(item.path) ? styles.navIconActive : {}),
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                ...styles.navLabel,
                ...(isActive(item.path) ? styles.navLabelActive : {}),
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}

// Estilos optimizados para mobile-first y touch usando variables CSS
const styles = {
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-primary)',
    borderTop: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 'var(--z-fixed)',
    height: '60px',
  },
  navContainer: {
    display: 'flex',
    height: '100%',
    maxWidth: 'var(--container-xl)',
    margin: '0 auto',
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 'var(--spacing-xs) var(--spacing-xs)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: 'var(--touch-target)',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    borderRadius: 'var(--border-radius-md)',
  },
  navItemActive: {
    backgroundColor: 'var(--bg-accent)',
    transform: 'scale(1.02)',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '20px',
    height: '3px',
    backgroundColor: 'var(--primary-blue)',
    borderRadius: '0 0 2px 2px',
    animation: 'slideIn 0.3s ease-out',
  },
  navIcon: {
    fontSize: '1.25rem',
    marginBottom: '2px',
    transition: 'var(--transition-normal)',
  },
  navIconActive: {
    transform: 'scale(1.1)',
  },
  navLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: 'var(--line-height-tight)',
    fontWeight: 'var(--font-weight-normal)',
    transition: 'all 0.2s ease',
  },
  navLabelActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
}

export default BottomNavigationBar
