// src/services/notificationService.js
// BLOQUE 7 - PASO 2.1: Servicio básico de notificaciones
// BLOQUE 7 - PASO 2.2: Tipos y plantillas de notificaciones
//
// Funcionalidades implementadas:
// - createNotification: crear nueva notificación en Firestore
// - getUserNotifications: obtener notificaciones del usuario ordenadas por fecha
// - markAsRead: marcar notificación como leída
// - getUnreadCount: contador de notificaciones no leídas
// - deleteNotification: eliminar notificación específica
// - generateNotificationContent: generar contenido automático según tipo

import { db } from '../firebase-config'
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  serverTimestamp,
} from 'firebase/firestore'

// Nombre de colección en Firestore
const NOTIFICATIONS_COLLECTION = 'notifications'

// Tipos de notificación permitidos
export const NOTIFICATION_TYPES = {
  EXCHANGE_REQUEST: 'exchange_request',
  EXCHANGE_ACCEPTED: 'exchange_accepted',
  EXCHANGE_REJECTED: 'exchange_rejected',
  EXCHANGE_COMPLETED: 'exchange_completed',
  SYSTEM_MESSAGE: 'system_message',
}

// Plantillas de mensajes para cada tipo de notificación
const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.EXCHANGE_REQUEST]: {
    title: 'Nueva solicitud de intercambio',
    message:
      '{requesterName} quiere intercambiar su {seedOfferedName} por tu {seedRequestedName}',
  },
  [NOTIFICATION_TYPES.EXCHANGE_ACCEPTED]: {
    title: 'Solicitud aceptada',
    message: '{ownerName} ha aceptado tu solicitud de intercambio',
  },
  [NOTIFICATION_TYPES.EXCHANGE_REJECTED]: {
    title: 'Solicitud rechazada',
    message: 'Tu solicitud de intercambio ha sido rechazada',
  },
  [NOTIFICATION_TYPES.EXCHANGE_COMPLETED]: {
    title: 'Intercambio completado',
    message: 'El intercambio con {otherUserName} ha sido completado',
  },
  [NOTIFICATION_TYPES.SYSTEM_MESSAGE]: {
    title: 'Mensaje del sistema',
    message: '{message}',
  },
}

/**
 * Genera contenido automático para notificaciones según tipo y datos de intercambio
 * @param {string} type - Tipo de notificación (usar NOTIFICATION_TYPES)
 * @param {Object} exchangeData - Datos del intercambio
 * @returns {Object} Objeto con título y mensaje generados
 */
export function generateNotificationContent(type, exchangeData) {
  try {
    console.log('📝 Generando contenido de notificación:', {
      type,
      exchangeData,
    })

    // Validar tipo de notificación
    if (!type || !Object.values(NOTIFICATION_TYPES).includes(type)) {
      throw new Error('Tipo de notificación no válido')
    }

    // Obtener plantilla para el tipo especificado
    const template = NOTIFICATION_TEMPLATES[type]
    if (!template) {
      throw new Error(`No existe plantilla para el tipo: ${type}`)
    }

    // Validar datos requeridos según el tipo
    if (type !== NOTIFICATION_TYPES.SYSTEM_MESSAGE && !exchangeData) {
      throw new Error(
        'exchangeData es requerido para notificaciones de intercambio'
      )
    }

    let title = template.title
    let message = template.message

    // Reemplazar placeholders según el tipo de notificación
    switch (type) {
      case NOTIFICATION_TYPES.EXCHANGE_REQUEST:
        if (
          !exchangeData.requesterName ||
          !exchangeData.seedOfferedName ||
          !exchangeData.seedRequestedName
        ) {
          throw new Error('Datos insuficientes para notificación de solicitud')
        }
        message = message
          .replace('{requesterName}', exchangeData.requesterName)
          .replace('{seedOfferedName}', exchangeData.seedOfferedName)
          .replace('{seedRequestedName}', exchangeData.seedRequestedName)
        break

      case NOTIFICATION_TYPES.EXCHANGE_ACCEPTED:
        if (!exchangeData.ownerName) {
          throw new Error(
            'ownerName es requerido para notificación de aceptación'
          )
        }
        message = message.replace('{ownerName}', exchangeData.ownerName)
        break

      case NOTIFICATION_TYPES.EXCHANGE_REJECTED:
        // No requiere reemplazos dinámicos
        break

      case NOTIFICATION_TYPES.EXCHANGE_COMPLETED:
        if (!exchangeData.otherUserName) {
          throw new Error(
            'otherUserName es requerido para notificación de completado'
          )
        }
        message = message.replace('{otherUserName}', exchangeData.otherUserName)
        break

      case NOTIFICATION_TYPES.SYSTEM_MESSAGE:
        if (!exchangeData.message) {
          throw new Error('message es requerido para mensajes del sistema')
        }
        message = message.replace('{message}', exchangeData.message)
        break

      default:
        throw new Error(`Tipo de notificación no implementado: ${type}`)
    }

    const result = {
      title: title.trim(),
      message: message.trim(),
    }

    console.log('✅ Contenido generado exitosamente:', result)
    return result
  } catch (error) {
    console.error('❌ Error generando contenido de notificación:', error)

    // Fallback: retornar contenido genérico en caso de error
    return {
      title: 'Notificación',
      message: 'Tienes una nueva notificación en Tarpu Yachay',
    }
  }
}

/**
 * Valida los datos básicos de una notificación
 * @param {Object} notificationData - Datos de la notificación
 * @returns {Object} Resultado de validación
 */
function validateNotificationData(notificationData) {
  const errors = []

  // Campos obligatorios
  if (!notificationData.userId || notificationData.userId.trim() === '') {
    errors.push('El ID del usuario es obligatorio')
  }

  if (!notificationData.type || notificationData.type.trim() === '') {
    errors.push('El tipo de notificación es obligatorio')
  }

  if (!notificationData.title || notificationData.title.trim() === '') {
    errors.push('El título es obligatorio')
  }

  if (!notificationData.message || notificationData.message.trim() === '') {
    errors.push('El mensaje es obligatorio')
  }

  // Validar tipos permitidos
  const validTypes = Object.values(NOTIFICATION_TYPES)
  if (notificationData.type && !validTypes.includes(notificationData.type)) {
    errors.push('Tipo de notificación no válido')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Prepara los datos de notificación para guardar en Firestore
 * @param {Object} notificationData - Datos de la notificación
 * @returns {Object} Datos preparados
 */
function prepareNotificationData(notificationData) {
  return {
    // Información básica
    userId: notificationData.userId.trim(),
    type: notificationData.type.trim(),
    title: notificationData.title.trim(),
    message: notificationData.message.trim(),

    // Estado de la notificación
    status: 'unread', // Siempre inicia como no leída

    // Entidad relacionada (opcional)
    relatedEntityType: notificationData.exchangeId ? 'exchange' : null,
    relatedEntityId: notificationData.exchangeId || null,

    // Prioridad (opcional)
    priority: notificationData.priority || 'normal', // 'low', 'normal', 'high'

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    readAt: null,
    archivedAt: null,

    // Metadatos
    version: 1,
    isActive: true,
  }
}

/**
 * Crea una nueva notificación en Firestore
 * @param {string} userId - ID del usuario destinatario
 * @param {string} type - Tipo de notificación
 * @param {string} exchangeId - ID del intercambio relacionado (opcional)
 * @param {string} title - Título de la notificación
 * @param {string} message - Mensaje de la notificación
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function createNotification(
  userId,
  type,
  exchangeId,
  title,
  message
) {
  try {
    console.log('🔔 Creando notificación...', {
      userId,
      type,
      exchangeId,
      title,
    })

    // Validar parámetros obligatorios
    if (!userId || !type || !title || !message) {
      throw new Error('Parámetros obligatorios: userId, type, title, message')
    }

    // Preparar datos de notificación
    const notificationData = {
      userId,
      type,
      exchangeId,
      title,
      message,
    }

    // Validar datos
    const validation = validateNotificationData(notificationData)
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`)
    }

    // Preparar datos para Firestore
    const preparedData = prepareNotificationData(notificationData)
    console.log('📝 Datos preparados para Firestore:', preparedData)

    // Guardar en Firestore
    const docRef = await addDoc(
      collection(db, NOTIFICATIONS_COLLECTION),
      preparedData
    )

    console.log('✅ Notificación creada exitosamente con ID:', docRef.id)

    return {
      success: true,
      notificationId: docRef.id,
      message: 'Notificación creada exitosamente',
      data: {
        id: docRef.id,
        ...preparedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('❌ Error creando notificación:', error)

    let userMessage = 'Error al crear la notificación. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage =
        'No tienes permisos para crear notificaciones. Verifica tu autenticación.'
    } else if (error.code === 'unavailable') {
      userMessage = 'Servicio no disponible. Revisa tu conexión a internet.'
    } else if (error.message.includes('inválidos')) {
      userMessage = error.message
    }

    return {
      success: false,
      error: error.message,
      userMessage,
      code: error.code || 'unknown',
    }
  }
}

/**
 * Obtiene todas las notificaciones de un usuario ordenadas por fecha
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Lista de notificaciones
 */
export async function getUserNotifications(userId) {
  try {
    console.log('🔍 Obteniendo notificaciones para usuario:', userId)

    if (!userId || typeof userId !== 'string') {
      throw new Error('El ID del usuario es obligatorio')
    }

    // Consultar notificaciones del usuario ordenadas por fecha descendente
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isActive', '==', true), // Solo notificaciones activas
      orderBy('createdAt', 'desc'),
      limit(100) // Limitar a últimas 100 notificaciones
    )

    const querySnapshot = await getDocs(q)
    const notifications = []

    querySnapshot.forEach(doc => {
      const data = doc.data()
      notifications.push({
        id: doc.id,
        ...data,
        // Convertir timestamps de Firestore a strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        readAt: data.readAt?.toDate?.()?.toISOString() || null,
        archivedAt: data.archivedAt?.toDate?.()?.toISOString() || null,
      })
    })

    console.log(`✅ Encontradas ${notifications.length} notificaciones`)

    return {
      success: true,
      data: notifications,
      count: notifications.length,
      message: `Encontradas ${notifications.length} notificaciones`,
    }
  } catch (error) {
    console.error('❌ Error obteniendo notificaciones:', error)

    let userMessage = 'Error al obtener las notificaciones. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage = 'No tienes permisos para ver las notificaciones.'
    } else if (error.code === 'unavailable') {
      userMessage = 'Servicio no disponible. Revisa tu conexión a internet.'
    }

    return {
      success: false,
      error: error.message,
      userMessage,
      code: error.code || 'unknown',
    }
  }
}

/**
 * Marca una notificación como leída
 * @param {string} notificationId - ID de la notificación
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function markAsRead(notificationId) {
  try {
    console.log('👁️ Marcando notificación como leída:', notificationId)

    if (
      !notificationId ||
      typeof notificationId !== 'string' ||
      notificationId.trim() === ''
    ) {
      throw new Error('El ID de la notificación es obligatorio')
    }

    // Verificar que la notificación existe
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId.trim())
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Notificación no encontrada')
    }

    const notificationData = docSnap.data()

    // Solo actualizar si no está marcada como leída
    if (notificationData.status !== 'read') {
      await updateDoc(docRef, {
        status: 'read',
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      console.log('✅ Notificación marcada como leída exitosamente')
    } else {
      console.log('ℹ️ La notificación ya estaba marcada como leída')
    }

    return {
      success: true,
      message: 'Notificación marcada como leída',
      wasAlreadyRead: notificationData.status === 'read',
    }
  } catch (error) {
    console.error('❌ Error marcando notificación como leída:', error)

    let userMessage =
      'Error al marcar la notificación como leída. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage = 'No tienes permisos para actualizar esta notificación.'
    } else if (error.code === 'not-found') {
      userMessage = 'La notificación no existe o ha sido eliminada.'
    }

    return {
      success: false,
      error: error.message,
      userMessage,
      code: error.code || 'unknown',
    }
  }
}

/**
 * Obtiene el contador de notificaciones no leídas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Contador de notificaciones no leídas
 */
export async function getUnreadCount(userId) {
  try {
    console.log('🔢 Obteniendo contador de no leídas para usuario:', userId)

    if (!userId || typeof userId !== 'string') {
      throw new Error('El ID del usuario es obligatorio')
    }

    // Consultar solo notificaciones no leídas
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'unread'),
      where('isActive', '==', true)
    )

    const querySnapshot = await getDocs(q)
    const unreadCount = querySnapshot.size

    console.log(`✅ Encontradas ${unreadCount} notificaciones no leídas`)

    return {
      success: true,
      count: unreadCount,
      message: `${unreadCount} notificaciones no leídas`,
    }
  } catch (error) {
    console.error('❌ Error obteniendo contador de no leídas:', error)

    return {
      success: false,
      count: 0,
      error: error.message,
      userMessage:
        'Error al obtener el contador de notificaciones. Intenta nuevamente.',
      code: error.code || 'unknown',
    }
  }
}

/**
 * Elimina una notificación específica de Firestore
 * @param {string} notificationId - ID de la notificación
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function deleteNotification(notificationId) {
  try {
    console.log('🗑️ Eliminando notificación:', notificationId)

    if (
      !notificationId ||
      typeof notificationId !== 'string' ||
      notificationId.trim() === ''
    ) {
      throw new Error('El ID de la notificación es obligatorio')
    }

    // Verificar que la notificación existe
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId.trim())
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Notificación no encontrada')
    }

    // Eliminar documento de Firestore
    await deleteDoc(docRef)

    console.log('✅ Notificación eliminada exitosamente:', notificationId)

    return {
      success: true,
      message: 'Notificación eliminada exitosamente',
      deletedId: notificationId,
    }
  } catch (error) {
    console.error('❌ Error eliminando notificación:', error)

    let userMessage = 'Error al eliminar la notificación. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage = 'No tienes permisos para eliminar esta notificación.'
    } else if (error.code === 'not-found') {
      userMessage = 'La notificación no existe o ya ha sido eliminada.'
    }

    return {
      success: false,
      error: error.message,
      userMessage,
      code: error.code || 'unknown',
    }
  }
}

// Exportar funciones principales
export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  getUnreadCount,
  deleteNotification,
  generateNotificationContent,
}
