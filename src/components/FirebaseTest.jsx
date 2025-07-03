// src/components/FirebaseTest.jsx
// Componente de prueba para verificar la conexión con Firebase

import { useState, useEffect } from 'react'
import { app, auth, db, storage } from '../firebase-config'

function FirebaseTest() {
  const [firebaseStatus, setFirebaseStatus] = useState({
    app: false,
    auth: false,
    db: false,
    storage: false,
    error: null,
  })

  useEffect(() => {
    try {
      // Verificar que Firebase se inicializó correctamente
      const status = {
        app: !!app && app.name === '[DEFAULT]',
        auth: !!auth,
        db: !!db,
        storage: !!storage,
        error: null,
      }
      setFirebaseStatus(status)
      console.log('🔥 Firebase Status:', status)
    } catch (error) {
      console.error('❌ Firebase Error:', error)
      setFirebaseStatus(prev => ({ ...prev, error: error.message }))
    }
  }, [])

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        margin: '20px 0',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h3>🔥 Firebase Connection Test</h3>

      <div style={{ marginBottom: '10px' }}>
        <strong>App:</strong>{' '}
        {firebaseStatus.app ? '✅ Connected' : '❌ Failed'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Auth:</strong> {firebaseStatus.auth ? '✅ Ready' : '❌ Failed'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Firestore:</strong>{' '}
        {firebaseStatus.db ? '✅ Ready' : '❌ Failed'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Storage:</strong>{' '}
        {firebaseStatus.storage ? '✅ Ready' : '❌ Failed'}
      </div>

      {firebaseStatus.error && (
        <div
          style={{
            color: 'red',
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px',
          }}
        >
          <strong>Error:</strong> {firebaseStatus.error}
        </div>
      )}

      <div
        style={{
          marginTop: '15px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        ℹ️ Este componente verifica que Firebase se haya inicializado
        correctamente. Para probar funcionalidades reales, necesitas configurar
        las credenciales en el archivo .env
      </div>
    </div>
  )
}

export default FirebaseTest
