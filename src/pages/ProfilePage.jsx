// src/pages/ProfilePage.jsx
// Página de perfil del usuario con edición de información

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth'
import { useAuth } from '../contexts/AuthContext'
import LogoutButton from '../components/auth/LogoutButton'

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
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorMessage}>
            <h2 style={styles.errorTitle}>🔒 Acceso restringido</h2>
            <p style={styles.errorText}>
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
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header del perfil */}
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>
            {user?.displayName?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() ||
              '👤'}
          </div>
          <div style={styles.userInfo}>
            <h1 style={styles.userName}>
              {user?.displayName || 'Usuario sin nombre'}
            </h1>
            <p style={styles.userEmail}>{user?.email}</p>
            <p style={styles.userStats}>
              📅 Miembro desde:{' '}
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString(
                    'es-ES'
                  )
                : 'Fecha no disponible'}
            </p>
            <p style={styles.userStats}>
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
            style={{
              ...styles.message,
              backgroundColor:
                message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb',
            }}
          >
            {message.text}
          </div>
        )}

        {/* Información del perfil */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📋 Información del Perfil</h2>
            {!isEditing && (
              <button
                style={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                ✏️ Editar
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre completo:</label>
                <input
                  type="text"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="tu@email.com"
                />
              </div>

              <div style={styles.passwordSection}>
                <h3 style={styles.subsectionTitle}>🔐 Cambiar Contraseña</h3>
                <p style={styles.subsectionText}>
                  Deja estos campos vacíos si no deseas cambiar tu contraseña
                </p>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nueva contraseña:</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Confirmar nueva contraseña:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Confirmar nueva contraseña"
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.saveButton,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? '🔄 Guardando...' : '💾 Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.profileData}>
              <div style={styles.dataItem}>
                <strong style={styles.dataLabel}>Nombre:</strong>
                <span style={styles.dataValue}>
                  {user?.displayName || 'No configurado'}
                </span>
              </div>
              <div style={styles.dataItem}>
                <strong style={styles.dataLabel}>Email:</strong>
                <span style={styles.dataValue}>{user?.email}</span>
              </div>
              <div style={styles.dataItem}>
                <strong style={styles.dataLabel}>
                  Estado de verificación:
                </strong>
                <span
                  style={{
                    ...styles.dataValue,
                    color: user?.emailVerified ? '#28a745' : '#dc3545',
                  }}
                >
                  {user?.emailVerified ? '✅ Verificado' : '❌ No verificado'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección de actividad reciente */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📊 Estadísticas</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🌱</div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>Semillas registradas</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🔄</div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>Intercambios realizados</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>Conexiones</div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div style={styles.logoutSection}>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

// Estilos
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    width: '100%',
    maxWidth: '700px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e9ecef',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    marginRight: '20px',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  userEmail: {
    fontSize: '16px',
    color: '#667eea',
    marginBottom: '8px',
  },
  userStats: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '4px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '0',
  },
  editButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  profileData: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dataItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  dataLabel: {
    minWidth: '120px',
    fontSize: '14px',
    color: '#2c3e50',
  },
  dataValue: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
    outline: 'none',
  },
  passwordSection: {
    marginTop: '16px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  subsectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '8px',
  },
  subsectionText: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '16px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  saveButton: {
    flex: 1,
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cancelButton: {
    flex: 1,
    background: 'transparent',
    color: '#dc3545',
    border: '2px solid #dc3545',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
  },
  statIcon: {
    fontSize: '24px',
    marginRight: '12px',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutSection: {
    textAlign: 'center',
    borderTop: '1px solid #e9ecef',
    paddingTop: '20px',
  },
  errorMessage: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: '12px',
  },
  errorText: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '0',
  },
}

export default ProfilePage
