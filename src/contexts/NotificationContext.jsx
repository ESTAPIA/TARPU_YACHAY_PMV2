// src/contexts/NotificationContext.jsx
// BLOQUE 7 - PASO 8.1: Contexto global de notificaciones
//
// Funcionalidades implementadas:
// - Estado global de notificaciones (lista, contador no leídas, loading, error)
// - Integración con notificationService para CRUD operations
// - Listeners en tiempo real para actualizaciones automáticas
// - Funciones para marcar como leída y eliminar notificaciones
// - Provider para envolver la aplicación

import { createContext, useEffect, useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  getUserNotifications,
  markAsRead,
  deleteNotification,
} from '../services/notificationService'
import { useAuth } from './AuthContext'

// Crear el contexto
const NotificationContext = createContext()

// Provider del contexto
export function NotificationProvider({ children }) {
  // Estado del contexto
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener usuario autenticado
  const { user } = useAuth()

  // Función para cargar notificaciones del usuario
  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      setError(null)

      const result = await getUserNotifications(user.uid)
      // Extraer el array desde la respuesta del servicio
      const notificationsArray = result.success ? result.data : []
      setNotifications(notificationsArray)

      // Calcular contador usando el array extraído
      const unread = notificationsArray.filter(
        notification => !notification.read
      ).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Función para marcar notificación como leída
  const markNotificationAsRead = useCallback(async notificationId => {
    try {
      await markAsRead(notificationId)

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      )

      // Actualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
      setError('Error al marcar notificación como leída')
    }
  }, [])

  // Función para eliminar notificación
  const removeNotification = useCallback(
    async notificationId => {
      try {
        await deleteNotification(notificationId)

        // Actualizar estado local
        const notificationToRemove = notifications.find(
          n => n.id === notificationId
        )
        setNotifications(prev => prev.filter(n => n.id !== notificationId))

        // Actualizar contador si era no leída
        if (notificationToRemove && !notificationToRemove.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      } catch (err) {
        console.error('Error deleting notification:', err)
        setError('Error al eliminar notificación')
      }
    },
    [notifications]
  )

  // Función para marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)

      // Marcar todas las no leídas como leídas
      await Promise.all(
        unreadNotifications.map(notification => markAsRead(notification.id))
      )

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read: true,
          readAt: notification.read ? notification.readAt : new Date(),
        }))
      )

      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
      setError('Error al marcar todas como leídas')
    }
  }, [notifications])

  // Función para limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Función para refrescar notificaciones
  const refreshNotifications = useCallback(() => {
    loadNotifications()
  }, [loadNotifications])

  // Cargar notificaciones cuando el usuario se autentica
  useEffect(() => {
    if (user?.uid) {
      loadNotifications()
    } else {
      // Limpiar estado cuando no hay usuario
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      setError(null)
    }
  }, [user?.uid, loadNotifications])

  // Configurar polling para actualizaciones en tiempo real (cada 30 segundos)
  useEffect(() => {
    if (!user?.uid) return

    const pollInterval = setInterval(() => {
      loadNotifications()
    }, 30000) // 30 segundos

    return () => clearInterval(pollInterval)
  }, [user?.uid, loadNotifications])

  // Valor del contexto
  const contextValue = useMemo(
    () => ({
      // Estado
      notifications,
      unreadCount,
      loading,
      error,

      // Funciones
      loadNotifications,
      markNotificationAsRead,
      removeNotification,
      markAllAsRead,
      clearError,
      refreshNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      loadNotifications,
      markNotificationAsRead,
      removeNotification,
      markAllAsRead,
      clearError,
      refreshNotifications,
    ]
  )

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

// Exportar contexto y provider
export { NotificationContext }
export default NotificationProvider
