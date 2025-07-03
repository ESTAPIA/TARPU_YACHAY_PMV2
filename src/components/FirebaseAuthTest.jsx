// src/components/FirebaseAuthTest.jsx
// Componente específico para probar Firebase Authentication

import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase-config'

function FirebaseAuthTest() {
  const [testResults, setTestResults] = useState({
    connection: null,
    register: null,
    login: null,
    logout: null,
    currentUser: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail] = useState('test@tarpuyachay.com')
  const [testPassword] = useState('TestPassword123!')

  // Función para actualizar resultados
  const updateResult = (test, status, message = '') => {
    setTestResults(prev => ({
      ...prev,
      [test]: { status, message, timestamp: new Date().toLocaleTimeString() },
    }))
  }

  // Test 1: Verificar conexión con Firebase Auth
  const testConnection = async () => {
    try {
      setIsLoading(true)
      updateResult('connection', 'testing', 'Verificando conexión...')

      // Verificar que auth esté inicializado
      if (!auth || !auth.app) {
        throw new Error('Firebase Auth no está inicializado')
      }

      updateResult(
        'connection',
        'success',
        `Conexión exitosa - App: ${auth.app.name}`
      )
    } catch (error) {
      updateResult('connection', 'error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Test 2: Registro de usuario de prueba
  const testRegister = async () => {
    try {
      setIsLoading(true)
      updateResult('register', 'testing', 'Creando usuario de prueba...')

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        testEmail,
        testPassword
      )

      updateResult(
        'register',
        'success',
        `Usuario creado: ${userCredential.user.email}`
      )
      setTestResults(prev => ({
        ...prev,
        currentUser: userCredential.user.email,
      }))
    } catch (error) {
      const message =
        error.code === 'auth/email-already-in-use'
          ? 'Email ya existe (normal en pruebas repetidas)'
          : error.message
      updateResult('register', 'warning', message)
    } finally {
      setIsLoading(false)
    }
  }

  // Test 3: Login con credenciales
  const testLogin = async () => {
    try {
      setIsLoading(true)
      updateResult('login', 'testing', 'Iniciando sesión...')

      const userCredential = await signInWithEmailAndPassword(
        auth,
        testEmail,
        testPassword
      )

      updateResult(
        'login',
        'success',
        `Login exitoso: ${userCredential.user.email}`
      )
      setTestResults(prev => ({
        ...prev,
        currentUser: userCredential.user.email,
      }))
    } catch (error) {
      updateResult('login', 'error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Test 4: Logout
  const testLogout = async () => {
    try {
      setIsLoading(true)
      updateResult('logout', 'testing', 'Cerrando sesión...')

      await signOut(auth)

      updateResult('logout', 'success', 'Logout exitoso')
      setTestResults(prev => ({
        ...prev,
        currentUser: null,
      }))
    } catch (error) {
      updateResult('logout', 'error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Ejecutar todas las pruebas
  const runAllTests = async () => {
    await testConnection()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testRegister()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testLogin()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testLogout()
  }

  // Función para obtener el color según el estado
  const getStatusColor = status => {
    switch (status) {
      case 'success':
        return '#28a745'
      case 'error':
        return '#dc3545'
      case 'warning':
        return '#ffc107'
      case 'testing':
        return '#007bff'
      default:
        return '#6c757d'
    }
  }

  // Función para obtener el icono según el estado
  const getStatusIcon = status => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'testing':
        return '🔄'
      default:
        return '⚪'
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #007bff',
        borderRadius: '12px',
        margin: '20px 0',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h3 style={{ color: '#007bff', marginBottom: '20px' }}>
        🔥 Firebase Authentication Test Suite
      </h3>

      {/* Usuario actual */}
      <div
        style={{
          padding: '10px',
          backgroundColor: testResults.currentUser ? '#d4edda' : '#fff3cd',
          border: '1px solid #c3e6cb',
          borderRadius: '6px',
          marginBottom: '20px',
        }}
      >
        <strong>Usuario actual:</strong>{' '}
        {testResults.currentUser || 'No autenticado'}
      </div>

      {/* Botones de prueba */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testConnection}
          disabled={isLoading}
          style={{
            margin: '5px',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          Test Conexión
        </button>

        <button
          onClick={testRegister}
          disabled={isLoading}
          style={{
            margin: '5px',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#28a745',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          Test Registro
        </button>

        <button
          onClick={testLogin}
          disabled={isLoading}
          style={{
            margin: '5px',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#ffc107',
            color: 'black',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          Test Login
        </button>

        <button
          onClick={testLogout}
          disabled={isLoading}
          style={{
            margin: '5px',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#dc3545',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          Test Logout
        </button>

        <button
          onClick={runAllTests}
          disabled={isLoading}
          style={{
            margin: '5px',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#6f42c1',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          🚀 Ejecutar Todas
        </button>
      </div>

      {/* Resultados de las pruebas */}
      <div>
        <h4>📊 Resultados de Pruebas:</h4>

        {Object.entries(testResults).map(([test, result]) => {
          if (test === 'currentUser' || !result) return null

          return (
            <div
              key={test}
              style={{
                padding: '12px',
                margin: '8px 0',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                backgroundColor: 'white',
                borderLeft: `4px solid ${getStatusColor(result.status)}`,
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {getStatusIcon(result.status)} {test.toUpperCase()}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {result.message}
              </div>
              {result.timestamp && (
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {result.timestamp}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Información adicional */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#e9ecef',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#495057',
        }}
      >
        <strong>ℹ️ Información:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>
            <strong>Email de prueba:</strong> {testEmail}
          </li>
          <li>
            <strong>Password de prueba:</strong> {testPassword}
          </li>
          <li>
            Este componente verifica la funcionalidad completa de Firebase Auth
          </li>
          <li>
            Es normal que el registro falle si el usuario ya existe (lo indica
            como warning)
          </li>
        </ul>
      </div>
    </div>
  )
}

export default FirebaseAuthTest
