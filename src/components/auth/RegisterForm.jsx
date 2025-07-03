// src/components/auth/RegisterForm.jsx
// Formulario de registro de usuarios con validación en tiempo real

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function RegisterForm() {
  const { register } = useAuth()

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Estados de validación y errores
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Validaciones en tiempo real
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          newErrors.nombre = 'El nombre es requerido'
        } else if (value.trim().length < 2) {
          newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
        } else {
          delete newErrors.nombre
        }
        break

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value) {
          newErrors.email = 'El email es requerido'
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Formato de email inválido'
        } else {
          delete newErrors.email
        }
        break

      case 'password':
        if (!value) {
          newErrors.password = 'La contraseña es requerida'
        } else if (value.length < 6) {
          newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password =
            'Debe contener al menos: 1 mayúscula, 1 minúscula y 1 número'
        } else {
          delete newErrors.password
        }

        // Revalidar confirmación si ya se ingresó
        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden'
          } else {
            delete newErrors.confirmPassword
          }
        }
        break

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Confirma tu contraseña'
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden'
        } else {
          delete newErrors.confirmPassword
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
  }

  // Validar formulario completo
  const validateForm = () => {
    const { nombre, email, password, confirmPassword } = formData
    let isValid = true

    // Validar todos los campos
    isValid = validateField('nombre', nombre) && isValid
    isValid = validateField('email', email) && isValid
    isValid = validateField('password', password) && isValid
    isValid = validateField('confirmPassword', confirmPassword) && isValid

    return isValid
  }

  // Manejar envío del formulario
  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      setMessage('❌ Por favor corrige los errores en el formulario')
      return
    }

    try {
      setIsLoading(true)
      setMessage('🔄 Registrando usuario...')

      // Registrar con Firebase Auth
      const userCredential = await register(formData.email, formData.password)

      // Aquí podrías guardar información adicional del usuario en Firestore
      console.log('Usuario registrado:', userCredential.user)

      setMessage('✅ ¡Registro exitoso! Bienvenido a Tarpu Yachay')

      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setErrors({})
    } catch (error) {
      console.error('Error de registro:', error)

      // Manejo de errores específicos de Firebase
      let errorMessage = 'Error desconocido'

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email ya está registrado. ¿Ya tienes cuenta?'
          break
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil'
          break
        case 'auth/invalid-email':
          errorMessage = 'El formato del email es inválido'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'El registro no está habilitado'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet'
          break
        default:
          errorMessage = error.message || 'Error al registrar usuario'
      }

      setMessage(`❌ ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '20px',
        }}
      >
        🌱 Registro - Tarpu Yachay
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Campo Nombre */}
        <div style={{ marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Nombre completo *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Tu nombre completo"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.nombre ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {errors.nombre && (
            <div
              style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}
            >
              {errors.nombre}
            </div>
          )}
        </div>

        {/* Campo Email */}
        <div style={{ marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.email ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {errors.email && (
            <div
              style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}
            >
              {errors.email}
            </div>
          )}
        </div>

        {/* Campo Contraseña */}
        <div style={{ marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Contraseña *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Mínimo 6 caracteres"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.password ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {errors.password && (
            <div
              style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}
            >
              {errors.password}
            </div>
          )}
        </div>

        {/* Campo Confirmar Contraseña */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Confirmar contraseña *
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Repite tu contraseña"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.confirmPassword ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {errors.confirmPassword && (
            <div
              style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}
            >
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Botón de registro */}
        <button
          type="submit"
          disabled={isLoading || Object.keys(errors).length > 0}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor:
              isLoading || Object.keys(errors).length > 0 ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor:
              isLoading || Object.keys(errors).length > 0
                ? 'not-allowed'
                : 'pointer',
            marginBottom: '15px',
          }}
        >
          {isLoading ? '🔄 Registrando...' : '🌱 Registrarse'}
        </button>

        {/* Mensaje de estado */}
        {message && (
          <div
            style={{
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '14px',
              backgroundColor: message.includes('✅')
                ? '#d4edda'
                : message.includes('❌')
                  ? '#f8d7da'
                  : '#fff3cd',
              color: message.includes('✅')
                ? '#155724'
                : message.includes('❌')
                  ? '#721c24'
                  : '#856404',
              border: `1px solid ${
                message.includes('✅')
                  ? '#c3e6cb'
                  : message.includes('❌')
                    ? '#f5c6cb'
                    : '#ffeaa7'
              }`,
            }}
          >
            {message}
          </div>
        )}
      </form>

      {/* Información adicional */}
      <div
        style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#6c757d',
        }}
      >
        <strong>💡 Requisitos de contraseña:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
          <li>Mínimo 6 caracteres</li>
          <li>Al menos 1 letra mayúscula</li>
          <li>Al menos 1 letra minúscula</li>
          <li>Al menos 1 número</li>
        </ul>
      </div>
    </div>
  )
}

export default RegisterForm
