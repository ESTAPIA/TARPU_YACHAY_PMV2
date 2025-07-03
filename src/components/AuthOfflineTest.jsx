// src/components/AuthOfflineTest.jsx
// Componente de prueba para verificar integración offline con AuthContext
// Paso 5 Bloque 4: Testing de funcionalidad offline de autenticación

import { useAuth } from '../contexts/AuthContext'

function AuthOfflineTest() {
  const {
    user,
    isOnline,
    isAuthenticated,
    hasOfflineUserData,
    saveUserDataLocally,
    getUserDataLocally,
  } = useAuth()

  const handleTestOfflineAuth = async () => {
    console.log('🧪 Iniciando pruebas de AuthContext offline...')

    // 1. Verificar estado de conectividad
    console.log('🌐 Estado online:', isOnline)
    console.log('🔐 Usuario autenticado:', isAuthenticated)
    console.log('💾 Datos offline disponibles:', hasOfflineUserData)

    // 2. Si hay usuario, probar guardado local
    if (user) {
      console.log('👤 Usuario actual:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      })

      // Probar guardado manual
      const saved = await saveUserDataLocally(user)
      console.log('💾 Guardado manual exitoso:', saved)

      // Probar recuperación manual
      const recovered = await getUserDataLocally(user.uid)
      console.log('📂 Datos recuperados:', recovered)
    } else {
      console.log('❌ No hay usuario autenticado para probar')
    }

    console.log('✅ Pruebas de AuthContext offline completadas')
  }

  return (
    <div style={styles.container}>
      <h2>🧪 Pruebas AuthContext Offline - Paso 5</h2>

      <div style={styles.status}>
        <h3>Estado Actual</h3>
        <p>
          <strong>Conectividad:</strong>{' '}
          <span style={{ color: isOnline ? '#10b981' : '#ef4444' }}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </p>
        <p>
          <strong>Autenticado:</strong>{' '}
          <span style={{ color: isAuthenticated ? '#10b981' : '#ef4444' }}>
            {isAuthenticated ? '✅ Sí' : '❌ No'}
          </span>
        </p>
        <p>
          <strong>Datos offline:</strong>{' '}
          <span style={{ color: hasOfflineUserData ? '#10b981' : '#6b7280' }}>
            {hasOfflineUserData ? '💾 Disponibles' : '📭 No disponibles'}
          </span>
        </p>
      </div>

      {user && (
        <div style={styles.userInfo}>
          <h3>Información del Usuario</h3>
          <p>
            <strong>UID:</strong> {user.uid}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Nombre:</strong> {user.displayName || 'No configurado'}
          </p>
          <p>
            <strong>Email verificado:</strong>{' '}
            {user.emailVerified ? '✅ Sí' : '❌ No'}
          </p>
        </div>
      )}

      <div style={styles.actions}>
        <button onClick={handleTestOfflineAuth} style={styles.button}>
          🧪 Ejecutar Pruebas Offline
        </button>
        <p style={styles.note}>
          💡 <strong>Instrucciones:</strong>
          <br />
          1. Haz clic en &quot;Ejecutar Pruebas Offline&quot;
          <br />
          2. Revisa la consola del navegador para ver los resultados
          <br />
          3. Prueba desconectando internet y recargando la página
        </p>
      </div>
    </div>
  )
}

// Estilos simples
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
  },
  status: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #e5e7eb',
  },
  userInfo: {
    backgroundColor: '#eff6ff',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #dbeafe',
  },
  actions: {
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'background-color 0.2s',
  },
  note: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'left',
    lineHeight: '1.6',
  },
}

export default AuthOfflineTest
