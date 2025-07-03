// src/pages/LoginPage.jsx
// Página principal de inicio de sesión con navegación

import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'register', 'forgot'
  const { isAuthenticated } = useAuth()

  // Si ya está autenticado, mostrar mensaje
  if (isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.authCard}>
          <div style={styles.successMessage}>
            <h2 style={styles.successTitle}>✅ ¡Ya tienes sesión iniciada!</h2>
            <p style={styles.successText}>
              Tu sesión está activa. Puedes navegar por la aplicación.
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
            Registro e intercambio de semillas nativas
          </p>
        </div>

        {/* Navegación entre vistas */}
        <div style={styles.navigation}>
          <button
            onClick={() => setCurrentView('login')}
            style={{
              ...styles.navButton,
              ...(currentView === 'login' ? styles.navButtonActive : {}),
            }}
          >
            🔑 Iniciar Sesión
          </button>
          <button
            onClick={() => setCurrentView('register')}
            style={{
              ...styles.navButton,
              ...(currentView === 'register' ? styles.navButtonActive : {}),
            }}
          >
            📝 Crear Cuenta
          </button>
          <button
            onClick={() => setCurrentView('forgot')}
            style={{
              ...styles.navButton,
              ...(currentView === 'forgot' ? styles.navButtonActive : {}),
            }}
          >
            🔑 Recuperar Contraseña
          </button>
        </div>

        {/* Contenido principal */}
        <div style={styles.content}>
          {currentView === 'login' && (
            <div>
              <h2 style={styles.formTitle}>🔑 Iniciar Sesión</h2>
              <LoginForm />
              <div style={styles.linkSection}>
                <button
                  onClick={() => setCurrentView('forgot')}
                  style={styles.linkButton}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          )}

          {currentView === 'register' && (
            <div>
              <h2 style={styles.formTitle}>📝 Crear Cuenta Nueva</h2>
              <div style={styles.registerInfo}>
                <p style={styles.infoText}>
                  ¿No tienes cuenta? Regístrate para comenzar a intercambiar
                  semillas con tu comunidad.
                </p>
              </div>
              <RegisterForm />
              <div style={styles.linkSection}>
                <button
                  onClick={() => setCurrentView('login')}
                  style={styles.linkButton}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </div>
          )}

          {currentView === 'forgot' && (
            <div>
              <h2 style={styles.formTitle}>🔑 Recuperar Contraseña</h2>
              <div style={styles.forgotInfo}>
                <p style={styles.infoText}>
                  Ingresa tu email para recibir instrucciones de recuperación.
                </p>
              </div>
              <ForgotPasswordForm />
              <div style={styles.linkSection}>
                <button
                  onClick={() => setCurrentView('login')}
                  style={styles.linkButton}
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            💚 Una herramienta para preservar nuestras semillas ancestrales
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
    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
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
    color: '#2e7d32',
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
    background: '#2e7d32',
    color: 'white',
  },
  content: {
    marginBottom: '30px',
  },
  formTitle: {
    color: '#2e7d32',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  registerInfo: {
    background: '#e8f5e8',
    border: '1px solid #c8e6c9',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  forgotInfo: {
    background: '#fff3e0',
    border: '1px solid #ffcc02',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  infoText: {
    color: '#2e7d32',
    fontSize: '14px',
    margin: '0',
    textAlign: 'center',
  },
  linkSection: {
    textAlign: 'center',
    marginTop: '15px',
    padding: '10px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2e7d32',
    textDecoration: 'underline',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '5px',
    transition: 'color 0.3s ease',
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
  },
  successMessage: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  successTitle: {
    color: '#2e7d32',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  successText: {
    color: '#666',
    fontSize: '1.1rem',
    margin: '0',
  },
}

export default LoginPage
