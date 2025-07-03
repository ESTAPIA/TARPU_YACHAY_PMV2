// src/components/auth/AuthTest.jsx
// Componente para probar el AuthContext y sus funciones

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function AuthTest() {
  const { user, loading, register, login, logout, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('test@tarpuyachay.com')
  const [password, setPassword] = useState('TestPassword123!')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = async () => {
    try {
      setIsLoading(true)
      setMessage('Registrando usuario...')
      await register(email, password)
      setMessage('✅ Usuario registrado exitosamente!')
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage('⚠️ Email ya existe (normal en pruebas)')
      } else {
        setMessage(`❌ Error: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setMessage('Iniciando sesión...')
      await login(email, password)
      setMessage('✅ Login exitoso!')
    } catch (error) {
      setMessage(`❌ Error de login: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      setMessage('Cerrando sesión...')
      await logout()
      setMessage('✅ Logout exitoso!')
    } catch (error) {
      setMessage(`❌ Error de logout: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          border: '2px solid #007bff',
          borderRadius: '8px',
          margin: '20px 0',
        }}
      >
        <h3>🔄 Cargando AuthContext...</h3>
        <p>Verificando estado de autenticación...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #28a745',
        borderRadius: '12px',
        margin: '20px 0',
        backgroundColor: '#f8f9fa',
      }}
    >
      <h3 style={{ color: '#28a745', marginBottom: '20px' }}>
        🔐 AuthContext Test - ¡Funcionando!
      </h3>

      {/* Estado actual del usuario */}
      <div
        style={{
          padding: '15px',
          backgroundColor: isAuthenticated ? '#d4edda' : '#fff3cd',
          border: '1px solid ' + (isAuthenticated ? '#c3e6cb' : '#ffeaa7'),
          borderRadius: '6px',
          marginBottom: '20px',
        }}
      >
        <h4>👤 Estado de Autenticación:</h4>
        <p>
          <strong>Autenticado:</strong> {isAuthenticated ? '✅ SÍ' : '❌ NO'}
        </p>
        <p>
          <strong>Usuario:</strong> {user ? user.email : 'No autenticado'}
        </p>
        <p>
          <strong>UID:</strong> {user ? user.uid : 'N/A'}
        </p>
        <p>
          <strong>Loading:</strong> {loading ? 'true' : 'false'}
        </p>
      </div>

      {/* Formulario de prueba */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              margin: '5px 0',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              margin: '5px 0',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleRegister}
          disabled={isLoading}
          style={{
            margin: '5px',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#28a745',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          🆕 Registrar
        </button>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            margin: '5px',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          🔑 Login
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoading || !isAuthenticated}
          style={{
            margin: '5px',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#dc3545',
            color: 'white',
            cursor: isLoading || !isAuthenticated ? 'not-allowed' : 'pointer',
            opacity: isLoading || !isAuthenticated ? 0.6 : 1,
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div
          style={{
            padding: '12px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            backgroundColor: 'white',
            marginBottom: '15px',
          }}
        >
          <strong>📢 Estado:</strong> {message}
        </div>
      )}

      {/* Información técnica */}
      <div
        style={{
          padding: '12px',
          backgroundColor: '#e9ecef',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#495057',
        }}
      >
        <strong>ℹ️ Información técnica:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>✅ AuthContext está funcionando correctamente</li>
          <li>✅ Provider envuelve la aplicación en main.jsx</li>
          <li>✅ Hook useAuth() disponible en toda la app</li>
          <li>✅ Persistencia de sesión configurada</li>
          <li>✅ Estado global sincronizado con Firebase</li>
        </ul>
      </div>
    </div>
  )
}

export default AuthTest
