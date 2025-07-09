// src/services/exchangeService.js
// BLOQUE 7 - PASO 1.2: Funciones CRUD básicas para intercambios
// BLOQUE 7 - PASO 1.3: Funciones específicas de negocio para intercambios
//
// Funcionalidades implementadas:
// - createExchange: crear documento de intercambio en Firestore
// - getExchangeById: obtener intercambio específico por ID
// - updateExchange: actualizar intercambio existente
// - deleteExchange: eliminar intercambio de Firestore
// - createExchangeRequest: crear solicitud completa con validaciones de negocio
// - getUserExchangesReceived: obtener solicitudes recibidas por el usuario
// - getUserExchangesSent: obtener solicitudes enviadas por el usuario
// - updateExchangeStatus: cambiar estado con validaciones y permisos
// - getExchangeHistory: obtener historial de intercambios del usuario
// - Cache para seeds y users, validaciones de negocio completas

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

// BLOQUE 7 - PASO 8.1: Importar servicio de notificaciones para crear alertas
import { createNotification, NOTIFICATION_TYPES } from './notificationService'

// Nombres de colecciones en Firestore
const EXCHANGES_COLLECTION = 'exchanges'
const SEEDS_COLLECTION = 'seeds'
const USERS_COLLECTION = 'users'

// Cache simple para datos frecuentemente consultados
const cache = {
  seeds: new Map(),
  users: new Map(),
  // TTL de 5 minutos para el cache
  ttl: 5 * 60 * 1000,
}

/**
 * Obtiene datos de semilla con cache
 * @param {string} seedId - ID de la semilla
 * @returns {Promise<Object>} Datos de la semilla
 */
async function getCachedSeed(seedId) {
  const now = Date.now()
  const cached = cache.seeds.get(seedId)

  // Verificar si el cache es válido
  if (cached && now - cached.timestamp < cache.ttl) {
    return cached.data
  }

  try {
    const seedDoc = await getDoc(doc(db, SEEDS_COLLECTION, seedId))
    if (seedDoc.exists()) {
      const seedData = { id: seedDoc.id, ...seedDoc.data() }

      // Guardar en cache
      cache.seeds.set(seedId, {
        data: seedData,
        timestamp: now,
      })

      return seedData
    }
    return null
  } catch (error) {
    console.error('Error obteniendo semilla:', error)
    return null
  }
}

/**
 * Obtiene datos de usuario con cache
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
async function getCachedUser(userId) {
  // Validar que userId no sea undefined o null
  if (!userId || typeof userId !== 'string') {
    console.error('❌ getCachedUser: userId inválido:', {
      userId,
      type: typeof userId,
    })
    return null
  }

  const now = Date.now()
  const cached = cache.users.get(userId)

  // Verificar si el cache es válido
  if (cached && now - cached.timestamp < cache.ttl) {
    return cached.data
  }

  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId))
    if (userDoc.exists()) {
      const userData = { id: userDoc.id, ...userDoc.data() }

      // Guardar en cache
      cache.users.set(userId, {
        data: userData,
        timestamp: now,
      })

      return userData
    }
    console.log('📭 Usuario no existe en Firestore:', userId)
    return null
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }
}

/**
 * Limpia entradas vencidas del cache
 */
function cleanExpiredCache() {
  const now = Date.now()

  // Limpiar cache de semillas
  for (const [key, value] of cache.seeds.entries()) {
    if (now - value.timestamp > cache.ttl) {
      cache.seeds.delete(key)
    }
  }

  // Limpiar cache de usuarios
  for (const [key, value] of cache.users.entries()) {
    if (now - value.timestamp > cache.ttl) {
      cache.users.delete(key)
    }
  }
}

/**
 * Verifica si ya existe un intercambio pendiente entre las mismas semillas
 * @param {string} requesterId - ID del solicitante
 * @param {string} seedRequestedId - ID de la semilla solicitada
 * @param {string} seedOfferedId - ID de la semilla ofrecida
 * @returns {Promise<boolean>} True si existe un intercambio duplicado
 */
async function checkDuplicateExchange(
  requesterId,
  seedRequestedId,
  seedOfferedId
) {
  try {
    const q = query(
      collection(db, EXCHANGES_COLLECTION),
      where('requesterId', '==', requesterId),
      where('seedRequestedId', '==', seedRequestedId),
      where('seedOfferedId', '==', seedOfferedId),
      where('status', 'in', ['pending', 'accepted'])
    )

    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error verificando intercambio duplicado:', error)
    return false
  }
}

/**
 * Valida los datos básicos de un intercambio
 * @param {Object} exchangeData - Datos del intercambio
 * @returns {Object} Resultado de validación
 */
function validateExchangeData(exchangeData) {
  const errors = []

  // Campos obligatorios
  if (!exchangeData.requesterId || exchangeData.requesterId.trim() === '') {
    errors.push('El ID del solicitante es obligatorio')
  }

  if (!exchangeData.ownerId || exchangeData.ownerId.trim() === '') {
    errors.push('El ID del propietario es obligatorio')
  }

  if (
    !exchangeData.seedRequestedId ||
    exchangeData.seedRequestedId.trim() === ''
  ) {
    errors.push('El ID de la semilla solicitada es obligatorio')
  }

  if (!exchangeData.seedOfferedId || exchangeData.seedOfferedId.trim() === '') {
    errors.push('El ID de la semilla ofrecida es obligatorio')
  }

  // Validar que el solicitante y propietario sean diferentes
  if (exchangeData.requesterId === exchangeData.ownerId) {
    errors.push(
      'El solicitante y el propietario no pueden ser la misma persona'
    )
  }

  // Validar que las semillas sean diferentes
  if (exchangeData.seedRequestedId === exchangeData.seedOfferedId) {
    errors.push('No se puede intercambiar la misma semilla')
  }

  // Validar estado si se proporciona
  const validStatuses = ['pending', 'accepted', 'rejected', 'completed']
  if (exchangeData.status && !validStatuses.includes(exchangeData.status)) {
    errors.push('Estado de intercambio no válido')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Prepara los datos de intercambio para guardar en Firestore
 * @param {Object} exchangeData - Datos del intercambio
 * @returns {Object} Datos preparados
 */
function prepareExchangeData(exchangeData) {
  return {
    // IDs de usuarios
    requesterId: exchangeData.requesterId.trim(),
    ownerId: exchangeData.ownerId.trim(),

    // IDs de semillas
    seedRequestedId: exchangeData.seedRequestedId.trim(),
    seedOfferedId: exchangeData.seedOfferedId.trim(),

    // Estado del intercambio
    status: exchangeData.status || 'pending',

    // Mensaje opcional
    message: exchangeData.message?.trim() || '',

    // Información adicional (se pueden agregar en pasos futuros)
    notes: exchangeData.notes?.trim() || '',

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    // Metadatos
    version: 1,
    isActive: true,
  }
}

/**
 * Crea un nuevo intercambio en Firestore
 * @param {Object} exchangeData - Datos del intercambio
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function createExchange(exchangeData) {
  try {
    console.log('🔄 Iniciando creación de intercambio...', { exchangeData })

    // Validar datos de entrada
    if (!exchangeData || typeof exchangeData !== 'object') {
      throw new Error('Los datos del intercambio son obligatorios')
    }

    const validation = validateExchangeData(exchangeData)
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`)
    }

    // Preparar datos para Firestore
    const preparedData = prepareExchangeData(exchangeData)
    console.log('📝 Datos preparados para Firestore:', preparedData)

    // Guardar en Firestore
    const docRef = await addDoc(
      collection(db, EXCHANGES_COLLECTION),
      preparedData
    )

    console.log('✅ Intercambio creado exitosamente con ID:', docRef.id)

    return {
      success: true,
      exchangeId: docRef.id,
      message: 'Intercambio creado exitosamente',
      data: {
        id: docRef.id,
        ...preparedData,
        // Convertir serverTimestamp a fecha para mostrar
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('❌ Error creando intercambio:', error)

    // Determinar mensaje de error para el usuario
    let userMessage = 'Error al crear el intercambio. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage =
        'No tienes permisos para crear intercambios. Verifica tu autenticación.'
    } else if (error.code === 'unavailable') {
      userMessage = 'Servicio no disponible. Revisa tu conexión a internet.'
    } else if (error.message.includes('Datos inválidos')) {
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
 * Obtiene un intercambio específico por su ID
 * @param {string} exchangeId - ID del intercambio
 * @returns {Promise<Object>} Datos del intercambio
 */
export async function getExchangeById(exchangeId) {
  try {
    console.log('🔍 Obteniendo intercambio por ID:', exchangeId)

    // Validar entrada
    if (
      !exchangeId ||
      typeof exchangeId !== 'string' ||
      exchangeId.trim() === ''
    ) {
      throw new Error('El ID del intercambio es obligatorio')
    }

    const docRef = doc(db, EXCHANGES_COLLECTION, exchangeId.trim())
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()

      console.log('✅ Intercambio encontrado:', exchangeId)

      return {
        success: true,
        data: {
          id: docSnap.id,
          ...data,
          // Convertir timestamps de Firestore a strings
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        },
      }
    } else {
      console.log('📭 Intercambio no encontrado:', exchangeId)

      return {
        success: false,
        error: 'Intercambio no encontrado',
        userMessage: 'El intercambio solicitado no existe o ha sido eliminado',
      }
    }
  } catch (error) {
    console.error('❌ Error obteniendo intercambio:', error)

    let userMessage = 'Error al obtener el intercambio. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage = 'No tienes permisos para ver este intercambio.'
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
 * Actualiza un intercambio existente
 * @param {string} exchangeId - ID del intercambio
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updateExchange(exchangeId, updates) {
  try {
    console.log('🔄 Actualizando intercambio:', { exchangeId, updates })

    // Validar entrada
    if (
      !exchangeId ||
      typeof exchangeId !== 'string' ||
      exchangeId.trim() === ''
    ) {
      throw new Error('El ID del intercambio es obligatorio')
    }

    if (
      !updates ||
      typeof updates !== 'object' ||
      Object.keys(updates).length === 0
    ) {
      throw new Error('Los datos de actualización son obligatorios')
    }

    // Verificar que el intercambio existe
    const existingExchange = await getExchangeById(exchangeId)
    if (!existingExchange.success) {
      throw new Error('Intercambio no encontrado')
    }

    // Preparar datos de actualización
    const allowedFields = [
      'status',
      'message',
      'notes',
      'ownerId',
      'requesterId',
      'seedRequestedId',
      'seedOfferedId',
    ]

    const filteredUpdates = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        filteredUpdates[key] = updates[key]
      }
    })

    // Agregar timestamp de actualización y versión
    const updateData = {
      ...filteredUpdates,
      updatedAt: serverTimestamp(),
      version: (existingExchange.data.version || 1) + 1,
    }

    // Validar datos de actualización si incluyen campos críticos
    if (
      filteredUpdates.status ||
      filteredUpdates.requesterId ||
      filteredUpdates.ownerId
    ) {
      const tempData = { ...existingExchange.data, ...filteredUpdates }
      const validation = validateExchangeData(tempData)
      if (!validation.isValid) {
        throw new Error(
          `Datos de actualización inválidos: ${validation.errors.join(', ')}`
        )
      }
    }

    const docRef = doc(db, EXCHANGES_COLLECTION, exchangeId.trim())
    await updateDoc(docRef, updateData)

    console.log('✅ Intercambio actualizado exitosamente:', exchangeId)

    return {
      success: true,
      message: 'Intercambio actualizado exitosamente',
      updatedFields: Object.keys(filteredUpdates),
    }
  } catch (error) {
    console.error('❌ Error actualizando intercambio:', error)

    let userMessage = 'Error al actualizar el intercambio. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage = 'No tienes permisos para actualizar este intercambio.'
    } else if (error.code === 'not-found') {
      userMessage = 'El intercambio no existe o ha sido eliminado.'
    } else if (error.message.includes('Datos de actualización inválidos')) {
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
 * Elimina un intercambio de Firestore
 * @param {string} exchangeId - ID del intercambio
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function deleteExchange(exchangeId) {
  try {
    console.log('🗑️ Eliminando intercambio:', exchangeId)

    // Validar entrada
    if (
      !exchangeId ||
      typeof exchangeId !== 'string' ||
      exchangeId.trim() === ''
    ) {
      throw new Error('El ID del intercambio es obligatorio')
    }

    // Verificar que el intercambio existe
    const existingExchange = await getExchangeById(exchangeId)
    if (!existingExchange.success) {
      throw new Error('Intercambio no encontrado')
    }

    // Eliminar documento de Firestore
    const docRef = doc(db, EXCHANGES_COLLECTION, exchangeId.trim())
    await deleteDoc(docRef)

    console.log('✅ Intercambio eliminado exitosamente:', exchangeId)

    return {
      success: true,
      message: 'Intercambio eliminado exitosamente',
      deletedId: exchangeId,
    }
  } catch (error) {
    console.error('❌ Error eliminando intercambio:', error)

    let userMessage = 'Error al eliminar el intercambio. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage = 'No tienes permisos para eliminar este intercambio.'
    } else if (error.code === 'not-found') {
      userMessage = 'El intercambio no existe o ya ha sido eliminado.'
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
 * Crea una solicitud de intercambio completa con validaciones de negocio
 * @param {string} requesterId - ID del usuario solicitante
 * @param {string} seedRequestedId - ID de la semilla solicitada
 * @param {string} seedOfferedId - ID de la semilla ofrecida
 * @param {string} message - Mensaje opcional de la solicitud
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function createExchangeRequest(
  requesterId,
  seedRequestedId,
  seedOfferedId,
  message = ''
) {
  try {
    console.log('🔄 Creando solicitud de intercambio...', {
      requesterId,
      seedRequestedId,
      seedOfferedId,
      message,
    })

    // Validar parámetros de entrada
    if (!requesterId || !seedRequestedId || !seedOfferedId) {
      throw new Error(
        'Todos los parámetros son obligatorios: requesterId, seedRequestedId, seedOfferedId'
      )
    }

    // Limpiar cache vencido
    cleanExpiredCache()

    // Verificar que las semillas existen y obtener datos
    const [seedRequested, seedOffered] = await Promise.all([
      getCachedSeed(seedRequestedId),
      getCachedSeed(seedOfferedId),
    ])

    if (!seedRequested) {
      throw new Error('La semilla solicitada no existe o no está disponible')
    }

    if (!seedOffered) {
      throw new Error('La semilla ofrecida no existe o no está disponible')
    }

    // Validar que las semillas tengan el campo ownerId
    if (!seedRequested.ownerId) {
      console.error('❌ La semilla solicitada no tiene ownerId:', seedRequested)
      throw new Error(
        'La semilla solicitada no tiene información del propietario'
      )
    }

    if (!seedOffered.ownerId) {
      console.error('❌ La semilla ofrecida no tiene ownerId:', seedOffered)
      throw new Error(
        'La semilla ofrecida no tiene información del propietario'
      )
    }

    console.log('🔍 Validando datos de semillas:', {
      seedRequested: {
        id: seedRequestedId,
        ownerId: seedRequested.ownerId,
        name: seedRequested.name,
        isActive: seedRequested.isActive,
      },
      seedOffered: {
        id: seedOfferedId,
        ownerId: seedOffered.ownerId,
        name: seedOffered.name,
        isActive: seedOffered.isActive,
      },
      requesterId,
    })

    // Verificar que el solicitante no sea el propietario de la semilla solicitada
    if (seedRequested.ownerId === requesterId) {
      throw new Error('No puedes solicitar tu propia semilla')
    }

    // Verificar que el solicitante sea el propietario de la semilla ofrecida
    // Normalizar IDs para comparación (eliminar espacios y convertir a string)
    const normalizedSeedOwnerId = String(seedOffered.ownerId || '').trim()
    const normalizedRequesterId = String(requesterId || '').trim()

    console.log('🔍 Comparación detallada de IDs:', {
      seedOffered: {
        ownerId: seedOffered.ownerId,
        ownerIdType: typeof seedOffered.ownerId,
        ownerIdLength: seedOffered.ownerId?.length,
        normalizedOwnerId: normalizedSeedOwnerId,
      },
      requester: {
        id: requesterId,
        idType: typeof requesterId,
        idLength: requesterId?.length,
        normalizedId: normalizedRequesterId,
      },
      comparaciones: {
        original: seedOffered.ownerId === requesterId,
        normalizada: normalizedSeedOwnerId === normalizedRequesterId,
        estricta: seedOffered.ownerId !== requesterId,
      },
    })

    if (normalizedSeedOwnerId !== normalizedRequesterId) {
      console.log('❌ Validación de propiedad falló:', {
        seedOfferedId,
        seedOffered: {
          ownerId: seedOffered.ownerId,
          normalizedOwnerId: normalizedSeedOwnerId,
          name: seedOffered.name,
        },
        requesterId,
        normalizedRequesterId,
        coincide: normalizedSeedOwnerId === normalizedRequesterId,
      })
      throw new Error('Solo puedes ofrecer semillas que te pertenecen')
    }

    // Verificar que las semillas estén disponibles
    if (seedRequested.isActive !== true) {
      throw new Error(
        'La semilla solicitada no está disponible para intercambio'
      )
    }

    if (seedOffered.isActive !== true) {
      throw new Error('La semilla ofrecida no está disponible para intercambio')
    }

    // Verificar duplicados
    const isDuplicate = await checkDuplicateExchange(
      requesterId,
      seedRequestedId,
      seedOfferedId
    )
    if (isDuplicate) {
      throw new Error(
        'Ya existe una solicitud de intercambio pendiente para estas semillas'
      )
    }

    // Obtener datos del propietario de la semilla solicitada
    const owner = await getCachedUser(seedRequested.ownerId)
    if (!owner) {
      console.log('❌ Error: Propietario de semilla no encontrado:', {
        seedRequestedId,
        seedRequested: {
          ownerId: seedRequested.ownerId,
          name: seedRequested.name,
        },
      })
      throw new Error('El propietario de la semilla solicitada no existe')
    }

    // Obtener datos del usuario que hace la solicitud (para la notificación)
    const requester = await getCachedUser(requesterId)
    if (!requester) {
      console.log('❌ Error: Usuario solicitante no encontrado:', {
        requesterId,
      })
      throw new Error('Usuario solicitante no existe')
    }

    // Crear el intercambio usando la función CRUD existente
    const exchangeData = {
      requesterId,
      ownerId: seedRequested.ownerId,
      seedRequestedId,
      seedOfferedId,
      message: message.trim(),
      status: 'pending',
    }

    const result = await createExchange(exchangeData)

    if (result.success) {
      console.log('✅ Solicitud de intercambio creada exitosamente')

      // BLOQUE 7 - PASO 8.1: Crear notificación para el propietario de la semilla
      try {
        console.log('📮 Intentando crear notificación con datos:', {
          userId: seedRequested.ownerId,
          type: NOTIFICATION_TYPES.EXCHANGE_REQUEST,
          relatedId: result.data.id,
          requesterName: requester.name || requester.email || 'Usuario',
          seedRequestedName: seedRequested.name,
          seedOfferedName: seedOffered.name,
        })

        console.log('📮 Creando notificación para el propietario...', {
          ownerUserId: seedRequested.ownerId,
          exchangeId: result.data.id,
        })

        const notificationResult = await createNotification({
          userId: seedRequested.ownerId, // Propietario de la semilla solicitada
          type: NOTIFICATION_TYPES.EXCHANGE_REQUEST,
          relatedId: result.data.id, // ID del intercambio creado
          data: {
            requesterId,
            requesterName: requester.name || requester.email || 'Usuario', // Usar nombre real del usuario
            seedRequestedId,
            seedRequestedName: seedRequested.name,
            seedOfferedId,
            seedOfferedName: seedOffered.name,
          },
        })

        console.log('✅ Notificación creada exitosamente:', notificationResult)
      } catch (notificationError) {
        console.error(
          '⚠️ Error creando notificación (pero intercambio fue creado):',
          notificationError
        )
        // No fallar el intercambio si la notificación falla
      }

      // Agregar información enriquecida para la respuesta
      return {
        ...result,
        enrichedData: {
          ...result.data,
          seedRequested: {
            id: seedRequested.id,
            name: seedRequested.name,
            variety: seedRequested.variety,
            imageUrl: seedRequested.imageUrl,
          },
          seedOffered: {
            id: seedOffered.id,
            name: seedOffered.name,
            variety: seedOffered.variety,
            imageUrl: seedOffered.imageUrl,
          },
          owner: {
            id: owner.id,
            name: owner.name,
            email: owner.email,
          },
        },
      }
    }

    return result
  } catch (error) {
    console.error('❌ Error creando solicitud de intercambio:', error)

    return {
      success: false,
      error: error.message,
      userMessage:
        error.message.includes('obligatorios') ||
        error.message.includes('existe') ||
        error.message.includes('disponible') ||
        error.message.includes('pertenecen') ||
        error.message.includes('pendiente')
          ? error.message
          : 'Error al crear la solicitud de intercambio. Intenta nuevamente.',
      code: 'business_validation_error',
    }
  }
}

/**
 * Obtiene todas las solicitudes de intercambio recibidas por un usuario
 * @param {string} userId - ID del usuario propietario
 * @returns {Promise<Object>} Lista de intercambios recibidos
 */
export async function getUserExchangesReceived(userId) {
  try {
    console.log('🔍 Obteniendo intercambios recibidos para usuario:', userId)

    if (!userId || typeof userId !== 'string') {
      throw new Error('El ID del usuario es obligatorio')
    }

    // Consultar intercambios donde el usuario es el propietario
    const q = query(
      collection(db, EXCHANGES_COLLECTION),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50) // Limitar resultados para performance
    )

    const querySnapshot = await getDocs(q)
    const exchanges = []

    // Procesar cada intercambio y enriquecer con datos
    for (const doc of querySnapshot.docs) {
      const exchangeData = { id: doc.id, ...doc.data() }

      try {
        // Obtener datos enriquecidos en paralelo
        const [seedRequested, seedOffered, requester] = await Promise.all([
          getCachedSeed(exchangeData.seedRequestedId),
          getCachedSeed(exchangeData.seedOfferedId),
          getCachedUser(exchangeData.requesterId),
        ])

        exchanges.push({
          ...exchangeData,
          createdAt: exchangeData.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: exchangeData.updatedAt?.toDate?.()?.toISOString() || null,
          seedRequested: seedRequested
            ? {
                id: seedRequested.id,
                name: seedRequested.name,
                variety: seedRequested.variety,
                imageUrl: seedRequested.imageUrl,
              }
            : null,
          seedOffered: seedOffered
            ? {
                id: seedOffered.id,
                name: seedOffered.name,
                variety: seedOffered.variety,
                imageUrl: seedOffered.imageUrl,
              }
            : null,
          requester: requester
            ? {
                id: requester.id,
                name: requester.name,
                email: requester.email,
                whatsapp: requester.whatsappNumber || requester.whatsapp,
              }
            : null,
        })
      } catch (error) {
        console.error('Error enriqueciendo intercambio:', doc.id, error)
        // Incluir el intercambio sin datos enriquecidos en caso de error
        exchanges.push({
          ...exchangeData,
          createdAt: exchangeData.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: exchangeData.updatedAt?.toDate?.()?.toISOString() || null,
        })
      }
    }

    console.log(`✅ Encontrados ${exchanges.length} intercambios recibidos`)

    return {
      success: true,
      data: exchanges,
      count: exchanges.length,
      message: `Encontrados ${exchanges.length} intercambios recibidos`,
    }
  } catch (error) {
    console.error('❌ Error obteniendo intercambios recibidos:', error)

    return {
      success: false,
      error: error.message,
      userMessage:
        'Error al obtener las solicitudes recibidas. Intenta nuevamente.',
      code: error.code || 'unknown',
    }
  }
}

/**
 * Obtiene todas las solicitudes de intercambio enviadas por un usuario
 * @param {string} userId - ID del usuario solicitante
 * @returns {Promise<Object>} Lista de intercambios enviados
 */
export async function getUserExchangesSent(userId) {
  try {
    console.log('🔍 Obteniendo intercambios enviados para usuario:', userId)

    if (!userId || typeof userId !== 'string') {
      throw new Error('El ID del usuario es obligatorio')
    }

    // Consultar intercambios donde el usuario es el solicitante
    const q = query(
      collection(db, EXCHANGES_COLLECTION),
      where('requesterId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50) // Limitar resultados para performance
    )

    const querySnapshot = await getDocs(q)
    const exchanges = []

    // Procesar cada intercambio y enriquecer con datos
    for (const doc of querySnapshot.docs) {
      const exchangeData = { id: doc.id, ...doc.data() }

      try {
        // Obtener datos enriquecidos en paralelo
        const [seedRequested, seedOffered, owner] = await Promise.all([
          getCachedSeed(exchangeData.seedRequestedId),
          getCachedSeed(exchangeData.seedOfferedId),
          getCachedUser(exchangeData.ownerId),
        ])

        exchanges.push({
          ...exchangeData,
          createdAt: exchangeData.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: exchangeData.updatedAt?.toDate?.()?.toISOString() || null,
          seedRequested: seedRequested
            ? {
                id: seedRequested.id,
                name: seedRequested.name,
                variety: seedRequested.variety,
                imageUrl: seedRequested.imageUrl,
              }
            : null,
          seedOffered: seedOffered
            ? {
                id: seedOffered.id,
                name: seedOffered.name,
                variety: seedOffered.variety,
                imageUrl: seedOffered.imageUrl,
              }
            : null,
          owner: owner
            ? {
                id: owner.id,
                name: owner.name,
                email: owner.email,
                whatsapp: owner.whatsappNumber || owner.whatsapp,
              }
            : null,
        })
      } catch (error) {
        console.error('Error enriqueciendo intercambio:', doc.id, error)
        // Incluir el intercambio sin datos enriquecidos en caso de error
        exchanges.push({
          ...exchangeData,
          createdAt: exchangeData.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: exchangeData.updatedAt?.toDate?.()?.toISOString() || null,
        })
      }
    }

    console.log(`✅ Encontrados ${exchanges.length} intercambios enviados`)

    return {
      success: true,
      data: exchanges,
      count: exchanges.length,
      message: `Encontrados ${exchanges.length} intercambios enviados`,
    }
  } catch (error) {
    console.error('❌ Error obteniendo intercambios enviados:', error)

    return {
      success: false,
      error: error.message,
      userMessage:
        'Error al obtener las solicitudes enviadas. Intenta nuevamente.',
      code: error.code || 'unknown',
    }
  }
}

/**
 * Actualiza el estado de un intercambio con validaciones de permisos
 * @param {string} exchangeId - ID del intercambio
 * @param {string} newStatus - Nuevo estado ('accepted', 'rejected', 'completed')
 * @param {string} updatedBy - ID del usuario que actualiza
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updateExchangeStatus(exchangeId, newStatus, updatedBy) {
  try {
    console.log('🔄 Actualizando estado de intercambio:', {
      exchangeId,
      newStatus,
      updatedBy,
    })

    // Validar parámetros
    if (!exchangeId || !newStatus || !updatedBy) {
      throw new Error('Todos los parámetros son obligatorios')
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed']
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        'Estado no válido. Debe ser: pending, accepted, rejected, completed'
      )
    }

    // Obtener intercambio actual
    const exchangeResult = await getExchangeById(exchangeId)
    if (!exchangeResult.success) {
      throw new Error('Intercambio no encontrado')
    }

    const exchange = exchangeResult.data
    const currentStatus = exchange.status

    // Validar transiciones de estado permitidas
    const allowedTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: ['completed', 'rejected'],
      rejected: [], // No se puede cambiar desde rejected
      completed: [], // No se puede cambiar desde completed
    }

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `No se puede cambiar de estado "${currentStatus}" a "${newStatus}"`
      )
    }

    // Validar permisos según el estado
    let hasPermission = false

    if (newStatus === 'accepted' || newStatus === 'rejected') {
      // Solo el propietario (owner) puede aceptar o rechazar
      hasPermission = exchange.ownerId === updatedBy
    } else if (newStatus === 'completed') {
      // Tanto el propietario como el solicitante pueden marcar como completado
      hasPermission =
        exchange.ownerId === updatedBy || exchange.requesterId === updatedBy
    }

    if (!hasPermission) {
      throw new Error(
        'No tienes permisos para actualizar este intercambio a este estado'
      )
    }

    // Actualizar usando función CRUD existente
    const updateData = {
      status: newStatus,
      [`${newStatus}At`]: serverTimestamp(),
      [`${newStatus}By`]: updatedBy,
    }

    // Si se acepta, agregar información adicional
    if (newStatus === 'accepted') {
      updateData.acceptedAt = serverTimestamp()
      updateData.acceptedBy = updatedBy
    }

    const result = await updateExchange(exchangeId, updateData)

    if (result.success) {
      console.log('✅ Estado de intercambio actualizado exitosamente')

      // Si el intercambio se completa, podríamos agregar lógica adicional aquí
      // como actualizar estadísticas de usuarios, crear notificaciones, etc.

      return {
        ...result,
        previousStatus: currentStatus,
        newStatus,
        updatedBy,
        message: `Intercambio ${
          newStatus === 'accepted'
            ? 'aceptado'
            : newStatus === 'rejected'
              ? 'rechazado'
              : newStatus === 'completed'
                ? 'completado'
                : 'actualizado'
        } exitosamente`,
      }
    }

    return result
  } catch (error) {
    console.error('❌ Error actualizando estado de intercambio:', error)

    return {
      success: false,
      error: error.message,
      userMessage:
        error.message.includes('obligatorios') ||
        error.message.includes('válido') ||
        error.message.includes('encontrado') ||
        error.message.includes('cambiar') ||
        error.message.includes('permisos')
          ? error.message
          : 'Error al actualizar el estado del intercambio. Intenta nuevamente.',
      code: 'status_update_error',
    }
  }
}

/**
 * Obtiene el historial de intercambios completados/rechazados de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Historial de intercambios
 */
export async function getExchangeHistory(userId) {
  try {
    console.log('📚 Obteniendo historial de intercambios para usuario:', userId)

    if (!userId || typeof userId !== 'string') {
      throw new Error('El ID del usuario es obligatorio')
    }

    // Consultar intercambios donde el usuario participó y que estén completados o rechazados
    const queries = [
      // Como propietario
      query(
        collection(db, EXCHANGES_COLLECTION),
        where('ownerId', '==', userId),
        where('status', 'in', ['completed', 'rejected']),
        orderBy('updatedAt', 'desc')
      ),
      // Como solicitante
      query(
        collection(db, EXCHANGES_COLLECTION),
        where('requesterId', '==', userId),
        where('status', 'in', ['completed', 'rejected']),
        orderBy('updatedAt', 'desc')
      ),
    ]

    // Ejecutar ambas consultas en paralelo
    const [ownerSnapshot, requesterSnapshot] = await Promise.all([
      getDocs(queries[0]),
      getDocs(queries[1]),
    ])

    // Combinar resultados y eliminar duplicados
    const exchangeMap = new Map()

    // Procesar intercambios como propietario
    ownerSnapshot.docs.forEach(doc => {
      exchangeMap.set(doc.id, { id: doc.id, ...doc.data(), userRole: 'owner' })
    })

    // Procesar intercambios como solicitante
    requesterSnapshot.docs.forEach(doc => {
      if (!exchangeMap.has(doc.id)) {
        exchangeMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
          userRole: 'requester',
        })
      }
    })

    // Convertir a array y enriquecer con datos
    const exchanges = []

    for (const exchange of exchangeMap.values()) {
      try {
        // Obtener datos enriquecidos
        const [seedRequested, seedOffered, requester, owner] =
          await Promise.all([
            getCachedSeed(exchange.seedRequestedId),
            getCachedSeed(exchange.seedOfferedId),
            getCachedUser(exchange.requesterId),
            getCachedUser(exchange.ownerId),
          ])

        exchanges.push({
          ...exchange,
          createdAt: exchange.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: exchange.updatedAt?.toDate?.()?.toISOString() || null,
          acceptedAt: exchange.acceptedAt?.toDate?.()?.toISOString() || null,
          rejectedAt: exchange.rejectedAt?.toDate?.()?.toISOString() || null,
          completedAt: exchange.completedAt?.toDate?.()?.toISOString() || null,
          seedRequested: seedRequested
            ? {
                id: seedRequested.id,
                name: seedRequested.name,
                variety: seedRequested.variety,
                imageUrl: seedRequested.imageUrl,
              }
            : null,
          seedOffered: seedOffered
            ? {
                id: seedOffered.id,
                name: seedOffered.name,
                variety: seedOffered.variety,
                imageUrl: seedOffered.imageUrl,
              }
            : null,
          requester: requester
            ? {
                id: requester.id,
                name: requester.name,
                email: requester.email,
                whatsapp: requester.whatsappNumber || requester.whatsapp,
              }
            : null,
          owner: owner
            ? {
                id: owner.id,
                name: owner.name,
                email: owner.email,
                whatsapp: owner.whatsappNumber || owner.whatsapp,
              }
            : null,
        })
      } catch (error) {
        console.error(
          'Error enriqueciendo intercambio en historial:',
          exchange.id,
          error
        )
        // Incluir sin enriquecer en caso de error
        exchanges.push({
          ...exchange,
          createdAt: exchange.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: exchange.updatedAt?.toDate?.()?.toISOString() || null,
        })
      }
    }

    // Ordenar por fecha de actualización más reciente
    exchanges.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    console.log(`✅ Encontrados ${exchanges.length} intercambios en historial`)

    // Generar estadísticas básicas
    const stats = {
      total: exchanges.length,
      completed: exchanges.filter(e => e.status === 'completed').length,
      rejected: exchanges.filter(e => e.status === 'rejected').length,
      asOwner: exchanges.filter(e => e.userRole === 'owner').length,
      asRequester: exchanges.filter(e => e.userRole === 'requester').length,
    }

    return {
      success: true,
      data: exchanges,
      stats,
      message: `Historial con ${exchanges.length} intercambios obtenido exitosamente`,
    }
  } catch (error) {
    console.error('❌ Error obteniendo historial de intercambios:', error)

    return {
      success: false,
      error: error.message,
      userMessage:
        'Error al obtener el historial de intercambios. Intenta nuevamente.',
      code: error.code || 'unknown',
    }
  }
}

/**
 * Verifica si una semilla tiene intercambios pendientes o activos
 * @param {string} seedId - ID de la semilla
 * @returns {Promise<Object>} Resultado con información de intercambios
 */
export async function checkSeedActiveExchanges(seedId) {
  try {
    console.log('🔍 Verificando intercambios activos para semilla:', seedId)

    if (!seedId || typeof seedId !== 'string') {
      throw new Error('El ID de la semilla es obligatorio')
    }

    // Buscar intercambios donde la semilla está involucrada y tiene estados activos
    const [requestedQuery, offeredQuery] = await Promise.all([
      // Semilla solicitada
      getDocs(
        query(
          collection(db, EXCHANGES_COLLECTION),
          where('seedRequestedId', '==', seedId),
          where('status', 'in', ['pending', 'accepted'])
        )
      ),
      // Semilla ofrecida
      getDocs(
        query(
          collection(db, EXCHANGES_COLLECTION),
          where('seedOfferedId', '==', seedId),
          where('status', 'in', ['pending', 'accepted'])
        )
      ),
    ])

    const activeExchanges = []

    // Procesar intercambios donde es semilla solicitada
    requestedQuery.forEach(doc => {
      const data = doc.data()
      activeExchanges.push({
        id: doc.id,
        type: 'requested',
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        requesterId: data.requesterId,
        ownerId: data.ownerId,
      })
    })

    // Procesar intercambios donde es semilla ofrecida
    offeredQuery.forEach(doc => {
      const data = doc.data()
      activeExchanges.push({
        id: doc.id,
        type: 'offered',
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        requesterId: data.requesterId,
        ownerId: data.ownerId,
      })
    })

    const hasActiveExchanges = activeExchanges.length > 0
    const pendingCount = activeExchanges.filter(
      ex => ex.status === 'pending'
    ).length
    const acceptedCount = activeExchanges.filter(
      ex => ex.status === 'accepted'
    ).length

    console.log(
      `✅ Verificación completada: ${activeExchanges.length} intercambios activos`
    )

    return {
      success: true,
      hasActiveExchanges,
      data: {
        activeExchanges,
        counts: {
          total: activeExchanges.length,
          pending: pendingCount,
          accepted: acceptedCount,
        },
      },
    }
  } catch (error) {
    console.error('❌ Error verificando intercambios activos:', error)
    return {
      success: false,
      error: error.message,
      hasActiveExchanges: false,
      data: {
        activeExchanges: [],
        counts: { total: 0, pending: 0, accepted: 0 },
      },
    }
  }
}

// Exportar funciones principales (mantener las existentes y agregar las nuevas)
export default {
  // Funciones CRUD básicas (Paso 1.2)
  createExchange,
  getExchangeById,
  updateExchange,
  deleteExchange,

  // Funciones de negocio específicas (Paso 1.3)
  createExchangeRequest,
  getUserExchangesReceived,
  getUserExchangesSent,
  updateExchangeStatus,
  getExchangeHistory,

  // Funciones auxiliares para testing y depuración
  getCachedSeed,
  getCachedUser,
  cleanExpiredCache,
  checkDuplicateExchange,
  checkSeedActiveExchanges,
}
