// src/pages/CatalogPage.jsx
// Página del catálogo de semillas disponibles
// BLOQUE 6 - PASO 5: Integración completa con componentes y datos reales
// Mobile-first responsive design con CSS dedicado

import { useState, useEffect } from 'react'
import { SearchBar, SeedCard, SeedDetailModal } from '../components/catalog'
import { getPublicSeeds } from '../services/seedCatalogService'
import { getUserSeeds } from '../services/seedService'
import { getUserExchangesSent } from '../services/exchangeService'
import {
  getUserProfile,
  validateUserForExchanges,
} from '../services/userProfileService'
import { useAuth } from '../contexts/AuthContext'
import ExchangeRequestForm from '../components/exchanges/ExchangeRequestForm'
import './CatalogPage.css'

function CatalogPage() {
  // Usuario autenticado
  const { user } = useAuth()

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  // Estados para datos y UI
  const [seeds, setSeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Estados para modal
  const [selectedSeed, setSelectedSeed] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Estado para paginación
  const [lastDocId, setLastDocId] = useState(null)

  // Estados para formulario de intercambio (PASO 9)
  const [showExchangeForm, setShowExchangeForm] = useState(false)
  const [requestedSeed, setRequestedSeed] = useState(null)
  const [requestError, setRequestError] = useState(null)

  // Cargar semillas al montar el componente
  useEffect(() => {
    loadSeeds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recargar semillas cuando cambien los filtros
  useEffect(() => {
    if (searchTerm !== '' || selectedCategory !== '' || showOnlyAvailable) {
      handleFilterChange()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, showOnlyAvailable])

  // Función para cargar semillas iniciales
  const loadSeeds = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        category: selectedCategory || 'all',
        showOnlyAvailable: showOnlyAvailable,
      }

      const result = await getPublicSeeds({
        filters,
        page: 1,
        pageSize: 12,
      })

      setSeeds(result.seeds || [])
      setHasMore(result.hasMore || false)
      setLastDocId(result.lastDocId || null)
    } catch (err) {
      console.error('Error cargando semillas:', err)
      setError('Error al cargar las semillas. Intenta nuevamente.')
      setSeeds([])
    } finally {
      setLoading(false)
    }
  }

  // Función para cargar más semillas (paginación)
  const loadMoreSeeds = async () => {
    if (!hasMore || loadingMore) return

    try {
      setLoadingMore(true)

      const filters = {
        category: selectedCategory || 'all',
        showOnlyAvailable: showOnlyAvailable,
      }

      const result = await getPublicSeeds({
        filters,
        page: 2,
        pageSize: 12,
        lastDocId,
      })

      setSeeds(prevSeeds => [...prevSeeds, ...(result.seeds || [])])
      setHasMore(result.hasMore || false)
      setLastDocId(result.lastDocId || null)
    } catch (err) {
      console.error('Error cargando más semillas:', err)
      setError('Error al cargar más semillas.')
    } finally {
      setLoadingMore(false)
    }
  }

  // Manejar cambios en filtros
  const handleFilterChange = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        category: selectedCategory || 'all',
        showOnlyAvailable: showOnlyAvailable,
      }

      // Si hay término de búsqueda, incluirlo en el filtro
      if (searchTerm.trim()) {
        filters.searchTerm = searchTerm.trim()
      }

      const result = await getPublicSeeds({
        filters,
        page: 1,
        pageSize: 12,
      })

      setSeeds(result.seeds || [])
      setHasMore(result.hasMore || false)
      setLastDocId(result.lastDocId || null)
    } catch (err) {
      console.error('Error aplicando filtros:', err)
      setError('Error al aplicar filtros.')
      setSeeds([])
    } finally {
      setLoading(false)
    }
  }

  // Manejar búsqueda
  const handleSearch = term => {
    setSearchTerm(term)
  }

  // Manejar filtro de categoría
  const handleCategoryFilter = category => {
    setSelectedCategory(category)
  }

  // Manejar filtro de disponibilidad
  const handleAvailabilityFilter = availableOnly => {
    setShowOnlyAvailable(availableOnly)
  }

  // Manejar click en tarjeta de semilla
  const handleSeedClick = seed => {
    setSelectedSeed(seed)
    setIsModalOpen(true)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSeed(null)
  }

  // Manejar solicitud de intercambio (PASO 9)
  const handleRequestExchange = async seed => {
    setRequestError(null)

    // Validación 1: Usuario autenticado
    if (!user) {
      setRequestError('Debes iniciar sesión para solicitar un intercambio')
      return
    }

    // Validación 2: No puede solicitar su propia semilla
    if (seed.ownerId === user.uid) {
      setRequestError('No puedes solicitar tu propia semilla')
      return
    }

    // Validación 3: Verificar que el usuario tenga semillas registradas
    try {
      const userSeedsResult = await getUserSeeds(user.uid)
      if (!userSeedsResult.success || userSeedsResult.data.length === 0) {
        setRequestError(
          'Necesitas tener semillas registradas para poder intercambiar. Ve a "Mis Semillas" para registrar una.'
        )
        return
      }
    } catch (error) {
      console.error('Error verificando semillas del usuario:', error)
      setRequestError('Error al verificar tus semillas. Intenta nuevamente.')
      return
    }

    // Validación 4: Verificar que no existe una solicitud pendiente previa
    try {
      const response = await getUserExchangesSent(user.uid)

      // Asegurar que tenemos un array para trabajar
      const sentExchanges = Array.isArray(response)
        ? response
        : response.data || []

      const existingRequest = sentExchanges.find(
        exchange =>
          exchange.seedRequestedId === seed.id &&
          (exchange.status === 'pending' || exchange.status === 'accepted')
      )

      if (existingRequest) {
        setRequestError(
          'Ya tienes una solicitud pendiente para esta semilla. Revisa tus intercambios enviados.'
        )
        return
      }
    } catch (error) {
      console.error('Error verificando solicitudes existentes:', error)
      setRequestError(
        'Error al verificar solicitudes existentes. Intenta nuevamente.'
      )
      return
    }

    // Validación 5: Verificar perfil completo del usuario para intercambios
    try {
      const userProfileResult = await getUserProfile(user.uid)
      if (!userProfileResult.success) {
        setRequestError('Error al verificar tu perfil. Intenta nuevamente.')
        return
      }

      const profileValidation = await validateUserForExchanges(
        userProfileResult.data
      )
      console.log('🔍 Resultado de validación de perfil:', profileValidation)

      if (!profileValidation.success) {
        console.error(
          '❌ Error en validación de perfil:',
          profileValidation.error
        )
        setRequestError('Error al validar tu perfil para intercambios.')
        return
      }

      console.log(
        '✅ Validación exitosa, canExchange:',
        profileValidation.data.canExchange
      )

      if (!profileValidation.data.canExchange) {
        const missingFields = profileValidation.data.missingFields
          .map(field => {
            switch (field) {
              case 'name':
                return 'nombre completo'
              case 'whatsappNumber':
                return 'número de WhatsApp'
              case 'location':
                return 'ubicación'
              case 'allowExchangeRequests':
                return 'permitir solicitudes de intercambio'
              default:
                return field
            }
          })
          .join(', ')

        setRequestError(
          `Para solicitar intercambios necesitas completar tu perfil: ${missingFields}. Ve a tu perfil para completar estos campos.`
        )
        return
      }

      // Verificar configuración de privacidad
      if (
        userProfileResult.data.settings?.privacy?.allowExchangeRequests ===
        false
      ) {
        setRequestError(
          'Tienes deshabilitadas las solicitudes de intercambio en tu configuración de privacidad. Ve a tu perfil para habilitarlas.'
        )
        return
      }
    } catch (error) {
      console.error('Error verificando perfil del usuario:', error)
      setRequestError('Error al verificar tu perfil. Intenta nuevamente.')
      return
    }

    // Validación 6: Verificar WhatsApp del propietario
    try {
      console.log(
        '🔍 Verificando WhatsApp del propietario con ID:',
        seed.ownerId
      )

      const ownerProfileResult = await getUserProfile(seed.ownerId)
      if (!ownerProfileResult.success) {
        console.error(
          '❌ Error al obtener perfil del propietario:',
          ownerProfileResult.error
        )
        setRequestError(
          'Error al verificar la información del propietario. Intenta nuevamente.'
        )
        return
      }

      console.log(
        '✅ Perfil del propietario obtenido:',
        ownerProfileResult.data
      )

      const ownerWhatsApp = ownerProfileResult.data.whatsappNumber
      if (!ownerWhatsApp || ownerWhatsApp.trim() === '') {
        console.log('❌ El propietario no tiene WhatsApp configurado')
        setRequestError(
          'El propietario de esta semilla no tiene WhatsApp configurado. No es posible solicitar intercambio en este momento.'
        )
        return
      }

      console.log('✅ WhatsApp del propietario verificado:', ownerWhatsApp)

      // Verificar también que el propietario permita solicitudes de intercambio
      const ownerPrivacySettings = ownerProfileResult.data.settings?.privacy
      if (ownerPrivacySettings?.allowExchangeRequests === false) {
        console.log('❌ El propietario no permite solicitudes de intercambio')
        setRequestError(
          'El propietario de esta semilla no acepta solicitudes de intercambio en este momento.'
        )
        return
      }

      console.log('✅ El propietario acepta solicitudes de intercambio')
    } catch (error) {
      console.error('Error verificando datos del propietario:', error)
      setRequestError(
        'Error al verificar la información del propietario. Intenta nuevamente.'
      )
      return
    }

    // Todas las validaciones pasaron, mostrar formulario de solicitud
    setRequestedSeed(seed)
    setShowExchangeForm(true)
    setIsModalOpen(false) // Cerrar modal de detalle
  }

  // Funciones callback para ExchangeRequestForm (PASO 9)
  const handleExchangeSuccess = () => {
    setShowExchangeForm(false)
    setRequestedSeed(null)
    setRequestError(null)
    // Opcional: Mostrar mensaje de éxito
    alert('✅ Solicitud de intercambio enviada correctamente')
  }

  const handleExchangeCancel = () => {
    setShowExchangeForm(false)
    setRequestedSeed(null)
    setRequestError(null)
  }

  const handleExchangeError = error => {
    // Extraer el mensaje del error para mostrar al usuario
    const errorMessage =
      error?.userMessage ||
      error?.error ||
      error?.message ||
      'Error al procesar la solicitud'
    console.log('🔴 Error en intercambio:', {
      originalError: error,
      displayMessage: errorMessage,
    })
    setRequestError(errorMessage)
    // Mantener el formulario abierto para que el usuario pueda intentar de nuevo
  }

  // Agregar animación CSS para el spinner
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
  }

  // Formatear contador de resultados
  const getResultsText = () => {
    if (loading) return '...'
    const count = seeds.length
    const suffix = count !== 1 ? 'resultados' : 'resultado'
    return `${count} ${suffix}`
  }

  return (
    <div className="catalog-page catalog-page-transition catalog-gpu-accelerated">
      {/* Header de la página */}
      <div className="catalog-header">
        <h1 className="catalog-title">🌱 Catálogo de Semillas</h1>
        <p className="catalog-subtitle">
          Explora las semillas disponibles para intercambio
        </p>
      </div>

      {/* Componente de búsqueda y filtros */}
      <SearchBar
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        onAvailabilityFilter={handleAvailabilityFilter}
        initialSearchTerm={searchTerm}
        initialCategory={selectedCategory}
        initialAvailableOnly={showOnlyAvailable}
        loading={loading}
      />

      {/* Lista de semillas */}
      <div className="catalog-seeds-section">
        <div className="catalog-section-header">
          <h2 className="catalog-section-title">Semillas Disponibles</h2>
          <span className="catalog-results-count">{getResultsText()}</span>
        </div>

        {/* Estados de carga y error */}
        {loading && (
          <div className="catalog-loading-state">
            <div className="catalog-loading-spinner">⏳</div>
            <p className="catalog-loading-text">Cargando semillas...</p>
          </div>
        )}

        {error && (
          <div className="catalog-error-state">
            <div className="catalog-error-icon">⚠️</div>
            <h3 className="catalog-error-title">Error de conexión</h3>
            <p className="catalog-error-text">{error}</p>
            <button onClick={loadSeeds} className="catalog-retry-button">
              🔄 Intentar nuevamente
            </button>
          </div>
        )}

        {/* Grid de semillas */}
        {!loading && !error && seeds.length > 0 && (
          <div className="catalog-seeds-grid">
            {seeds.map(seed => (
              <SeedCard
                key={seed.id}
                seed={seed}
                onClick={handleSeedClick}
                loading={false}
              />
            ))}
          </div>
        )}

        {/* Botón cargar más */}
        {!loading && !error && seeds.length > 0 && hasMore && (
          <div className="catalog-load-more-section">
            <button
              onClick={loadMoreSeeds}
              disabled={loadingMore}
              className={`catalog-load-more-button ${loadingMore ? 'disabled' : ''}`}
            >
              {loadingMore ? '⏳ Cargando...' : '📄 Cargar más semillas'}
            </button>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && seeds.length === 0 && (
          <div className="catalog-empty-state">
            <div className="catalog-empty-icon">🌱</div>
            <h3 className="catalog-empty-title">
              {searchTerm || selectedCategory || showOnlyAvailable
                ? 'No se encontraron semillas'
                : 'No hay semillas registradas'}
            </h3>
            <p className="catalog-empty-text">
              {searchTerm || selectedCategory || showOnlyAvailable
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'Cuando otros usuarios registren sus semillas, aparecerán aquí'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <SeedDetailModal
        seed={selectedSeed}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRequestExchange={
          selectedSeed ? () => handleRequestExchange(selectedSeed) : undefined
        }
      />

      {/* Formulario de solicitud de intercambio (PASO 9) */}
      {showExchangeForm && requestedSeed && (
        <ExchangeRequestForm
          requestedSeed={requestedSeed}
          onSuccess={handleExchangeSuccess}
          onCancel={handleExchangeCancel}
          onError={handleExchangeError}
        />
      )}

      {/* Mensaje de error de validación */}
      {requestError && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 1001,
            boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)',
            maxWidth: '90%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <span>{requestError}</span>
            <button
              onClick={() => setRequestError(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="catalog-info-section">
        <div className="catalog-info-card">
          <h3 className="catalog-info-title">💡 ¿Cómo funciona?</h3>
          <ul className="catalog-info-list">
            <li>Explora semillas disponibles de otros agricultores</li>
            <li>Usa los filtros para encontrar lo que necesitas</li>
            <li>Haz clic en las tarjetas para ver más detalles</li>
            <li>Contacta directamente para proponer intercambios</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CatalogPage
