// src/pages/ProfilePage.jsx
// BLOQUE 8 - PASO 2.1: Página de perfil refactorizada con secciones organizadas
// Implementa edición de información personal con validaciones estrictas
// BLOQUE 8 - PASO 3.2: Integra componente UserStatsCard reutilizable
// BLOQUE 8 - PASO 6.1: Integra historial de intercambios desde perfil

import { useState, useEffect, useCallback } from 'react'
import { updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LogoutButton from '../components/auth/LogoutButton'
import UserStatsCard from '../components/profile/UserStatsCard'
import DeleteSeedModal from '../components/profile/DeleteSeedModal'
import ExchangeCard from '../components/exchanges/ExchangeCard'
import ExchangeFilters from '../components/exchanges/ExchangeFilters'
import {
  getUserProfile,
  updateUserProfile,
  calculateUserStats,
  validateUserForExchanges,
} from '../services/userProfileService'
import {
  getUserSeeds,
  updateSeed,
  deleteSeedWithValidation,
} from '../services/seedService'
import {
  getUserExchangesReceived,
  getUserExchangesSent,
} from '../services/exchangeService'
import useProfileValidator from '../hooks/useProfileValidator'
import './ProfilePage.css'

function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Estados para el perfil completo del usuario
  const [profileData, setProfileData] = useState({
    name: '',
    location: '',
    whatsapp: '',
    email: '',
    registrationDate: null,
  })

  // Estados para edición por sección
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)

  // Estados de carga y mensajes
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Estados para estadísticas (PASO 3.1: Panel de estadísticas de actividad)
  const [userStats, setUserStats] = useState({
    seedsRegistered: 0,
    exchangesCompleted: 0,
    exchangesPending: 0,
    mostPopularSeed: {
      seedId: null,
      name: null,
      requestCount: 0,
    },
  })
  const [loadingStats, setLoadingStats] = useState(false)

  // Estados para gestión de semillas propias (PASO 4.1: Gestión de semillas)
  const [userSeeds, setUserSeeds] = useState([])
  const [loadingSeeds, setLoadingSeeds] = useState(false)
  const [seedsFilter, setSeedsFilter] = useState('all') // 'all', 'available', 'unavailable'
  const [seedsPage, setSeedsPage] = useState(1)
  const [seedsPerPage] = useState(6) // número de semillas por página

  // BLOQUE 8 - PASO 4.2: Estados para modal de eliminación de semillas
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    seed: null,
    loading: false,
    validationError: null,
  })

  // BLOQUE 8 - PASO 6.1: Estados para historial de intercambios
  const [userExchanges, setUserExchanges] = useState([])
  const [loadingExchanges, setLoadingExchanges] = useState(false)
  const [exchangesFilter, setExchangesFilter] = useState('all') // 'all', 'pending', 'completed'

  // BLOQUE 8 - PASO 7.1: Estado para validaciones de intercambio
  const [exchangeValidation, setExchangeValidation] = useState({
    canExchange: false,
    missingFields: [],
    issues: [],
    warnings: [],
    fieldsStatus: {
      hasName: false,
      hasWhatsapp: false,
      hasLocation: false,
      allowsRequests: true,
    },
    completionStatus: {
      name: false,
      whatsapp: false,
      location: false,
      privacy: true,
    },
  })

  // Estados temporales para edición de información personal
  const [tempPersonalData, setTempPersonalData] = useState({
    name: '',
    location: '',
    whatsapp: '',
  })

  // Hook de validación para el formulario de perfil
  const {
    isValid: isFormValid,
    getFieldState,
    markFieldAsTouched,
    validateForm,
    resetValidation,
  } = useProfileValidator(tempPersonalData)

  // Cargar perfil del usuario desde Firestore
  const loadUserProfile = useCallback(async () => {
    if (!user?.uid) return

    setLoadingProfile(true)
    setLoadingStats(true)
    try {
      // Cargar datos del perfil
      const profileResponse = await getUserProfile(user.uid)
      const profile = profileResponse?.data || {} // 👈 Acceder a los datos correctamente

      // Preparar datos del perfil con valores por defecto
      const profileInfo = {
        name: profile?.name || user.displayName || '',
        location: profile?.location || '',
        whatsapp: profile?.whatsappNumber || '', // 👈 Ahora sí accederá correctamente
        email: user.email || '',
        registrationDate:
          profile?.registrationDate || user.metadata?.creationTime || null,
      }

      setProfileData(profileInfo)

      // Cargar estadísticas (PASO 3.1: Panel de estadísticas de actividad)
      const statsResponse = await calculateUserStats(user.uid)
      const stats = statsResponse?.data || {} // 👈 Acceder a los datos correctamente

      // BLOQUE 8 - PASO 7.1: Validar perfil para intercambios
      const validationResponse = await validateUserForExchanges(profile)
      setExchangeValidation(validationResponse.data)

      // Mapear estadísticas al estado local
      setUserStats({
        seedsRegistered: stats.seedsRegistered || 0,
        exchangesCompleted: stats.exchangesCompleted || 0,
        exchangesPending: stats.exchangesPending || 0,
        mostPopularSeed: stats.mostRequestedSeed || {
          seedId: null,
          name: null,
          requestCount: 0,
        },
      })
    } catch (error) {
      console.error('Error al cargar perfil:', error)
      setMessage({
        type: 'error',
        text: '❌ Error al cargar los datos del perfil',
      })
    } finally {
      setLoadingProfile(false)
      setLoadingStats(false)
    }
  }, [user])

  // BLOQUE 8 - PASO 4.1: Cargar semillas del usuario desde Firestore
  const loadUserSeeds = useCallback(async () => {
    if (!user?.uid) return

    setLoadingSeeds(true)
    try {
      console.log('🌱 Cargando semillas del usuario...')
      const seedsResponse = await getUserSeeds(user.uid, {
        limit: 50, // Cargar más semillas para filtrado y paginación
        orderByField: 'createdAt',
        orderDirection: 'desc',
      })

      if (seedsResponse.success) {
        setUserSeeds(seedsResponse.data || [])
        console.log('✅ Semillas cargadas:', seedsResponse.data.length)
      } else {
        console.error('Error cargando semillas:', seedsResponse.error)
        setMessage({
          type: 'error',
          text: '❌ Error al cargar tus semillas',
        })
      }
    } catch (error) {
      console.error('Error inesperado cargando semillas:', error)
      setMessage({
        type: 'error',
        text: '❌ Error inesperado al cargar semillas',
      })
    } finally {
      setLoadingSeeds(false)
    }
  }, [user])

  // BLOQUE 8 - PASO 6.1: Cargar intercambios del usuario desde Firestore
  const loadUserExchanges = useCallback(async () => {
    if (!user?.uid) return

    setLoadingExchanges(true)
    try {
      console.log('🔄 Cargando intercambios del usuario...')

      // Obtener intercambios recibidos y enviados en paralelo
      const [receivedResponse, sentResponse] = await Promise.all([
        getUserExchangesReceived(user.uid),
        getUserExchangesSent(user.uid),
      ])

      let allExchanges = []

      // Combinar intercambios recibidos
      if (receivedResponse.success) {
        allExchanges = [...allExchanges, ...receivedResponse.data]
      }

      // Combinar intercambios enviados
      if (sentResponse.success) {
        allExchanges = [...allExchanges, ...sentResponse.data]
      }

      // Eliminar duplicados por ID y ordenar por fecha más reciente
      const uniqueExchanges = Array.from(
        new Map(allExchanges.map(exchange => [exchange.id, exchange])).values()
      ).sort((a, b) => {
        const dateA = a.updatedAt?.toDate?.() || a.updatedAt || new Date(0)
        const dateB = b.updatedAt?.toDate?.() || b.updatedAt || new Date(0)
        return dateB - dateA
      })

      // Limitar a los últimos 5 para el resumen del perfil
      const recentExchanges = uniqueExchanges.slice(0, 5)

      setUserExchanges(recentExchanges)
      console.log('✅ Intercambios cargados:', recentExchanges.length)
    } catch (error) {
      console.error('Error al cargar intercambios:', error)
      setMessage({
        type: 'error',
        text: '❌ Error al cargar el historial de intercambios',
      })
    } finally {
      setLoadingExchanges(false)
    }
  }, [user])

  // TODOS LOS HOOKS ANTES DEL EARLY RETURN

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    if (user) {
      loadUserProfile()
      loadUserSeeds() // Cargar semillas al mismo tiempo
      loadUserExchanges() // Cargar historial de intercambios
    }
  }, [user, loadUserProfile, loadUserSeeds, loadUserExchanges])

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // BLOQUE 8 - PASO 4.1: Funciones auxiliares para gestión de semillas

  // Filtrar semillas según el filtro activo
  const getFilteredSeeds = useCallback(() => {
    if (!userSeeds.length) return []

    switch (seedsFilter) {
      case 'available':
        return userSeeds.filter(seed => seed.isAvailableForExchange === true)
      case 'unavailable':
        return userSeeds.filter(seed => seed.isAvailableForExchange === false)
      case 'all':
      default:
        return userSeeds
    }
  }, [userSeeds, seedsFilter])

  // Obtener semillas paginadas
  const getPaginatedSeeds = useCallback(() => {
    const filteredSeeds = getFilteredSeeds()
    const startIndex = (seedsPage - 1) * seedsPerPage
    const endIndex = startIndex + seedsPerPage
    return filteredSeeds.slice(startIndex, endIndex)
  }, [getFilteredSeeds, seedsPage, seedsPerPage])

  // Cambiar disponibilidad de semilla
  const toggleSeedAvailability = async (seedId, currentAvailability) => {
    try {
      console.log(`🔄 Cambiando disponibilidad de semilla ${seedId}`)
      const result = await updateSeed(
        seedId,
        {
          isAvailableForExchange: !currentAvailability,
        },
        user.uid
      )

      if (result.success) {
        // Actualizar localmente
        setUserSeeds(prevSeeds =>
          prevSeeds.map(seed =>
            seed.id === seedId
              ? { ...seed, isAvailableForExchange: !currentAvailability }
              : seed
          )
        )
        setMessage({
          type: 'success',
          text: `✅ Disponibilidad ${!currentAvailability ? 'activada' : 'desactivada'}`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error)
      setMessage({
        type: 'error',
        text: '❌ Error al cambiar disponibilidad',
      })
    }
  }

  // BLOQUE 8 - PASO 4.2: Eliminar semilla con validaciones y modal
  const handleDeleteSeed = async seedId => {
    console.log(`🗑️ Iniciando eliminación de semilla ${seedId}`)

    // Buscar datos completos de la semilla
    const seedToDelete = userSeeds.find(seed => seed.id === seedId)
    if (!seedToDelete) {
      setMessage({
        type: 'error',
        text: '❌ Semilla no encontrada',
      })
      return
    }

    // Abrir modal de confirmación
    setDeleteModal({
      isOpen: true,
      seed: seedToDelete,
      loading: false,
      validationError: null,
    })
  }

  // BLOQUE 8 - PASO 4.2: Confirmar eliminación de semilla con validaciones
  const confirmDeleteSeed = async () => {
    if (!deleteModal.seed) return

    // Activar loading del modal
    setDeleteModal(prev => ({ ...prev, loading: true, validationError: null }))

    try {
      console.log(`🗑️ Ejecutando eliminación de semilla ${deleteModal.seed.id}`)

      // Usar la función mejorada con validaciones
      const result = await deleteSeedWithValidation(
        deleteModal.seed.id,
        user.uid
      )

      if (result.success) {
        // Remover de la lista local
        setUserSeeds(prevSeeds =>
          prevSeeds.filter(seed => seed.id !== deleteModal.seed.id)
        )

        // Cerrar modal
        setDeleteModal({
          isOpen: false,
          seed: null,
          loading: false,
          validationError: null,
        })

        // Mostrar mensaje de éxito
        setMessage({
          type: 'success',
          text: '✅ Semilla eliminada exitosamente',
        })

        // Recargar estadísticas
        if (user?.uid) {
          calculateUserStats(user.uid, true).then(statsResult => {
            if (statsResult.success) {
              setUserStats(statsResult.data)
            }
          })
        }
      } else {
        // Error con validaciones específicas
        setDeleteModal(prev => ({
          ...prev,
          loading: false,
          validationError: result,
        }))
      }
    } catch (error) {
      console.error('Error eliminando semilla:', error)

      // Mostrar error en el modal
      setDeleteModal(prev => ({
        ...prev,
        loading: false,
        validationError: {
          error: 'UNKNOWN_ERROR',
          userMessage:
            'Error inesperado al eliminar la semilla. Intenta nuevamente.',
        },
      }))
    }
  }

  // BLOQUE 8 - PASO 4.2: Cerrar modal de eliminación
  const closeDeleteModal = () => {
    if (!deleteModal.loading) {
      setDeleteModal({
        isOpen: false,
        seed: null,
        loading: false,
        validationError: null,
      })
    }
  }

  // BLOQUE 8 - PASO 6.1: Funciones para historial de intercambios

  // Filtrar intercambios según el filtro activo
  const getFilteredExchanges = useCallback(() => {
    if (!userExchanges.length) return []

    switch (exchangesFilter) {
      case 'pending':
        return userExchanges.filter(
          exchange =>
            exchange.status === 'pending' || exchange.status === 'accepted'
        )
      case 'completed':
        return userExchanges.filter(
          exchange =>
            exchange.status === 'completed' || exchange.status === 'rejected'
        )
      case 'all':
      default:
        return userExchanges
    }
  }, [userExchanges, exchangesFilter])

  // Redirigir a página completa de intercambios
  const handleViewAllExchanges = () => {
    navigate('/exchanges')
  }

  // Validar información personal en tiempo real
  // (Ahora manejado por el hook useProfileValidator)

  // Manejar cambios en información personal
  const handlePersonalInfoChange = e => {
    const { name, value } = e.target
    const newData = { ...tempPersonalData, [name]: value }
    setTempPersonalData(newData)

    // Marcar campo como tocado para activar validación
    markFieldAsTouched(name)
  }

  // Iniciar edición de información personal
  const startEditingPersonalInfo = () => {
    setTempPersonalData({
      name: profileData.name,
      location: profileData.location,
      whatsapp: profileData.whatsapp,
    })
    resetValidation()
    setIsEditingPersonalInfo(true)
  }

  // BLOQUE 8 - PASO 2.3: Guardar información personal con integración completa Firebase
  const savePersonalInfo = async () => {
    // Validar formulario completo antes de guardar
    const isValid = validateForm()

    if (!isValid) {
      setMessage({
        type: 'error',
        text: '❌ Corrige los errores antes de guardar',
      })
      return
    }

    setLoading(true)
    try {
      // Preparar datos para actualizar
      const updatedData = {
        name: tempPersonalData.name.trim(),
        location: tempPersonalData.location.trim(),
        whatsappNumber: tempPersonalData.whatsapp.trim(), // 👈 Corregido: usar whatsappNumber
        email: user.email, // AÑADIR EMAIL PARA VALIDACIÓN
      }

      console.log('🔄 Iniciando guardado de perfil:', updatedData)

      // 1. Integrar con userProfileService.updateUserProfile() para guardar cambios
      const result = await updateUserProfile(user.uid, updatedData)

      if (!result.success) {
        throw new Error(result.message || 'Error al actualizar el perfil')
      }

      // 2. Actualizar contexto de autenticación con nuevos datos (Firebase Auth)
      if (tempPersonalData.name.trim() !== user.displayName) {
        await updateProfile(user, {
          displayName: tempPersonalData.name.trim(),
        })
        console.log('✅ Nombre actualizado en Firebase Auth')
      }

      // 3. Refrescar datos en tiempo real tras guardado exitoso
      setProfileData(prev => ({
        ...prev,
        name: updatedData.name,
        location: updatedData.location,
        whatsapp: updatedData.whatsappNumber, // 👈 Corregido: usar whatsappNumber del objeto enviado
      }))

      // PASO 3.1: Refrescar estadísticas después de cambios
      try {
        const statsResponse = await calculateUserStats(user.uid, true) // Forzar refresh
        const stats = statsResponse?.data || {}
        setUserStats({
          seedsRegistered: stats.seedsRegistered || 0,
          exchangesCompleted: stats.exchangesCompleted || 0,
          exchangesPending: stats.exchangesPending || 0,
          mostPopularSeed: stats.mostRequestedSeed || {
            seedId: null,
            name: null,
            requestCount: 0,
          },
        })
      } catch (statsError) {
        console.warn('⚠️ Error refrescando estadísticas:', statsError)
        // No marcar como error porque el guardado fue exitoso
      }

      // BLOQUE 8 - PASO 7.1: Revalidar perfil para intercambios después de guardar
      try {
        const newValidationResponse = await validateUserForExchanges({
          ...profileData,
          whatsappNumber: tempPersonalData.whatsapp.trim(),
          name: tempPersonalData.name.trim(),
          location: tempPersonalData.location.trim(),
        })
        setExchangeValidation(newValidationResponse.data)
      } catch (validationError) {
        console.warn(
          '⚠️ Error revalidando perfil para intercambios:',
          validationError
        )
      }

      // Salir del modo edición
      setIsEditingPersonalInfo(false)
      resetValidation()

      // 4. Mostrar mensaje de éxito apropiado
      setMessage({
        type: 'success',
        text: '✅ Información personal actualizada correctamente',
      })

      console.log('✅ Perfil guardado exitosamente')
    } catch (error) {
      console.error('❌ Error al actualizar información personal:', error)

      // 5. Manejar casos especiales (sin conexión, errores de Firebase)
      let errorMessage

      if (error.code === 'unavailable' || error.message.includes('network')) {
        errorMessage =
          '❌ Sin conexión. Verifica tu internet e intenta de nuevo'
      } else if (error.code === 'permission-denied') {
        errorMessage = '❌ No tienes permisos para actualizar este perfil'
      } else if (error.message.includes('Datos inválidos')) {
        errorMessage = `❌ ${error.message}`
      } else {
        errorMessage = `❌ Error: ${error.message}`
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Cancelar edición de información personal
  const cancelEditPersonalInfo = () => {
    setTempPersonalData({
      name: profileData.name,
      location: profileData.location,
      whatsapp: profileData.whatsapp,
    })
    resetValidation()
    setIsEditingPersonalInfo(false)
    setMessage({ type: '', text: '' })
  }

  // Formatear fecha
  const formatDate = useCallback(dateValue => {
    if (!dateValue) return 'No disponible'

    try {
      if (dateValue.toDate) {
        // Timestamp de Firestore
        return dateValue.toDate().toLocaleDateString('es-ES')
      } else if (typeof dateValue === 'string') {
        // String de fecha
        return new Date(dateValue).toLocaleDateString('es-ES')
      } else if (dateValue instanceof Date) {
        // Objeto Date
        return dateValue.toLocaleDateString('es-ES')
      }
      return 'Fecha no disponible'
    } catch {
      return 'Fecha no disponible'
    }
  }, [])

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

  if (loadingProfile) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-message">
            <h2>🔄 Cargando perfil...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Header del perfil */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profileData.name?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() ||
              '👤'}
          </div>
          <div className="user-info">
            <h1 className="user-name">
              {profileData.name || 'Usuario sin nombre'}
            </h1>
            <p className="user-email">{profileData.email}</p>
            <p className="user-stats">
              📅 Miembro desde: {formatDate(profileData.registrationDate)}
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

        {/* BLOQUE 8 - PASO 7.1: Banner de validación para intercambios */}
        {!exchangeValidation.canExchange && (
          <div className="exchange-validation-banner">
            <div className="banner-icon">⚠️</div>
            <div className="banner-content">
              <h3 className="banner-title">
                Completa tu perfil para intercambiar semillas
              </h3>
              <p className="banner-description">
                Para participar en intercambios de semillas, necesitas completar
                la siguiente información:
              </p>

              {/* Checklist de campos requeridos */}
              <ul className="profile-requirements-checklist">
                <li
                  className={
                    exchangeValidation.completionStatus?.name
                      ? 'completed'
                      : 'pending'
                  }
                >
                  {exchangeValidation.completionStatus?.name ? '✅' : '⬜'}{' '}
                  Nombre completo
                </li>
                <li
                  className={
                    exchangeValidation.completionStatus?.location
                      ? 'completed'
                      : 'pending'
                  }
                >
                  {exchangeValidation.completionStatus?.location ? '✅' : '⬜'}{' '}
                  Ubicación
                </li>
                <li
                  className={
                    exchangeValidation.completionStatus?.whatsapp
                      ? 'completed'
                      : 'pending'
                  }
                >
                  {exchangeValidation.completionStatus?.whatsapp ? '✅' : '⬜'}{' '}
                  Número de WhatsApp (formato ecuatoriano)
                </li>
                {!exchangeValidation.completionStatus?.privacy && (
                  <li className="pending">
                    ⬜ Habilitar recepción de solicitudes en configuración de
                    privacidad
                  </li>
                )}
              </ul>

              {/* Botón para editar información */}
              {!isEditingPersonalInfo && (
                <button
                  className="edit-profile-button"
                  onClick={startEditingPersonalInfo}
                >
                  Editar información
                </button>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">👤 Información Personal</h2>
            {!isEditingPersonalInfo && (
              <button
                className="edit-button"
                onClick={startEditingPersonalInfo}
              >
                ✏️ Editar
              </button>
            )}
          </div>

          {isEditingPersonalInfo ? (
            <div className="section-form">
              <div className="input-group">
                <label htmlFor="name" className="input-label">
                  Nombre completo *:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={tempPersonalData.name}
                  onChange={handlePersonalInfoChange}
                  onBlur={() => markFieldAsTouched('name')}
                  className={`input-field ${getFieldState('name').className}`}
                  placeholder="Tu nombre completo"
                  maxLength={50}
                />
                {getFieldState('name').hasError && (
                  <span className="error-text">
                    {getFieldState('name').message}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="location" className="input-label">
                  Ubicación:
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={tempPersonalData.location}
                  onChange={handlePersonalInfoChange}
                  onBlur={() => markFieldAsTouched('location')}
                  className={`input-field ${getFieldState('location').className}`}
                  placeholder="Tu ciudad, provincia, etc."
                  maxLength={100}
                />
                {getFieldState('location').hasError && (
                  <span className="error-text">
                    {getFieldState('location').message}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="whatsapp" className="input-label">
                  WhatsApp:
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={tempPersonalData.whatsapp}
                  onChange={handlePersonalInfoChange}
                  onBlur={() => markFieldAsTouched('whatsapp')}
                  className={`input-field ${getFieldState('whatsapp').className}`}
                  placeholder="+593987654321 o 0987654321"
                />
                {getFieldState('whatsapp').hasError && (
                  <span className="error-text">
                    {getFieldState('whatsapp').message}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="email-readonly" className="input-label">
                  Email:
                </label>
                <input
                  id="email-readonly"
                  type="email"
                  value={profileData.email}
                  className="input-field input-field--readonly"
                  disabled
                />
                <span className="input-help">
                  El email no se puede modificar
                </span>
              </div>

              <div className="input-group">
                <label htmlFor="registration-date" className="input-label">
                  Fecha de registro:
                </label>
                <input
                  id="registration-date"
                  type="text"
                  value={formatDate(profileData.registrationDate)}
                  className="input-field input-field--readonly"
                  disabled
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={savePersonalInfo}
                  disabled={loading || !isFormValid}
                  className="save-button"
                  style={{
                    opacity: loading || !isFormValid ? 0.6 : 1,
                    cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? '🔄 Guardando...' : '💾 Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditPersonalInfo}
                  className="cancel-button"
                  disabled={loading}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="section-data">
              <div className="data-item">
                <strong className="data-label">Nombre:</strong>
                <span className="data-value">
                  {profileData.name || 'No configurado'}
                </span>
              </div>
              <div className="data-item">
                <strong className="data-label">Ubicación:</strong>
                <span className="data-value">
                  {profileData.location || 'No especificada'}
                </span>
              </div>
              <div className="data-item">
                <strong className="data-label">WhatsApp:</strong>
                <span className="data-value">
                  {profileData.whatsapp || 'No configurado'}
                </span>
              </div>
              <div className="data-item">
                <strong className="data-label">Email:</strong>
                <span className="data-value">{profileData.email}</span>
              </div>
              <div className="data-item">
                <strong className="data-label">Fecha de registro:</strong>
                <span className="data-value">
                  {formatDate(profileData.registrationDate)}
                </span>
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

        {/* PASO 3.1: SECCIÓN DE ESTADÍSTICAS DE ACTIVIDAD */}
        <div className="profile-section">
          <h2 className="section-title">📊 Mi Actividad</h2>
          <div className="stats-grid">
            {/* Tarjeta 1: Semillas Registradas */}
            <UserStatsCard
              title="Semillas registradas"
              value={userStats.seedsRegistered}
              icon="🌱"
              loading={loadingStats}
              clickable={!loadingStats}
              onClick={() => {
                console.log('🌱 Navegando a "Mis Semillas"')
                // TODO: Implementar navegación cuando exista la página
              }}
            />

            {/* Tarjeta 2: Intercambios Completados */}
            <UserStatsCard
              title="Intercambios completados"
              value={userStats.exchangesCompleted}
              icon="✅"
              loading={loadingStats}
              clickable={!loadingStats}
              onClick={() => {
                console.log('✅ Navegando a "Intercambios Completados"')
                // TODO: Implementar navegación cuando exista la página
              }}
            />

            {/* Tarjeta 3: Intercambios Pendientes */}
            <UserStatsCard
              title="Intercambios pendientes"
              value={userStats.exchangesPending}
              icon="🔄"
              loading={loadingStats}
              clickable={!loadingStats}
              onClick={() => {
                console.log('🔄 Navegando a "Intercambios Activos"')
                // TODO: Implementar navegación cuando exista la página
              }}
            />

            {/* Tarjeta 4: Semilla Más Popular */}
            <UserStatsCard
              title={
                userStats.mostPopularSeed?.name
                  ? `"${userStats.mostPopularSeed.name}" (más solicitada)`
                  : 'Semilla más popular'
              }
              value={userStats.mostPopularSeed?.requestCount || 0}
              icon="⭐"
              loading={loadingStats}
              clickable={false}
            />
          </div>

          {/* Enlaces adicionales a secciones relacionadas */}
          <div className="activity-links">
            <button
              className="activity-link"
              onClick={() => {
                console.log('📋 Navegando a "Ver todas mis semillas"')
                // TODO: Implementar navegación cuando exista la página
              }}
            >
              📋 Ver todas mis semillas
            </button>
            <button
              className="activity-link"
              onClick={() => {
                console.log('📈 Navegando a "Historial completo"')
                // TODO: Implementar navegación cuando exista la página
              }}
            >
              📈 Historial completo
            </button>
          </div>
        </div>

        {/* PASO 4.1: SECCIÓN MIS SEMILLAS */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">🌱 Mis Semillas</h2>
            <span className="seeds-count">
              {userSeeds.length} semilla{userSeeds.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filtros básicos */}
          <div className="seeds-filters">
            <button
              className={`filter-button ${seedsFilter === 'all' ? 'filter-button--active' : ''}`}
              onClick={() => {
                setSeedsFilter('all')
                setSeedsPage(1) // Reset página al cambiar filtro
              }}
            >
              📦 Todas ({userSeeds.length})
            </button>
            <button
              className={`filter-button ${seedsFilter === 'available' ? 'filter-button--active' : ''}`}
              onClick={() => {
                setSeedsFilter('available')
                setSeedsPage(1)
              }}
            >
              ✅ Disponibles (
              {userSeeds.filter(s => s.isAvailableForExchange).length})
            </button>
            <button
              className={`filter-button ${seedsFilter === 'unavailable' ? 'filter-button--active' : ''}`}
              onClick={() => {
                setSeedsFilter('unavailable')
                setSeedsPage(1)
              }}
            >
              ❌ No disponibles (
              {userSeeds.filter(s => !s.isAvailableForExchange).length})
            </button>
          </div>

          {/* Lista de semillas */}
          {loadingSeeds ? (
            // Estado de carga
            <div className="seeds-loading">
              <div className="loading-text">🔄 Cargando tus semillas...</div>
              <div className="seeds-grid">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="seed-card seed-card--loading">
                    <div className="seed-image-placeholder"></div>
                    <div className="seed-info">
                      <div className="seed-name-placeholder"></div>
                      <div className="seed-category-placeholder"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : getPaginatedSeeds().length === 0 ? (
            // Estado de lista vacía
            <div className="seeds-empty">
              {getFilteredSeeds().length === 0 ? (
                userSeeds.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🌱</div>
                    <h3>No tienes semillas registradas</h3>
                    <p>
                      ¡Registra tu primera semilla para comenzar a intercambiar!
                    </p>
                    <button
                      className="empty-action-button"
                      onClick={() => {
                        console.log('📝 Navegando a "Registrar semilla"')
                        // TODO: Implementar navegación a registro de semillas
                      }}
                    >
                      📝 Registrar mi primera semilla
                    </button>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No hay semillas en esta categoría</h3>
                    <p>Prueba con otro filtro o registra más semillas.</p>
                  </div>
                )
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>No hay más semillas en esta página</h3>
                  <p>Ve a la página anterior o cambia el filtro.</p>
                </div>
              )}
            </div>
          ) : (
            // Lista de semillas con datos
            <div className="seeds-content">
              <div className="seeds-grid">
                {getPaginatedSeeds().map(seed => (
                  <div key={seed.id} className="seed-card">
                    {/* Imagen de la semilla */}
                    <div className="seed-image-container">
                      {seed.imageUrl ? (
                        <img
                          src={seed.imageUrl}
                          alt={seed.name}
                          className="seed-image"
                          onError={e => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div
                        className="seed-image-fallback"
                        style={{ display: seed.imageUrl ? 'none' : 'flex' }}
                      >
                        🌱
                      </div>
                    </div>

                    {/* Información principal */}
                    <div className="seed-info">
                      <h4 className="seed-name">{seed.name}</h4>
                      <p className="seed-category">
                        📂 {seed.category || 'Sin categoría'}
                      </p>
                      <p className="seed-date">
                        📅 {formatDate(seed.createdAt)}
                      </p>
                    </div>

                    {/* Switch de disponibilidad */}
                    <div className="seed-availability">
                      <label className="availability-switch">
                        <span className="availability-label">
                          {seed.isAvailableForExchange
                            ? '✅ Disponible'
                            : '❌ No disponible'}
                        </span>
                        <input
                          type="checkbox"
                          checked={seed.isAvailableForExchange || false}
                          onChange={() =>
                            toggleSeedAvailability(
                              seed.id,
                              seed.isAvailableForExchange
                            )
                          }
                          className="switch-input"
                        />
                        <span className="switch-slider"></span>
                      </label>
                    </div>

                    {/* Botones de acción */}
                    <div className="seed-actions">
                      <button
                        className="action-button action-button--view"
                        onClick={() => {
                          console.log('👁️ Ver detalles de semilla:', seed.id)
                          // TODO: Implementar modal de detalles
                        }}
                        title="Ver detalles"
                      >
                        👁️ Ver
                      </button>
                      <button
                        className="action-button action-button--edit"
                        onClick={() => {
                          console.log('✏️ Editar semilla:', seed.id)
                          // TODO: Implementar modal de edición
                        }}
                        title="Editar semilla"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="action-button action-button--delete"
                        onClick={() => handleDeleteSeed(seed.id)}
                        title="Eliminar semilla"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación simple */}
              {getFilteredSeeds().length > seedsPerPage && (
                <div className="seeds-pagination">
                  <button
                    className="pagination-button"
                    onClick={() => setSeedsPage(prev => Math.max(1, prev - 1))}
                    disabled={seedsPage === 1}
                  >
                    ⬅️ Anterior
                  </button>

                  <span className="pagination-info">
                    Página {seedsPage} de{' '}
                    {Math.ceil(getFilteredSeeds().length / seedsPerPage)}
                  </span>

                  <button
                    className="pagination-button"
                    onClick={() =>
                      setSeedsPage(prev =>
                        Math.min(
                          Math.ceil(getFilteredSeeds().length / seedsPerPage),
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      seedsPage >=
                      Math.ceil(getFilteredSeeds().length / seedsPerPage)
                    }
                  >
                    Siguiente ➡️
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PASO 6.1: SECCIÓN HISTORIAL DE INTERCAMBIOS */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">📜 Historial de Intercambios</h2>
            <span className="exchanges-count">
              {userExchanges.length} intercambio
              {userExchanges.length !== 1 ? 's' : ''}
            </span>
            <button
              className="view-all-button"
              onClick={handleViewAllExchanges}
            >
              � Ver todos
            </button>
          </div>

          {/* Filtros rápidos usando ExchangeFilters */}
          <ExchangeFilters
            exchanges={userExchanges}
            activeFilter={exchangesFilter}
            onFilterChange={setExchangesFilter}
            showOnly={['all', 'pending', 'completed']}
          />

          {/* Lista de intercambios */}
          {loadingExchanges ? (
            // Estado de carga
            <div className="exchanges-loading">
              <div className="loading-text">🔄 Cargando tu historial...</div>
              <div className="exchanges-grid">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="exchange-card exchange-card--loading"
                  >
                    <div className="exchange-info-placeholder"></div>
                    <div className="exchange-details-placeholder"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : userExchanges.length === 0 ? (
            // Estado de lista vacía
            <div className="exchanges-empty">
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No hay intercambios registrados</h3>
                <p>Realiza tu primer intercambio para que aparezca aquí.</p>
                <button
                  className="empty-action-button"
                  onClick={handleViewAllExchanges}
                >
                  ➕ Explorar catálogo
                </button>
              </div>
            </div>
          ) : (
            // Lista de intercambios con datos filtrados
            <div className="exchanges-content">
              <div className="exchanges-grid">
                {getFilteredExchanges().map(exchange => (
                  <ExchangeCard
                    key={exchange.id}
                    exchange={exchange}
                    currentUserId={user?.uid}
                    onCardClick={() => {
                      console.log(
                        '👁️ Ver detalles de intercambio:',
                        exchange.id
                      )
                      handleViewAllExchanges()
                    }}
                  />
                ))}
              </div>

              {/* Enlace para ver todos los intercambios */}
              {userExchanges.length > 5 && (
                <div className="view-all-exchanges">
                  <button
                    className="view-all-link"
                    onClick={handleViewAllExchanges}
                  >
                    📋 Ver todos los intercambios ({userExchanges.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="logout-section">
          <LogoutButton />
        </div>

        {/* BLOQUE 8 - PASO 4.2: Modal de confirmación de eliminación de semilla */}
        <DeleteSeedModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteSeed}
          seed={deleteModal.seed}
          loading={deleteModal.loading}
          validationError={deleteModal.validationError}
        />
      </div>
    </div>
  )
}

export default ProfilePage
