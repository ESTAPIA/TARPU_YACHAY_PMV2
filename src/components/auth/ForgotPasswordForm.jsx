// src/components/auth/ForgotPasswordForm.jsx
// Formulario para recuperación de contraseña

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function ForgotPasswordForm() {
  const { resetPassword } = useAuth()

  // Estado del formulario
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' | 'error'

  // Validar email
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Manejar envío del formulario
  const handleSubmit = async e => {
    e.preventDefault()

    // Validar email
    if (!email.trim()) {
      setMessage('Por favor, ingresa tu email')
      setMessageType('error')
      return
    }

    if (!validateEmail(email)) {
      setMessage('Por favor, ingresa un email válido')
      setMessageType('error')
      return
    }

    try {
      setIsLoading(true)
      setMessage('')

      await resetPassword(email)

      setMessage(
        '✅ Email de recuperación enviado! Revisa tu bandeja de entrada.'
      )
      setMessageType('success')
      setEmail('') // Limpiar formulario
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error)

      // Manejo específico de errores
      let errorMessage = 'Error al enviar email de recuperación'

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet'
          break
        default:
          errorMessage = error.message || 'Error desconocido'
      }

      setMessage(errorMessage)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔑 Recuperar Contraseña</h2>

      <p style={styles.subtitle}>
        Ingresa tu email y te enviaremos un enlace para restablecer tu
        contraseña.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Ingresa tu email"
            style={styles.input}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          style={{
            ...styles.button,
            ...(isLoading || !email.trim() ? styles.buttonDisabled : {}),
          }}
        >
          {isLoading ? '📧 Enviando...' : '📧 Enviar Email de Recuperación'}
        </button>
      </form>

      {/* Mensaje de resultado */}
      {message && (
        <div
          style={{
            ...styles.message,
            ...(messageType === 'success'
              ? styles.messageSuccess
              : styles.messageError),
          }}
        >
          {message}
        </div>
      )}

      {/* Información adicional */}
      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          💡 <strong>Nota:</strong> El email puede tardar unos minutos en
          llegar. Revisa también tu carpeta de spam.
        </p>
      </div>
    </div>
  )
}

// Estilos para el componente
const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  },
  title: {
    textAlign: 'center',
    color: '#2e7d32',
    margin: '0 0 10px 0',
    fontSize: '1.5rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    margin: '0 0 25px 0',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    outline: 'none',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  message: {
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: '15px',
  },
  messageSuccess: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    border: '1px solid #81c784',
  },
  messageError: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    border: '1px solid #e57373',
  },
  infoBox: {
    backgroundColor: '#f3e5f5',
    border: '1px solid #ce93d8',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '20px',
  },
  infoText: {
    margin: '0',
    fontSize: '13px',
    color: '#7b1fa2',
    lineHeight: '1.4',
  },
}

export default ForgotPasswordForm
