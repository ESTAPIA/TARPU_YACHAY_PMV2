// src/components/auth/ProtectedComponent.jsx
// Componente de ejemplo para probar rutas protegidas

import { useAuth } from '../../contexts/AuthContext'

function ProtectedComponent() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      console.log('✅ Logout exitoso')
    } catch (error) {
      console.error('❌ Error en logout:', error)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.icon}>🛡️</span>
          <h2 style={styles.title}>Área Protegida</h2>
        </div>

        <div style={styles.content}>
          <p style={styles.welcomeText}>
            ¡Bienvenido! Has accedido exitosamente a una ruta protegida.
          </p>

          <div style={styles.userInfo}>
            <h3 style={styles.userTitle}>👤 Información del Usuario</h3>
            <div style={styles.infoItem}>
              <strong>Email:</strong> {user?.email || 'No disponible'}
            </div>
            <div style={styles.infoItem}>
              <strong>UID:</strong>{' '}
              <code style={styles.code}>
                {user?.uid?.substring(0, 12) || 'No disponible'}...
              </code>
            </div>
            <div style={styles.infoItem}>
              <strong>Estado:</strong>{' '}
              <span style={styles.status}>🟢 Autenticado</span>
            </div>
          </div>

          <div style={styles.features}>
            <h3 style={styles.featuresTitle}>🔐 Funcionalidades Disponibles</h3>
            <ul style={styles.featuresList}>
              <li style={styles.featureItem}>
                ✅ Acceso a contenido protegido
              </li>
              <li style={styles.featureItem}>
                ✅ Persistencia de sesión automática
              </li>
              <li style={styles.featureItem}>
                ✅ Verificación de autenticación en tiempo real
              </li>
              <li style={styles.featureItem}>
                ✅ Redirección automática si no autenticado
              </li>
            </ul>
          </div>

          <div style={styles.actions}>
            <button onClick={handleLogout} style={styles.logoutButton}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            🛡️ Este componente solo es visible para usuarios autenticados
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    marginTop: '20px',
  },
  card: {
    background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
    border: '2px solid #4caf50',
    borderRadius: '12px',
    maxWidth: '600px',
    margin: '0 auto',
    overflow: 'hidden',
  },
  header: {
    background: '#4caf50',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '10px',
  },
  title: {
    margin: '0',
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  content: {
    padding: '30px 25px',
  },
  welcomeText: {
    fontSize: '16px',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: '25px',
    padding: '15px',
    background: 'rgba(76, 175, 80, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  userInfo: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
  },
  userTitle: {
    color: '#2e7d32',
    margin: '0 0 15px 0',
    fontSize: '1.2rem',
  },
  infoItem: {
    padding: '8px 0',
    borderBottom: '1px solid #f5f5f5',
    fontSize: '14px',
  },
  code: {
    background: '#f5f5f5',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  status: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  features: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
  },
  featuresTitle: {
    color: '#2e7d32',
    margin: '0 0 15px 0',
    fontSize: '1.2rem',
  },
  featuresList: {
    margin: '0',
    paddingLeft: '0',
    listStyle: 'none',
  },
  featureItem: {
    padding: '5px 0',
    fontSize: '14px',
    color: '#555',
  },
  actions: {
    textAlign: 'center',
    marginTop: '20px',
  },
  logoutButton: {
    background: '#f44336',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  footer: {
    background: 'rgba(76, 175, 80, 0.1)',
    padding: '15px',
    textAlign: 'center',
    borderTop: '1px solid rgba(76, 175, 80, 0.3)',
  },
  footerText: {
    margin: '0',
    fontSize: '12px',
    color: '#2e7d32',
    fontStyle: 'italic',
  },
}

export default ProtectedComponent
