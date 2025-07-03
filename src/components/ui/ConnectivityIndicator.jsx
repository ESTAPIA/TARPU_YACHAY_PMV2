// src/components/ui/ConnectivityIndicator.jsx
// Indicador visual de conectividad - Paso 4 Bloque 4
// Componente simple y funcional que muestra el estado de conexión

import { useOffline } from '../../hooks/useOffline'

function ConnectivityIndicator() {
  const { isOnline, isLoading } = useOffline()

  // No mostrar nada si está cargando el estado inicial
  if (isLoading) {
    return null
  }

  // Solo mostrar cuando está offline para no interferir con la UX
  if (isOnline) {
    return null
  }

  return (
    <div style={styles.container}>
      <div style={styles.indicator}>
        <span style={styles.icon}>📶</span>
        <span style={styles.text}>Sin conexión</span>
      </div>
    </div>
  )
}

// Estilos inline simples para priorizar funcionalidad
const styles = {
  container: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 1000,
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  icon: {
    fontSize: '1rem',
  },
  text: {
    whiteSpace: 'nowrap',
  },
}

export default ConnectivityIndicator
