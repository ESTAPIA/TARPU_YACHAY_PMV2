// src/pages/ExchangesPage.jsx
// BLOQUE 7 - PASO 7.2: Integración de datos y filtros en ExchangesPage
//
// Funcionalidades implementadas:
// - Tres secciones principales: "Recibidas", "Enviadas", "Historial"
// - Navegación tipo tabs con estado de pestaña activa
// - Integración del componente ExchangeFilters en cada sección
// - Contador de notificaciones en estado
// - Diseño responsive mobile-first
// - Estilos CSS externos para mejor mantenibilidad
// - Carga de datos reales desde Firestore
// - Estados de carga, datos y errores por sección
// - Polling automático cada 30 segundos
// - Conexión de filtros con datos reales
// - Gestión de estados vacíos

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import {
  getUserExchangesReceived,
  getUserExchangesSent,
  getExchangeHistory,
  updateExchangeStatus,
} from '../services/exchangeService'
import {
  createNotification,
  NOTIFICATION_TYPES,
} from '../services/notificationService'
import ExchangeFilters from '../components/exchanges/ExchangeFilters'
import ExchangeCard from '../components/exchanges/ExchangeCard'
import './ExchangesPage.css'

function ExchangesPage() {
  // Usuario autenticado
  const { user } = useAuth()

  // Contexto de notificaciones (PASO 8.1)
  const { unreadCount, notifications, markAllAsRead } = useNotifications()

  // Debug: mostrar info de notificaciones en consola
  useEffect(() => {
    console.log('📊 Estado de notificaciones:', {
      total: notifications.length,
      noLeidas: unreadCount,
    })
  }, [notifications.length, unreadCount])

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState('received')

  // Estados de datos por sección
  const [exchangesData, setExchangesData] = useState({
    received: { data: [], loading: false, error: null },
    sent: { data: [], loading: false, error: null },
    history: { data: [], loading: false, error: null },
  })

  // Estado para filtros activos
  const [activeFilter, setActiveFilter] = useState('all')

  // Estados para operaciones de intercambio
  const [operationState, setOperationState] = useState({
    loadingExchanges: new Set(), // Set de IDs de intercambios en proceso
    feedback: null, // { type: 'success' | 'error', message: string }
  })

  // Referencias para intervalos de polling
  const pollingRef = useRef(null)

  // Función para cargar datos de una sección específica
  const loadSectionData = useCallback(
    async section => {
      if (!user?.uid) return

      // Actualizar estado de carga
      setExchangesData(prev => ({
        ...prev,
        [section]: { ...prev[section], loading: true, error: null },
      }))

      try {
        let result = null

        switch (section) {
          case 'received':
            result = await getUserExchangesReceived(user.uid)
            break
          case 'sent':
            result = await getUserExchangesSent(user.uid)
            break
          case 'history':
            result = await getExchangeHistory(user.uid)
            break
          default:
            throw new Error(`Sección desconocida: ${section}`)
        }

        // Validar la respuesta del servicio
        if (!result || !result.success) {
          throw new Error(
            result?.error || result?.userMessage || 'Error al obtener datos'
          )
        }

        // Extraer el array de datos de la respuesta
        const data = Array.isArray(result.data) ? result.data : []

        // Actualizar estado con datos exitosos
        setExchangesData(prev => ({
          ...prev,
          [section]: { data, loading: false, error: null },
        }))

        console.log(
          `✅ Datos cargados para ${section}:`,
          data.length,
          'intercambios',
          'Respuesta completa:',
          result
        )
      } catch (error) {
        console.error(`❌ Error cargando datos de ${section}:`, error)

        // Actualizar estado con error
        setExchangesData(prev => ({
          ...prev,
          [section]: {
            data: [],
            loading: false,
            error: error.message || 'Error al cargar datos',
          },
        }))
      }
    },
    [user?.uid]
  )

  // Función para cargar todas las secciones
  const loadAllData = useCallback(async () => {
    if (!user?.uid) return

    console.log('🔄 Cargando todos los datos de intercambios...')
    await Promise.all([
      loadSectionData('received'),
      loadSectionData('sent'),
      loadSectionData('history'),
    ])
  }, [user?.uid, loadSectionData])

  // Efecto para carga inicial y cambios de usuario
  useEffect(() => {
    if (user?.uid) {
      loadAllData()
    }
  }, [user?.uid, loadAllData])

  // Efecto para polling automático
  useEffect(() => {
    if (!user?.uid) return

    // Configurar polling cada 30 segundos
    pollingRef.current = setInterval(() => {
      console.log('⏰ Actualizando datos por polling...')
      loadAllData()
    }, 30000) // 30 segundos

    // Cleanup al desmontar o cambiar usuario
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [user?.uid, loadAllData])

  // Efecto para marcar notificaciones como leídas al entrar a la página (PASO 8.3)
  useEffect(() => {
    if (user?.uid && unreadCount > 0) {
      // Marcar todas las notificaciones como leídas cuando el usuario entra a intercambios
      const timer = setTimeout(() => {
        markAllAsRead()
        console.log(
          '📮 Notificaciones marcadas como leídas al entrar a intercambios'
        )
      }, 1000) // Esperar 1 segundo para mejor UX

      return () => clearTimeout(timer)
    }
  }, [user?.uid, unreadCount, markAllAsRead])

  // Función para manejar cambios de filtro
  const handleFilterChange = filterType => {
    setActiveFilter(filterType)
    console.log('🔍 Filtro cambiado a:', filterType)
  }

  // BLOQUE 7 - PASO 7.3: Funciones de actualización de estados de intercambio

  // Función helper para mostrar feedback
  const showFeedback = (type, message) => {
    setOperationState(prev => ({
      ...prev,
      feedback: { type, message },
    }))

    // Auto-ocultar feedback después de 3 segundos
    setTimeout(() => {
      setOperationState(prev => ({
        ...prev,
        feedback: null,
      }))
    }, 3000)
  }

  // Función helper para gestionar loading de operaciones
  const setExchangeLoading = (exchangeId, isLoading) => {
    setOperationState(prev => {
      const newLoadingSet = new Set(prev.loadingExchanges)
      if (isLoading) {
        newLoadingSet.add(exchangeId)
      } else {
        newLoadingSet.delete(exchangeId)
      }
      return {
        ...prev,
        loadingExchanges: newLoadingSet,
      }
    })
  }

  // 1. Función para aceptar solicitud de intercambio
  const handleAcceptExchange = async exchangeId => {
    if (!user?.uid || !exchangeId) {
      showFeedback('error', 'Error: Usuario o intercambio no válido')
      return
    }

    console.log('✅ Aceptando intercambio:', exchangeId)
    setExchangeLoading(exchangeId, true)

    try {
      // Actualizar estado en Firestore
      await updateExchangeStatus(exchangeId, 'accepted', user.uid)

      // Crear notificación para el solicitante
      const exchange = exchangesData.received.data.find(
        ex => ex.id === exchangeId
      )
      if (exchange) {
        await createNotification({
          type: NOTIFICATION_TYPES.EXCHANGE_ACCEPTED,
          recipientId: exchange.requesterId,
          senderId: user.uid,
          exchangeId: exchangeId,
          data: {
            seedName: exchange.requestedSeed?.name || 'semilla',
            requesterName: user.displayName || user.email || 'Usuario',
          },
        })
      }

      // Mostrar feedback exitoso
      showFeedback('success', '✅ Solicitud aceptada correctamente')

      // Refrescar datos automáticamente
      setTimeout(() => {
        loadAllData()
      }, 500)

      console.log('✅ Intercambio aceptado exitosamente')
    } catch (error) {
      console.error('❌ Error al aceptar intercambio:', error)
      showFeedback(
        'error',
        `Error al aceptar: ${error.message || 'Error desconocido'}`
      )
    } finally {
      setExchangeLoading(exchangeId, false)
    }
  }

  // 2. Función para rechazar solicitud de intercambio
  const handleRejectExchange = async exchangeId => {
    if (!user?.uid || !exchangeId) {
      showFeedback('error', 'Error: Usuario o intercambio no válido')
      return
    }

    console.log('❌ Rechazando intercambio:', exchangeId)
    setExchangeLoading(exchangeId, true)

    try {
      // Actualizar estado en Firestore
      await updateExchangeStatus(exchangeId, 'rejected', user.uid)

      // Crear notificación para el solicitante
      const exchange = exchangesData.received.data.find(
        ex => ex.id === exchangeId
      )
      if (exchange) {
        await createNotification({
          type: NOTIFICATION_TYPES.EXCHANGE_REJECTED,
          recipientId: exchange.requesterId,
          senderId: user.uid,
          exchangeId: exchangeId,
          data: {
            seedName: exchange.requestedSeed?.name || 'semilla',
            ownerName: user.displayName || user.email || 'Usuario',
          },
        })
      }

      // Mostrar feedback exitoso
      showFeedback('success', '❌ Solicitud rechazada')

      // Refrescar datos automáticamente
      setTimeout(() => {
        loadAllData()
      }, 500)

      console.log('❌ Intercambio rechazado exitosamente')
    } catch (error) {
      console.error('❌ Error al rechazar intercambio:', error)
      showFeedback(
        'error',
        `Error al rechazar: ${error.message || 'Error desconocido'}`
      )
    } finally {
      setExchangeLoading(exchangeId, false)
    }
  }

  // 3. Función para completar intercambio
  const handleCompleteExchange = async exchangeId => {
    if (!user?.uid || !exchangeId) {
      showFeedback('error', 'Error: Usuario o intercambio no válido')
      return
    }

    console.log('🎉 Completando intercambio:', exchangeId)
    setExchangeLoading(exchangeId, true)

    try {
      // Actualizar estado en Firestore
      await updateExchangeStatus(exchangeId, 'completed', user.uid)

      // Buscar el intercambio en datos locales
      let exchange = null
      const allSections = ['received', 'sent', 'history']
      for (const section of allSections) {
        exchange = exchangesData[section].data.find(ex => ex.id === exchangeId)
        if (exchange) break
      }

      // Crear notificación para la otra parte
      if (exchange) {
        const otherUserId =
          exchange.requesterId === user.uid
            ? exchange.ownerId
            : exchange.requesterId

        await createNotification({
          type: NOTIFICATION_TYPES.EXCHANGE_COMPLETED,
          recipientId: otherUserId,
          senderId: user.uid,
          exchangeId: exchangeId,
          data: {
            seedName: exchange.requestedSeed?.name || 'semilla',
            completedByName: user.displayName || user.email || 'Usuario',
          },
        })
      }

      // Mostrar feedback exitoso
      showFeedback('success', '🎉 Intercambio marcado como completado')

      // Refrescar datos automáticamente
      setTimeout(() => {
        loadAllData()
      }, 500)

      console.log('🎉 Intercambio completado exitosamente')
    } catch (error) {
      console.error('❌ Error al completar intercambio:', error)
      showFeedback(
        'error',
        `Error al completar: ${error.message || 'Error desconocido'}`
      )
    } finally {
      setExchangeLoading(exchangeId, false)
    }
  }

  // 4. Función para cancelar solicitud enviada
  const handleCancelExchange = async exchangeId => {
    if (!user?.uid || !exchangeId) {
      showFeedback('error', 'Error: Usuario o intercambio no válido')
      return
    }

    console.log('🚫 Cancelando intercambio:', exchangeId)
    setExchangeLoading(exchangeId, true)

    try {
      // Actualizar estado en Firestore
      await updateExchangeStatus(exchangeId, 'cancelled', user.uid)

      // Crear notificación para el propietario
      const exchange = exchangesData.sent.data.find(ex => ex.id === exchangeId)
      if (exchange) {
        await createNotification({
          type: NOTIFICATION_TYPES.EXCHANGE_CANCELLED,
          recipientId: exchange.ownerId,
          senderId: user.uid,
          exchangeId: exchangeId,
          data: {
            seedName: exchange.requestedSeed?.name || 'semilla',
            requesterName: user.displayName || user.email || 'Usuario',
          },
        })
      }

      // Mostrar feedback exitoso
      showFeedback('success', '🚫 Solicitud cancelada')

      // Refrescar datos automáticamente
      setTimeout(() => {
        loadAllData()
      }, 500)

      console.log('🚫 Intercambio cancelado exitosamente')
    } catch (error) {
      console.error('❌ Error al cancelar intercambio:', error)
      showFeedback(
        'error',
        `Error al cancelar: ${error.message || 'Error desconocido'}`
      )
    } finally {
      setExchangeLoading(exchangeId, false)
    }
  }

  // Función para obtener datos filtrados de la pestaña activa
  const getFilteredData = useMemo(() => {
    // Asegurarnos explícitamente que currentSectionData sea SIEMPRE un array
    const currentSectionData = Array.isArray(exchangesData[activeTab]?.data)
      ? exchangesData[activeTab].data
      : []

    if (activeFilter === 'all') {
      return currentSectionData
    }

    // Ahora estamos seguros que currentSectionData es un array
    return currentSectionData.filter(
      exchange => exchange.status === activeFilter
    )
  }, [exchangesData, activeTab, activeFilter])

  // Función para obtener contadores de notificaciones
  const notificationCounts = useMemo(() => {
    return {
      received: Array.isArray(exchangesData.received.data)
        ? exchangesData.received.data.filter(
            ex => ex.status === 'pending' || ex.status === 'accepted'
          ).length
        : 0,
      sent: Array.isArray(exchangesData.sent.data)
        ? exchangesData.sent.data.filter(
            ex => ex.status === 'pending' || ex.status === 'accepted'
          ).length
        : 0,
      history: Array.isArray(exchangesData.history.data)
        ? exchangesData.history.data.length
        : 0,
    }
  }, [exchangesData])

  // Función para obtener información de estado de la sección actual
  const getCurrentSectionState = () => {
    const sectionData = exchangesData[activeTab]
    return {
      loading: sectionData.loading,
      error: sectionData.error,
      hasData: Array.isArray(sectionData.data) && sectionData.data.length > 0,
      filteredCount: getFilteredData.length,
    }
  }

  // Función para renderizar el contenido de una sección
  const renderSectionContent = (
    sectionType,
    sectionData,
    icon,
    emptyTitle,
    emptyText
  ) => {
    const { loading, error, hasData } = getCurrentSectionState()
    const filteredData = getFilteredData

    return (
      <div className="tab-panel">
        <div className="section-header">
          <h2 className="section-title">{sectionType}</h2>
          <span className="status-badge">
            {(() => {
              if (sectionType === 'Historial de Intercambios') {
                return `${notificationCounts.history} completados`
              }
              if (sectionType === 'Solicitudes Recibidas') {
                return `${notificationCounts.received} pendientes`
              }
              return `${notificationCounts.sent} activas`
            })()}
          </span>
        </div>

        {/* Integración de ExchangeFilters */}
        <ExchangeFilters
          exchanges={sectionData.data || []}
          onFilterChange={handleFilterChange}
        />

        {/* Estados de carga */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>Cargando intercambios...</p>
          </div>
        )}

        {/* Estados de error */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h3 className="error-title">Error al cargar datos</h3>
            <p className="error-text">{error}</p>
            <button
              className="retry-button"
              onClick={() => loadSectionData(activeTab)}
            >
              🔄 Reintentar
            </button>
          </div>
        )}

        {/* Lista de intercambios */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="exchanges-list">
            {filteredData.map(exchange => (
              <ExchangeCard
                key={exchange.id}
                exchange={exchange}
                onAccept={handleAcceptExchange}
                onReject={handleRejectExchange}
                onComplete={handleCompleteExchange}
                onCancel={handleCancelExchange}
                isLoading={operationState.loadingExchanges.has(exchange.id)}
              />
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && !hasData && (
          <div className="empty-state">
            <div className="empty-icon">{icon}</div>
            <h3 className="empty-title">{emptyTitle}</h3>
            <p className="empty-text">{emptyText}</p>
            {sectionType === 'Solicitudes Enviadas' && (
              <div className="empty-actions">
                <button className="primary-button">🌱 Explorar Catálogo</button>
              </div>
            )}
          </div>
        )}

        {/* Estado sin resultados de filtro */}
        {!loading && !error && hasData && filteredData.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">No hay intercambios con este filtro</h3>
            <p className="empty-text">
              Intenta cambiar el filtro para ver más resultados
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="exchanges-page">
      {/* Header de la página */}
      <div className="exchanges-header">
        <h1 className="exchanges-title">🔄 Intercambios</h1>
        <p className="exchanges-subtitle">
          Gestiona tus solicitudes de intercambio de semillas
        </p>
      </div>

      {/* Feedback de operaciones */}
      {operationState.feedback && (
        <div
          className={`feedback-banner feedback-${operationState.feedback.type}`}
        >
          <div className="feedback-content">
            <span className="feedback-message">
              {operationState.feedback.message}
            </span>
            <button
              className="feedback-close"
              onClick={() =>
                setOperationState(prev => ({ ...prev, feedback: null }))
              }
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navegación por pestañas */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('received')}
          className={`tab ${activeTab === 'received' ? 'tab-active' : ''}`}
        >
          📥 Recibidas ({notificationCounts.received})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`tab ${activeTab === 'sent' ? 'tab-active' : ''}`}
        >
          📤 Enviadas ({notificationCounts.sent})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
        >
          📚 Historial ({notificationCounts.history})
        </button>
      </div>

      {/* Contenido de pestañas usando renderSectionContent */}
      <div className="tab-content">
        {activeTab === 'received' &&
          renderSectionContent(
            'Solicitudes Recibidas',
            exchangesData.received,
            '📥',
            'No tienes solicitudes',
            'Cuando otros usuarios quieran intercambiar contigo, las solicitudes aparecerán aquí'
          )}

        {activeTab === 'sent' &&
          renderSectionContent(
            'Solicitudes Enviadas',
            exchangesData.sent,
            '📤',
            'No has enviado solicitudes',
            'Explora el catálogo de semillas y propón intercambios con otros agricultores'
          )}

        {activeTab === 'history' &&
          renderSectionContent(
            'Historial de Intercambios',
            exchangesData.history,
            '📚',
            'Sin intercambios realizados',
            'Tus intercambios completados se mostrarán aquí con detalles y calificaciones'
          )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-section">
        <h2 className="section-title">📊 Mis Estadísticas</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Intercambios Exitosos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Calificación Promedio</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Conexiones Activas</div>
          </div>
        </div>
      </div>

      {/* Información sobre intercambios */}
      <div className="info-section">
        <div className="info-card">
          <h3 className="info-title">🤝 ¿Cómo funciona el intercambio?</h3>
          <div className="steps-list">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-text">
                Encuentra semillas que te interesen en el catálogo
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-text">
                Envía una solicitud proponiendo qué semillas ofrecer a cambio
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-text">
                Negocia los detalles del intercambio a través del chat
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-text">
                Confirma el intercambio y coordina la entrega
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExchangesPage
