// src/pages/RegisterPage.jsx
// Página principal de registro con navegación

import { useState } from 'react'
import RegisterForm from '../components/auth/RegisterForm'
import LoginForm from '../components/auth/LoginForm'
import { useAuth } from '../contexts/AuthContext'

function RegisterPage() {
  const [showRegister, setShowRegister] = useState(true)
  const { isAuthenticated } = useAuth()

  // Si ya está autenticado, mostrar mensaje
  if (isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.authCard}>
          <div style={styles.successMessage}>
            <h2 style={styles.successTitle}>✅ ¡Ya tienes sesión iniciada!</h2>
            <p style={styles.successText}>
              Tu cuenta está activa. Puedes navegar por la aplicación.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        {/* Header de la página */}
        <div style={styles.header}>
          <h1 style={styles.title}>🌱 Tarpu Yachay</h1>
          <p style={styles.subtitle}>
            Únete a la comunidad de intercambio de semillas
          </p>
        </div>

        {/* Navegación entre Login y Registro */}
        <div style={styles.navigation}>
          <button
            onClick={() => setShowRegister(false)}
            style={{
              ...styles.navButton,
              ...(!showRegister ? styles.navButtonActive : {}),
            }}
          >
            🔑 Iniciar Sesión
          </button>
          <button
            onClick={() => setShowRegister(true)}
            style={{
              ...styles.navButton,
              ...(showRegister ? styles.navButtonActive : {}),
            }}
          >
            📝 Registrarse
          </button>
        </div>

        {/* Contenido principal */}
        <div style={styles.content}>
          {showRegister ? (
            <div>
              <h2 style={styles.formTitle}>📝 Crear Cuenta Nueva</h2>
              <div style={styles.registerInfo}>
                <p style={styles.infoText}>
                  🌱 Únete a nuestra comunidad y comienza a intercambiar
                  semillas nativas con otros agricultores.
                </p>
              </div>
              <RegisterForm />
            </div>
          ) : (
            <div>
              <h2 style={styles.formTitle}>🔑 Iniciar Sesión</h2>
              <div style={styles.loginInfo}>
                <p style={styles.infoText}>
                  ¿Ya tienes cuenta? Inicia sesión para continuar.
                </p>
              </div>
              <LoginForm />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            💚 Preservando el conocimiento ancestral de nuestras semillas
          </p>
        </div>
      </div>
    </div>
  )
}

// Estilos responsive y accesibles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f4fd 0%, #c3e8fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  authCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    width: '100%',
    padding: '30px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    color: '#1976d2',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  subtitle: {
    color: '#555',
    fontSize: '1.1rem',
    margin: '0',
    opacity: 0.8,
  },
  navigation: {
    display: 'flex',
    marginBottom: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  navButton: {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    background: '#f5f5f5',
    color: '#666',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderRight: '1px solid #e0e0e0',
  },
  navButtonActive: {
    background: '#1976d2',
    color: 'white',
  },
  content: {
    marginBottom: '20px',
  },
  formTitle: {
    color: '#1976d2',
    fontSize: '1.5rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  registerInfo: {
    background: '#e3f2fd',
    border: '1px solid #bbdefb',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  loginInfo: {
    background: '#f0f8f0',
    border: '1px solid #c8e6c9',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  infoText: {
    color: '#1976d2',
    margin: '0',
    fontSize: '14px',
    textAlign: 'center',
  },
  comingSoon: {
    textAlign: 'center',
    padding: '40px 20px',
    background: '#fff3e0',
    borderRadius: '8px',
    border: '1px solid #ffcc02',
  },
  backButton: {
    marginTop: '15px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    background: '#1976d2',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  successMessage: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  successTitle: {
    color: '#1976d2',
    marginBottom: '15px',
  },
  successText: {
    color: '#666',
    fontSize: '16px',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
  },
  footerText: {
    color: '#666',
    fontSize: '14px',
    margin: '0',
    opacity: 0.7,
  },
}

export default RegisterPage
