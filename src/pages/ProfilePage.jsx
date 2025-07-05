// src/pages/ProfilePage.jsx
// Página de perfil del usuario con edición de información

import { useState, useEffect } from 'react'
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth'
import { useAuth } from '../contexts/AuthContext'
import LogoutButton from '../components/auth/LogoutButton'
import './ProfilePage.css'

function ProfilePage() {
  const { user, isAuthenticated } = useAuth()

  // Estados para el formulario de perfil
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Estados para la información del usuario
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // TODOS LOS HOOKS ANTES DEL EARLY RETURN

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || '',
      }))
    }
  }, [user])

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Manejar cambios en el formulario
  const handleInputChange = e => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // EARLY RETURN DESPUÉS DE TODOS LOS HOOKS
  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="error-message">
            <h2 className="error-title">🔒 Acceso restringido</h2>
            <p className="error-text">
              Debes iniciar sesión para ver tu perfil.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Actualizar perfil
  const handleUpdateProfile = async e => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Validaciones básicas
      if (
        profileData.newPassword &&
        profileData.newPassword !== profileData.confirmPassword
      ) {
        throw new Error('Las contraseñas no coinciden')
      }

      if (profileData.newPassword && profileData.newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      // Actualizar nombre si cambió
      if (profileData.displayName !== (user.displayName || '')) {
        await updateProfile(user, {
          displayName: profileData.displayName,
        })
      }

      // Actualizar email si cambió
      if (profileData.email !== user.email) {
        await updateEmail(user, profileData.email)
      }

      // Actualizar contraseña si se proporcionó una nueva
      if (profileData.newPassword) {
        await updatePassword(user, profileData.newPassword)
      }

      setMessage({
        type: 'success',
        text: '✅ Perfil actualizado correctamente',
      })

      setIsEditing(false)
      // Limpiar campos de contraseña
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      setMessage({
        type: 'error',
        text: `❌ Error: ${error.message}`,
      })
    }

    setLoading(false)
  }

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false)
    setProfileData(prev => ({
      ...prev,
      displayName: user.displayName || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }))
    setMessage({ type: '', text: '' })
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Header del perfil */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.displayName?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() ||
              '👤'}
          </div>
          <div className="user-info">
            <h1 className="user-name">
              {user?.displayName || 'Usuario sin nombre'}
            </h1>
            <p className="user-email">{user?.email}</p>
            <p className="user-stats">
              📅 Miembro desde:{' '}
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString(
                    'es-ES'
                  )
                : 'Fecha no disponible'}
            </p>
            <p className="user-stats">
              🔄 Último acceso:{' '}
              {user?.metadata?.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString(
                    'es-ES'
                  )
                : 'No disponible'}
            </p>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message.text && (
          <div
            className={`message ${
              message.type === 'success' ? 'message--success' : 'message--error'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Información del perfil */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">📋 Información del Perfil</h2>
            {!isEditing && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Editar
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="input-group">
                <label htmlFor="displayName" className="input-label">
                  Nombre completo:
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="password-section">
                <h3 className="subsection-title">🔐 Cambiar Contraseña</h3>
                <p className="subsection-text">
                  Deja estos campos vacíos si no deseas cambiar tu contraseña
                </p>

                <div className="input-group">
                  <label htmlFor="newPassword" className="input-label">
                    Nueva contraseña:
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword" className="input-label">
                    Confirmar nueva contraseña:
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Confirmar nueva contraseña"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="save-button"
                  style={{
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? '🔄 Guardando...' : '💾 Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="cancel-button"
                  disabled={loading}
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-data">
              <div className="data-item">
                <strong className="data-label">Nombre:</strong>
                <span className="data-value">
                  {user?.displayName || 'No configurado'}
                </span>
              </div>
              <div className="data-item">
                <strong className="data-label">Email:</strong>
                <span className="data-value">{user?.email}</span>
              </div>
              <div className="data-item">
                <strong className="data-label">Estado de verificación:</strong>
                <span
                  className={`data-value ${
                    user?.emailVerified
                      ? 'data-value--verified'
                      : 'data-value--unverified'
                  }`}
                >
                  {user?.emailVerified ? '✅ Verificado' : '❌ No verificado'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección de actividad reciente */}
        <div className="profile-section">
          <h2 className="section-title">📊 Estadísticas</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🌱</div>
              <div className="stat-info">
                <div className="stat-number">0</div>
                <div className="stat-label">Semillas registradas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <div className="stat-number">0</div>
                <div className="stat-label">Intercambios realizados</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">0</div>
                <div className="stat-label">Conexiones</div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="logout-section">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
