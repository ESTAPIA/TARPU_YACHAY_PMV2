// src/pages/LoginPage.jsx
// Página principal de inicio de sesión con navegación responsive

import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

function LoginPage() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'register', 'forgot'
  const { isAuthenticated } = useAuth()

  // Si ya está autenticado, mostrar mensaje
  if (isAuthenticated) {
    return (
      <div className="login-container">
        <div className="auth-card">
          <div className="success-message">
            <h2 className="success-title">✅ ¡Ya tienes sesión iniciada!</h2>
            <p className="success-text">
              Tu sesión está activa. Puedes navegar por la aplicación.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="auth-card">
        {/* Header de la página */}
        <div className="auth-header">
          <h1 className="auth-title">🌱 Tarpu Yachay</h1>
          <p className="auth-subtitle">
            Registro e intercambio de semillas nativas
          </p>
        </div>

        {/* Navegación entre vistas */}
        <div className="auth-navigation">
          <button
            onClick={() => setCurrentView('login')}
            className={`nav-button ${currentView === 'login' ? 'active' : ''}`}
          >
            🔑 Iniciar Sesión
          </button>
          <button
            onClick={() => setCurrentView('register')}
            className={`nav-button ${currentView === 'register' ? 'active' : ''}`}
          >
            📝 Crear Cuenta
          </button>
          <button
            onClick={() => setCurrentView('forgot')}
            className={`nav-button ${currentView === 'forgot' ? 'active' : ''}`}
          >
            🔑 Recuperar Contraseña
          </button>
        </div>

        {/* Contenido principal */}
        <div className="auth-content">
          {currentView === 'login' && (
            <div>
              <h2 className="form-title">🔑 Iniciar Sesión</h2>
              <LoginForm />
              <div className="link-section">
                <button
                  onClick={() => setCurrentView('forgot')}
                  className="link-button"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          )}

          {currentView === 'register' && (
            <div>
              <h2 className="form-title">📝 Crear Cuenta Nueva</h2>
              <div className="register-info">
                <p className="info-text">
                  ¿No tienes cuenta? Regístrate para comenzar a intercambiar
                  semillas con tu comunidad.
                </p>
              </div>
              <RegisterForm />
              <div className="link-section">
                <button
                  onClick={() => setCurrentView('login')}
                  className="link-button"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </div>
          )}

          {currentView === 'forgot' && (
            <div>
              <h2 className="form-title">🔑 Recuperar Contraseña</h2>
              <div className="forgot-info">
                <p className="info-text">
                  Ingresa tu email para recibir instrucciones de recuperación.
                </p>
              </div>
              <ForgotPasswordForm />
              <div className="link-section">
                <button
                  onClick={() => setCurrentView('login')}
                  className="link-button"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p className="footer-text">
            💚 Una herramienta para preservar nuestras semillas ancestrales
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
