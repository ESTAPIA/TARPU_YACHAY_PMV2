// src/components/ui/NotificationBadge.jsx
// BLOQUE 7 - PASO 8.2: Componente de badge de notificaciones
//
// Funcionalidades implementadas:
// - Indicador visual de notificaciones no leídas
// - Número o punto según cantidad de notificaciones
// - Animación sutil al cambiar el estado
// - Diferentes tamaños para distintos contextos
// - Auto-actualización desde NotificationContext

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useNotifications } from '../../hooks/useNotifications'
import './NotificationBadge.css'

/**
 * Componente NotificationBadge - Indicador visual de notificaciones
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.size - Tamaño del badge ('small', 'medium', 'large')
 * @param {number} props.maxCount - Número máximo a mostrar antes de mostrar "+"
 * @param {boolean} props.showZero - Si mostrar el badge cuando no hay notificaciones
 * @param {boolean} props.showDot - Si mostrar solo punto cuando hay notificaciones
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element|null} Badge de notificaciones o null si no hay que mostrar
 */
function NotificationBadge({
  size = 'medium',
  maxCount = 99,
  showZero = false,
  showDot = false,
  className = '',
}) {
  const { unreadCount } = useNotifications()
  const [isAnimating, setIsAnimating] = useState(false)
  const [previousCount, setPreviousCount] = useState(unreadCount)

  // Efecto para animar cuando cambia el contador
  useEffect(() => {
    if (unreadCount !== previousCount && unreadCount > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      setPreviousCount(unreadCount)
      return () => clearTimeout(timer)
    }
    setPreviousCount(unreadCount)
  }, [unreadCount, previousCount])

  // No mostrar badge si no hay notificaciones y showZero es false
  if (unreadCount === 0 && !showZero) {
    return null
  }

  // Determinar qué mostrar en el badge
  const getDisplayContent = () => {
    if (showDot && unreadCount > 0) {
      return '' // Solo punto, sin texto
    }

    if (unreadCount === 0) {
      return '0'
    }

    if (unreadCount > maxCount) {
      return `${maxCount}+`
    }

    return unreadCount.toString()
  }

  const displayContent = getDisplayContent()
  const isVisible = unreadCount > 0 || showZero

  // Generar mensaje de accesibilidad
  const getAriaLabel = () => {
    if (unreadCount === 0) {
      return 'Sin notificaciones'
    }
    const notificationText =
      unreadCount === 1 ? 'notificación' : 'notificaciones'
    const readText = unreadCount === 1 ? 'leída' : 'leídas'
    return `${unreadCount} ${notificationText} no ${readText}`
  }

  return (
    <span
      className={`
        notification-badge
        notification-badge--${size}
        ${showDot && unreadCount > 0 ? 'notification-badge--dot' : ''}
        ${isAnimating ? 'notification-badge--animating' : ''}
        ${!isVisible ? 'notification-badge--hidden' : ''}
        ${className}
      `.trim()}
      aria-label={getAriaLabel()}
    >
      {displayContent}
    </span>
  )
}

NotificationBadge.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  maxCount: PropTypes.number,
  showZero: PropTypes.bool,
  showDot: PropTypes.bool,
  className: PropTypes.string,
}

export default NotificationBadge
