// src/components/auth/LoginForm.jsx
// Formulario de inicio de sesión con validación en tiempo real

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

// Funciones helper para colores de mensajes
const getMessageBackgroundColor = message => {
  if (message.includes('✅')) return '#d4edda'
  if (message.includes('❌')) return '#f8d7da'
  return '#fff3cd'
}

const getMessageBorderColor = message => {
  if (message.includes('✅')) return '#c3e6cb'
  if (message.includes('❌')) return '#f5c6cb'
  return '#ffeaa7'
}

function LoginForm() {
  const { login, isAuthenticated } = useAuth()

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Estados de validación y errores
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Validaciones en tiempo real
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'El email es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email inválido'
        } else {
          delete newErrors.email
        }
        break

      case 'password':
        if (!value) {
          newErrors.password = 'La contraseña es requerida'
        } else if (value.length < 6) {
          newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
        } else {
          delete newErrors.password
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar cambios en inputs
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Validar campo en tiempo real
    validateField(name, value)

    // Limpiar mensaje anterior
    if (message) setMessage('')
  }

  // Validar formulario completo
  const validateForm = () => {
    const emailValid = validateField('email', formData.email)
    const passwordValid = validateField('password', formData.password)

    return emailValid && passwordValid
  }

  // Manejar envío del formulario
  const handleSubmit = async e => {
    e.preventDefault()

    // Validar formulario antes de enviar
    if (!validateForm()) {
      setMessage('❌ Por favor corrige los errores antes de continuar')
      return
    }

    try {
      setIsLoading(true)
      setMessage('🔄 Iniciando sesión...')

      await login(formData.email, formData.password)

      setMessage('✅ ¡Inicio de sesión exitoso!')

      // Limpiar formulario después de login exitoso
      setFormData({
        email: '',
        password: '',
      })
      setErrors({})
    } catch (error) {
      // Manejo específico de errores de Firebase Auth
      let errorMessage = ''

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email'
          break
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet'
          break
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas. Verifica email y contraseña'
          break
        default:
          errorMessage = `Error de autenticación: ${error.message}`
      }

      setMessage(`❌ ${errorMessage}`)
      console.error('Error de login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Si ya está autenticado, mostrar mensaje
  if (isAuthenticated) {
    return (
      <div
        style={{
          padding: '20px',
          border: '2px solid #28a745',
          borderRadius: '12px',
          margin: '20px 0',
          backgroundColor: '#d4edda',
          textAlign: 'center',
        }}
      >
        <h3 style={{ color: '#28a745', marginBottom: '10px' }}>
          ✅ Ya estás autenticado
        </h3>
        <p style={{ color: '#155724', margin: '0' }}>
          ¡Sesión iniciada correctamente!
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '25px',
        border: '2px solid #007bff',
        borderRadius: '12px',
        margin: '20px 0',
        backgroundColor: '#f8f9fa',
        maxWidth: '500px',
      }}
    >
      <h3
        style={{ color: '#007bff', marginBottom: '20px', textAlign: 'center' }}
      >
        🔑 Iniciar Sesión
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#495057',
            }}
          >
            📧 Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu-email@ejemplo.com"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.email ? '2px solid #dc3545' : '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: 'white',
              transition: 'border-color 0.3s',
            }}
            disabled={isLoading}
            required
          />
          {errors.email && (
            <p
              style={{
                color: '#dc3545',
                fontSize: '14px',
                margin: '5px 0 0 0',
              }}
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#495057',
            }}
          >
            🔒 Contraseña:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Tu contraseña"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.password
                ? '2px solid #dc3545'
                : '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: 'white',
              transition: 'border-color 0.3s',
            }}
            disabled={isLoading}
            required
          />
          {errors.password && (
            <p
              style={{
                color: '#dc3545',
                fontSize: '14px',
                margin: '5px 0 0 0',
              }}
            >
              {errors.password}
            </p>
          )}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading || Object.keys(errors).length > 0}
          style={{
            width: '100%',
            padding: '15px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor:
              isLoading || Object.keys(errors).length > 0
                ? '#6c757d'
                : '#007bff',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor:
              isLoading || Object.keys(errors).length > 0
                ? 'not-allowed'
                : 'pointer',
            transition: 'background-color 0.3s',
            marginBottom: '15px',
          }}
        >
          {isLoading ? '🔄 Iniciando sesión...' : '🔑 Iniciar Sesión'}
        </button>
      </form>

      {/* Mensaje de estado */}
      {message && (
        <div
          style={{
            padding: '12px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            backgroundColor: getMessageBackgroundColor(message),
            borderColor: getMessageBorderColor(message),
            marginBottom: '15px',
          }}
        >
          <strong>📢 Estado:</strong> {message}
        </div>
      )}

      {/* Información adicional */}
      <div
        style={{
          padding: '12px',
          backgroundColor: '#e9ecef',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#495057',
        }}
      >
        <strong>ℹ️ Funcionalidades implementadas:</strong>
        <ul
          style={{ marginTop: '8px', paddingLeft: '20px', marginBottom: '0' }}
        >
          <li>✅ Validación en tiempo real</li>
          <li>✅ Manejo específico de errores de Firebase</li>
          <li>✅ Integración con AuthContext</li>
          <li>✅ Diseño responsive</li>
          <li>✅ Estados de carga y deshabilitado</li>
          <li>✅ Limpieza de formulario tras login exitoso</li>
        </ul>
      </div>
    </div>
  )
}

export default LoginForm
