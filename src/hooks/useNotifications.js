// src/hooks/useNotifications.js
// BLOQUE 7 - PASO 8.1: Hook personalizado para acceso a notificaciones
//
// Funcionalidades implementadas:
// - Hook personalizado para acceder al contexto de notificaciones
// - Validación de que el hook se use dentro del proveedor
// - Acceso simplificado a estado y funciones de notificaciones

import { useContext } from 'react'
import { NotificationContext } from '../contexts/NotificationContext'

/**
 * Hook personalizado para acceder al contexto de notificaciones
 * Debe ser usado dentro de un NotificationProvider
 *
 * @returns {Object} Estado y funciones del contexto de notificaciones
 */
export function useNotifications() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error(
      'useNotifications debe ser usado dentro de un NotificationProvider'
    )
  }

  return context
}

export default useNotifications
