// src/components/exchanges/ExchangeCard.jsx
// BLOQUE 7 - PASO 4.2: Lógica de estados visuales en ExchangeCard
//
// Funcionalidades implementadas:
// - Determinación automática de perspectiva del usuario (solicitud recibida/enviada)
// - Visualización condicional según estado (pending, accepted, rejected, completed)
// - Manejo de información privada (WhatsApp visible solo en estados aceptado/completado)
// - Indicadores visuales adicionales según contexto y estado
// - Información de semillas (ofrecida y solicitada) con imágenes
// - Datos de usuarios con información de contacto condicional
// - Badge visual del estado actual del intercambio
// - Mensaje de la solicitud (si existe)
// - Fecha con tiempo transcurrido desde creación
// - Área reservada para botones de acción (implementar en paso siguiente)
// - Diseño responsive optimizado para móviles

import { useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../../contexts/AuthContext'
import WhatsAppContactButton from './WhatsAppContactButton'
import './ExchangeCard.css'

/**
 * Convierte timestamp a texto de tiempo transcurrido
 * @param {string|Date} timestamp - Fecha de creación
 * @returns {string} Texto del tiempo transcurrido
 */
function getTimeAgo(timestamp) {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'hace un momento'
    if (diffMins < 60) return `hace ${diffMins} min`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return 'fecha inválida'
  }
}

/**
 * Obtiene configuración de badge según el estado
 * @param {string} status - Estado del intercambio
 * @returns {Object} Configuración del badge (text, className)
 */
function getStatusBadge(status) {
  const statusConfig = {
    pending: { text: 'Pendiente', className: 'exchange-status--pending' },
    accepted: { text: 'Aceptado', className: 'exchange-status--accepted' },
    rejected: { text: 'Rechazado', className: 'exchange-status--rejected' },
    completed: { text: 'Completado', className: 'exchange-status--completed' },
  }

  return (
    statusConfig[status] || {
      text: 'Desconocido',
      className: 'exchange-status--unknown',
    }
  )
}

function ExchangeCard({
  exchange,
  onCardClick,
  className = '',
  showActions = true, // Cambiar default a true para mostrar acciones
  onAccept, // Función para aceptar intercambio
  onReject, // Función para rechazar intercambio
  onComplete, // Función para completar intercambio
  onCancel, // Función para cancelar intercambio
  isLoading = false, // Estado de loading para esta tarjeta
}) {
  const { user } = useAuth() // Obtener usuario actual
  const [imageErrors, setImageErrors] = useState({
    seedOffered: false,
    seedRequested: false,
  })

  // Extraer propiedades del intercambio
  const {
    status = 'pending',
    message,
    createdAt,
    seedOffered = {},
    seedRequested = {},
    requester = {},
    owner = {},
  } = exchange

  // Determinar perspectiva del usuario
  const isRequester =
    user?.uid === requester.id || user?.email === requester.email
  const otherUser = isRequester ? owner : requester

  // Configuración de estado visual
  const statusBadge = getStatusBadge(status)

  // PASO 4.2: Estados que permiten información privada
  const showPrivateInfo = status === 'accepted' || status === 'completed'

  // PASO 4.2: Texto contextual según perspectiva
  const contextText = isRequester ? 'Solicitas' : 'Te solicitan'

  // Handler para click en la tarjeta
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(exchange)
    }
  }

  // Handler para errores de imagen
  const handleImageError = seedType => {
    setImageErrors(prev => ({ ...prev, [seedType]: true }))
  }

  // PASO 4.3: Estados de carga para acciones individuales
  const [showConfirmModal, setShowConfirmModal] = useState(null) // Para confirmaciones

  // PASO 4.3: Handlers para acciones de intercambio

  /**
   * Handler para aceptar intercambio - usa prop desde ExchangesPage
   */
  const handleAcceptExchange = () => {
    if (onAccept) {
      onAccept(exchange.id)
    }
  }

  /**
   * Handler para rechazar intercambio (con confirmación)
   */
  const handleRejectExchange = () => {
    setShowConfirmModal('reject')
  }

  /**
   * Confirmar rechazo del intercambio - usa prop desde ExchangesPage
   */
  const confirmRejectExchange = () => {
    if (onReject) {
      onReject(exchange.id)
    }
    setShowConfirmModal(null)
  }

  /**
   * Handler para marcar como completado (con confirmación)
   */
  const handleCompleteExchange = () => {
    setShowConfirmModal('complete')
  }

  /**
   * Confirmar completar intercambio - usa prop desde ExchangesPage
   */
  const confirmCompleteExchange = () => {
    if (onComplete) {
      onComplete(exchange.id)
    }
    setShowConfirmModal(null)
  }

  /**
   * Handler para cancelar intercambio propio (con confirmación)
   */
  const handleCancelExchange = () => {
    setShowConfirmModal('cancel')
  }

  /**
   * Confirmar cancelación del intercambio - usa prop desde ExchangesPage
   */
  const confirmCancelExchange = () => {
    if (onCancel) {
      onCancel(exchange.id)
    }
    setShowConfirmModal(null)
  }

  /**
   * Handler para contactar por WhatsApp - ahora usando WhatsAppContactButton
   */
  const handleContactWhatsApp = () => {
    // Esta función ya no es necesaria, la funcionalidad está en WhatsAppContactButton
    // Se mantiene por compatibilidad con getAvailableActions
  }

  const getConfirmButtonStyle = () => {
    if (showConfirmModal === 'reject') return 'danger'
    if (showConfirmModal === 'complete') return 'success'
    return 'danger'
  }
  const handleCloseConfirmModal = () => {
    setShowConfirmModal(null)
  }

  /**
   * Determinar qué acciones mostrar según estado y rol
   */
  const getAvailableActions = () => {
    const actions = []

    switch (status) {
      case 'pending':
        if (isRequester) {
          // Solicitud enviada: solo cancelar
          actions.push({
            type: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            handler: handleCancelExchange,
            loading: isLoading,
            confirmRequired: true,
          })
        } else {
          // Solicitud recibida: aceptar o rechazar
          actions.push(
            {
              type: 'accept',
              label: 'Aceptar',
              variant: 'primary',
              handler: handleAcceptExchange,
              loading: isLoading,
            },
            {
              type: 'reject',
              label: 'Rechazar',
              variant: 'danger',
              handler: handleRejectExchange,
              loading: isLoading,
              confirmRequired: true,
            }
          )
        }
        break

      case 'accepted':
        actions.push(
          {
            type: 'contact',
            label: 'Contactar por WhatsApp',
            variant: 'secondary',
            handler: handleContactWhatsApp,
            loading: isLoading,
            icon: '📱',
          },
          {
            type: 'complete',
            label: 'Marcar como completado',
            variant: 'success',
            handler: handleCompleteExchange,
            loading: isLoading,
            confirmRequired: true,
          }
        )
        break

      default:
        // Estados 'rejected' y 'completed' no tienen acciones
        break
    }

    return actions
  }
  return (
    <div
      className={`exchange-card ${className} ${onCardClick ? 'exchange-card--clickable' : ''}`}
      onClick={handleCardClick}
      role={onCardClick ? 'button' : 'article'}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={
        onCardClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCardClick()
              }
            }
          : undefined
      }
    >
      {/* Header con estado y fecha */}
      <div className="exchange-card__header">
        <div className={`exchange-status ${statusBadge.className}`}>
          {statusBadge.text}
        </div>
        <div className="exchange-time">{getTimeAgo(createdAt)}</div>
      </div>

      {/* Información de semillas con flecha de intercambio */}
      <div className="exchange-card__seeds">
        {/* Semilla ofrecida */}
        <div className="exchange-seed exchange-seed--offered">
          <div className="exchange-seed__image">
            {seedOffered.imageUrl && !imageErrors.seedOffered ? (
              <img
                src={seedOffered.imageUrl}
                alt={seedOffered.name || 'Semilla ofrecida'}
                onError={() => handleImageError('seedOffered')}
              />
            ) : (
              <div className="exchange-seed__fallback">
                <span>🌱</span>
              </div>
            )}
          </div>
          <div className="exchange-seed__info">
            <h4 className="exchange-seed__name">
              {seedOffered.name || 'Semilla sin nombre'}
            </h4>
            {seedOffered.variety && (
              <p className="exchange-seed__variety">{seedOffered.variety}</p>
            )}
          </div>
        </div>

        {/* Flecha de intercambio */}
        <div className="exchange-arrow">
          <span className="exchange-arrow__icon">⇄</span>
          <span className="exchange-arrow__text">{contextText}</span>
        </div>

        {/* Semilla solicitada */}
        <div className="exchange-seed exchange-seed--requested">
          <div className="exchange-seed__image">
            {seedRequested.imageUrl && !imageErrors.seedRequested ? (
              <img
                src={seedRequested.imageUrl}
                alt={seedRequested.name || 'Semilla solicitada'}
                onError={() => handleImageError('seedRequested')}
              />
            ) : (
              <div className="exchange-seed__fallback">
                <span>🌱</span>
              </div>
            )}
          </div>
          <div className="exchange-seed__info">
            <h4 className="exchange-seed__name">
              {seedRequested.name || 'Semilla sin nombre'}
            </h4>
            {seedRequested.variety && (
              <p className="exchange-seed__variety">{seedRequested.variety}</p>
            )}
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="exchange-card__user">
        <div className="exchange-user">
          <span className="exchange-user__label">
            {isRequester ? 'Propietario:' : 'Solicitante:'}
          </span>
          <span className="exchange-user__name">
            {otherUser.name || 'Usuario desconocido'}
          </span>

          {/* PASO 4.2: Información privada solo en estados aceptado/completado */}
          {showPrivateInfo && otherUser.whatsapp && (
            <div className="exchange-user__contact">
              <span className="exchange-user__whatsapp">
                📱 {otherUser.whatsapp}
              </span>
            </div>
          )}

          {/* PASO 4.2: Indicador visual de información disponible */}
          {showPrivateInfo && (
            <div className="exchange-user__status">
              <span className="exchange-user__status-text">
                ✅ Información de contacto disponible
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de la solicitud */}
      {message && (
        <div className="exchange-card__message">
          <div className="exchange-message">
            <span className="exchange-message__label">💬 Mensaje:</span>
            <p className="exchange-message__text">{message}</p>
          </div>
        </div>
      )}

      {/* PASO 4.3: Área de acciones dinámicas según estado */}
      {showActions && (
        <div className="exchange-card__actions">
          {getAvailableActions().map(action => {
            // PASO 5: Usar WhatsAppContactButton para acción de contacto
            if (action.type === 'contact') {
              return (
                <WhatsAppContactButton
                  key={action.type}
                  phoneNumber={otherUser.whatsapp}
                  seedName={
                    isRequester ? seedRequested?.name : seedOffered?.name
                  }
                  userName={user?.displayName || user?.email || 'Usuario'}
                  className="exchange-action exchange-action--secondary"
                  disabled={isLoading}
                  size="medium"
                />
              )
            }

            // Botones estándar para otras acciones
            return (
              <button
                key={action.type}
                className={`exchange-action exchange-action--${action.variant} ${action.loading ? 'exchange-action--loading' : ''}`}
                onClick={action.handler}
                disabled={action.loading || isLoading}
              >
                {action.loading ? (
                  <span className="exchange-action__spinner">⏳</span>
                ) : (
                  <>
                    {action.icon && (
                      <span className="exchange-action__icon">
                        {action.icon}
                      </span>
                    )}
                    <span className="exchange-action__text">
                      {action.label}
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* PASO 4.3: Modal de confirmación para acciones críticas */}
      {showConfirmModal && (
        <div
          className="exchange-confirm-modal"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          onKeyDown={e => {
            if (e.key === 'Escape') {
              handleCloseConfirmModal()
            }
          }}
        >
          <div className="exchange-confirm-modal__content">
            <div className="exchange-confirm-modal__header">
              <h3 className="exchange-confirm-modal__title">
                {showConfirmModal === 'reject' && '¿Rechazar intercambio?'}
                {showConfirmModal === 'complete' && '¿Marcar como completado?'}
                {showConfirmModal === 'cancel' && '¿Cancelar solicitud?'}
              </h3>
            </div>

            <div className="exchange-confirm-modal__body">
              <p className="exchange-confirm-modal__message">
                {showConfirmModal === 'reject' &&
                  'Esta acción rechazará la solicitud de intercambio. El solicitante será notificado automáticamente.'}
                {showConfirmModal === 'complete' &&
                  'Confirma que el intercambio se ha realizado exitosamente. Esta acción notificará al otro usuario.'}
                {showConfirmModal === 'cancel' &&
                  'Esta acción cancelará tu solicitud de intercambio. El propietario será notificado automáticamente.'}
              </p>
            </div>

            <div className="exchange-confirm-modal__actions">
              <button
                className="exchange-confirm-action exchange-confirm-action--secondary"
                onClick={handleCloseConfirmModal}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                className={`exchange-confirm-action exchange-confirm-action--${getConfirmButtonStyle()}`}
                onClick={() => {
                  if (showConfirmModal === 'reject') confirmRejectExchange()
                  if (showConfirmModal === 'complete') confirmCompleteExchange()
                  if (showConfirmModal === 'cancel') confirmCancelExchange()
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="exchange-action__spinner">⏳</span>
                ) : (
                  <>
                    {showConfirmModal === 'reject' && 'Rechazar'}
                    {showConfirmModal === 'complete' && 'Completar'}
                    {showConfirmModal === 'cancel' && 'Cancelar'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// PropTypes para validación
ExchangeCard.propTypes = {
  exchange: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string,
    message: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    seedOffered: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      variety: PropTypes.string,
      imageUrl: PropTypes.string,
    }),
    seedRequested: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      variety: PropTypes.string,
      imageUrl: PropTypes.string,
    }),
    requester: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      whatsapp: PropTypes.string,
    }),
    owner: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      whatsapp: PropTypes.string,
    }),
  }).isRequired,
  onCardClick: PropTypes.func,
  className: PropTypes.string,
  showActions: PropTypes.bool,
  onAccept: PropTypes.func, // Función para aceptar intercambio
  onReject: PropTypes.func, // Función para rechazar intercambio
  onComplete: PropTypes.func, // Función para completar intercambio
  onCancel: PropTypes.func, // Función para cancelar intercambio
  isLoading: PropTypes.bool, // Estado de loading para esta tarjeta
}

export default ExchangeCard
