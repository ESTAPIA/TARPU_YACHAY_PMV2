// src/services/userProfileService.js
// BLOQUE 8 - PASO 1.2 y 1.3: Servicio de perfil de usuario con estadísticas optimizadas
//
// Funcionalidades implementadas:
// - getUserProfile: obtener datos del perfil de usuario
// - updateUserProfile: actualizar información del perfil
// - updateWhatsAppNumber: función específica para actualizar WhatsApp
// - calculateUserStats: estadísticas en tiempo real optimizadas con cache
// - getUserSeeds: obtener semillas del usuario (delegada a seedService)
// - invalidateUserStatsCache: invalidar cache cuando cambien los datos
// - Validaciones de datos usando profileValidation.js y whatsappUtils.js
// - Manejo de errores de Firestore apropiado
// - Cache inteligente con TTL de 10 minutos para estadísticas

import { db } from '../firebase-config'
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'

// Importar validaciones existentes
import {
  validateUserProfile,
  prepareProfileDataForFirestore,
} from '../utils/profileValidation'
import {
  isValidEcuadorianPhone,
  normalizeEcuadorianPhone,
} from '../utils/whatsappUtils'
import { getUserSeeds as getSeedsFromService } from './seedService'
import {
  defaultUserSettings,
  defaultUserStats,
} from '../models/userProfileModel'

// Nombres de colecciones en Firestore
const USERS_COLLECTION = 'users'
const SEEDS_COLLECTION = 'seeds'
const EXCHANGES_COLLECTION = 'exchanges'

// BLOQUE 8 - PASO 1.3: Cache optimizado para estadísticas de usuarios
// Cache inteligente con TTL automático e invalidación selectiva
const statsCache = {
  data: new Map(), // userId -> { stats, timestamp }
  ttl: 10 * 60 * 1000, // TTL de 10 minutos

  /**
   * Obtiene estadísticas del cache si están vigentes
   * @param {string} userId - ID del usuario
   * @returns {Object|null} Estadísticas cacheadas o null
   */
  get(userId) {
    const cached = this.data.get(userId)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.ttl) {
      this.data.delete(userId)
      return null
    }

    return cached.stats
  },

  /**
   * Guarda estadísticas en el cache
   * @param {string} userId - ID del usuario
   * @param {Object} stats - Estadísticas calculadas
   */
  set(userId, stats) {
    this.data.set(userId, {
      stats: { ...stats },
      timestamp: Date.now(),
    })
  },

  /**
   * Invalida el cache de un usuario específico
   * @param {string} userId - ID del usuario
   */
  invalidate(userId) {
    this.data.delete(userId)
    console.log(`🔄 Cache de estadísticas invalidado para usuario: ${userId}`)
  },

  /**
   * Limpia todo el cache
   */
  clear() {
    this.data.clear()
    console.log('🧹 Cache de estadísticas limpiado completamente')
  },

  /**
   * Obtiene información del estado del cache
   * @returns {Object} Estadísticas del cache
   */
  getInfo() {
    return {
      size: this.data.size,
      ttlMinutes: this.ttl / (1000 * 60),
      entries: Array.from(this.data.keys()),
    }
  },
}

/**
 * Obtiene el perfil completo de un usuario
 * @param {string} userId - ID del usuario (Firebase UID)
 * @returns {Promise<Object>} Resultado con datos del perfil
 */
export async function getUserProfile(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('ID de usuario requerido y debe ser válido')
    }

    console.log('📋 Obteniendo perfil de usuario:', userId)

    const userDocRef = doc(db, USERS_COLLECTION, userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      // Usuario no encontrado, retornar estructura básica
      console.log('⚠️ Perfil no encontrado, creando estructura básica')
      return {
        success: true,
        data: {
          uid: userId,
          name: '',
          email: '',
          location: '',
          whatsappNumber: '',
          profileImageUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: defaultUserSettings,
          stats: defaultUserStats,
          isComplete: false,
        },
        message: 'Perfil no encontrado, estructura básica creada',
      }
    }

    const userData = userDoc.data()

    // Transformar timestamps a strings
    const profileData = {
      ...userData,
      createdAt:
        userData.createdAt?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
      updatedAt:
        userData.updatedAt?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
      // Asegurar que settings y stats existan
      settings: userData.settings || defaultUserSettings,
      stats: userData.stats || defaultUserStats,
      // Marcar si el perfil está completo para intercambios
      isComplete: !!userData.whatsappNumber && !!userData.name,
    }

    console.log('✅ Perfil obtenido exitosamente')
    return {
      success: true,
      data: profileData,
      message: 'Perfil obtenido exitosamente',
    }
  } catch (error) {
    console.error('❌ Error obteniendo perfil de usuario:', error)
    return {
      success: false,
      error: error.message,
      message: 'Error al obtener el perfil del usuario',
    }
  }
}

/**
 * Actualiza el perfil completo de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updateUserProfile(userId, profileData) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('ID de usuario requerido y debe ser válido')
    }

    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Datos de perfil requeridos')
    }

    console.log('🔄 Actualizando perfil de usuario:', userId, profileData)

    // Validar los datos del perfil
    const validation = validateUserProfile({ uid: userId, ...profileData })
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`)
    }

    // Preparar datos para Firestore
    const preparedData = prepareProfileDataForFirestore({
      uid: userId,
      ...profileData,
    })

    // Forzar updatedAt
    preparedData.updatedAt = serverTimestamp()

    const userDocRef = doc(db, USERS_COLLECTION, userId)

    // Verificar si el documento existe
    const existingDoc = await getDoc(userDocRef)

    if (existingDoc.exists()) {
      // Actualizar documento existente
      await updateDoc(userDocRef, preparedData)
    } else {
      // Crear nuevo documento si no existe
      preparedData.createdAt = serverTimestamp()
      await setDoc(userDocRef, preparedData)
    }

    console.log('✅ Perfil actualizado exitosamente')
    return {
      success: true,
      data: {
        ...preparedData,
        uid: userId,
        updatedAt: new Date().toISOString(),
      },
      message: 'Perfil actualizado exitosamente',
    }
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error)

    // Mensajes de error específicos para mejor UX
    let userMessage = 'Error al actualizar el perfil'

    if (error.code === 'permission-denied') {
      userMessage = 'No tienes permisos para actualizar este perfil'
    } else if (error.code === 'unavailable') {
      userMessage =
        'Sin conexión. Los cambios se guardarán cuando tengas internet'
    } else if (error.message.includes('Datos inválidos')) {
      userMessage = error.message
    }

    return {
      success: false,
      error: error.message,
      message: userMessage,
    }
  }
}

/**
 * Actualiza específicamente el número de WhatsApp del usuario
 * @param {string} userId - ID del usuario
 * @param {string} phoneNumber - Número de WhatsApp en formato ecuatoriano
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updateWhatsAppNumber(userId, phoneNumber) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('ID de usuario requerido')
    }

    console.log('📱 Actualizando WhatsApp de usuario:', userId, phoneNumber)

    // Validar número de WhatsApp
    if (phoneNumber && !isValidEcuadorianPhone(phoneNumber)) {
      throw new Error(
        'Número de WhatsApp inválido. Formato requerido: +593XXXXXXXXX'
      )
    }

    // Normalizar número si es válido
    const normalizedPhone = phoneNumber
      ? normalizeEcuadorianPhone(phoneNumber)
      : ''

    const userDocRef = doc(db, USERS_COLLECTION, userId)
    const updateData = {
      whatsappNumber: normalizedPhone,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(userDocRef, updateData)

    console.log('✅ WhatsApp actualizado exitosamente')
    return {
      success: true,
      data: {
        whatsappNumber: normalizedPhone,
        updatedAt: new Date().toISOString(),
      },
      message: 'Número de WhatsApp actualizado exitosamente',
    }
  } catch (error) {
    console.error('❌ Error actualizando WhatsApp:', error)
    return {
      success: false,
      error: error.message,
      message: 'Error al actualizar el número de WhatsApp',
    }
  }
}

/**
 * BLOQUE 8 - PASO 1.3: Calcula estadísticas de actividad del usuario en tiempo real
 * Versión optimizada con cache y integración completa con servicios existentes
 * @param {string} userId - ID del usuario
 * @param {boolean} forceRefresh - Forzar recálculo ignorando cache
 * @returns {Promise<Object>} Estadísticas calculadas
 */
export async function calculateUserStats(userId, forceRefresh = false) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('ID de usuario requerido')
    }

    console.log('📊 Calculando estadísticas para usuario:', userId)

    // Verificar cache si no se fuerza refresh
    if (!forceRefresh) {
      const cachedStats = statsCache.get(userId)
      if (cachedStats) {
        console.log('⚡ Estadísticas obtenidas del cache')
        return {
          success: true,
          data: cachedStats,
          message: 'Estadísticas obtenidas del cache',
          fromCache: true,
        }
      }
    }

    // Calcular estadísticas utilizando servicios existentes (optimizado)
    const [seedsResult, exchangesResult] = await Promise.all([
      calculateSeedsStatsOptimized(userId),
      calculateExchangesStatsOptimized(userId),
    ])

    if (!seedsResult.success || !exchangesResult.success) {
      throw new Error('Error calculando estadísticas componentes')
    }

    // Combinar estadísticas
    const stats = {
      seedsRegistered: seedsResult.data.count,
      exchangesCompleted: exchangesResult.data.completed,
      exchangesPending: exchangesResult.data.pending,
      mostRequestedSeed: exchangesResult.data.mostRequested,
      lastCalculated: new Date().toISOString(),
    }

    // Guardar en cache
    statsCache.set(userId, stats)

    console.log('✅ Estadísticas calculadas y cacheadas:', stats)
    return {
      success: true,
      data: stats,
      message: 'Estadísticas calculadas exitosamente',
      fromCache: false,
    }
  } catch (error) {
    console.error('❌ Error calculando estadísticas:', error)
    return {
      success: false,
      error: error.message,
      data: defaultUserStats,
      message: 'Error al calcular estadísticas, usando valores por defecto',
    }
  }
}

/**
 * Función auxiliar optimizada para calcular estadísticas de semillas
 * Utiliza el seedService existente con configuración específica
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Estadísticas de semillas
 */
async function calculateSeedsStatsOptimized(userId) {
  try {
    // Usar seedService existente con configuración optimizada para estadísticas
    const seedsResult = await getSeedsFromService(userId, {
      limit: 1000, // Límite alto para contar todas las semillas
      orderByField: 'createdAt',
      orderDirection: 'desc',
    })

    if (!seedsResult.success) {
      throw new Error(seedsResult.error || 'Error obteniendo semillas')
    }

    // Filtrar semillas activas para contar solo las válidas
    const activeSeedsCount = seedsResult.data.filter(
      seed => seed.isActive !== false // Incluir semillas sin campo isActive (por defecto true)
    ).length

    return {
      success: true,
      data: {
        count: activeSeedsCount,
        total: seedsResult.data.length,
      },
    }
  } catch (error) {
    console.error('Error calculando estadísticas de semillas:', error)
    return {
      success: false,
      error: error.message,
      data: { count: 0, total: 0 },
    }
  }
}

/**
 * Función auxiliar optimizada para calcular estadísticas de intercambios
 * Utiliza exchangeService existente para mayor eficiencia y consistencia
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Estadísticas de intercambios
 */
async function calculateExchangesStatsOptimized(userId) {
  try {
    console.log(
      '🔄 Calculando estadísticas de intercambios usando servicios...'
    )

    // Usar servicios existentes en paralelo para máximo rendimiento
    const [receivedExchanges, sentExchanges] = await Promise.all([
      // Note: getUserExchangesReceived no se puede importar debido a dependencia circular
      // En su lugar usamos consultas directas pero optimizadas
      getDocs(
        query(
          collection(db, EXCHANGES_COLLECTION),
          where('ownerId', '==', userId)
        )
      ),
      getDocs(
        query(
          collection(db, EXCHANGES_COLLECTION),
          where('requesterId', '==', userId)
        )
      ),
    ])

    let exchangesCompleted = 0
    let exchangesPending = 0
    const seedRequestCounts = new Map()

    // Procesar intercambios donde el usuario es propietario
    receivedExchanges.forEach(doc => {
      const data = doc.data()
      if (data.status === 'completed') {
        exchangesCompleted++
      } else if (data.status === 'pending') {
        exchangesPending++
      }

      // Contar solicitudes por semilla para "más solicitada"
      if (data.seedRequestedId && data.seedRequestedName) {
        const current = seedRequestCounts.get(data.seedRequestedId) || {
          name: data.seedRequestedName,
          count: 0,
        }
        current.count++
        seedRequestCounts.set(data.seedRequestedId, current)
      }
    })

    // Procesar intercambios donde el usuario es solicitante
    sentExchanges.forEach(doc => {
      const data = doc.data()
      if (data.status === 'completed') {
        exchangesCompleted++
      } else if (data.status === 'pending') {
        exchangesPending++
      }
    })

    // Determinar semilla más solicitada
    let mostRequestedSeed = {
      seedId: null,
      name: null,
      requestCount: 0,
    }

    for (const [seedId, seedData] of seedRequestCounts) {
      if (seedData.count > mostRequestedSeed.requestCount) {
        mostRequestedSeed = {
          seedId,
          name: seedData.name,
          requestCount: seedData.count,
        }
      }
    }

    return {
      success: true,
      data: {
        completed: exchangesCompleted,
        pending: exchangesPending,
        mostRequested: mostRequestedSeed,
      },
    }
  } catch (error) {
    console.error('Error calculando estadísticas de intercambios:', error)
    return {
      success: false,
      error: error.message,
      data: {
        completed: 0,
        pending: 0,
        mostRequested: { seedId: null, name: null, requestCount: 0 },
      },
    }
  }
}

/**
 * BLOQUE 8 - PASO 1.3: Funciones auxiliares para gestión de cache de estadísticas
 */

/**
 * Invalida el cache de estadísticas de un usuario
 * Debe llamarse cuando cambien datos que afecten las estadísticas
 * @param {string} userId - ID del usuario
 */
export function invalidateUserStatsCache(userId) {
  if (userId) {
    statsCache.invalidate(userId)
  }
}

/**
 * Función para actualizar estadísticas cuando cambien datos relacionados
 * Útil para mantener el cache actualizado tras operaciones
 * @param {string} userId - ID del usuario afectado
 * @param {string} operation - Tipo de operación ('seed_added', 'exchange_updated', etc.)
 */
export function updateUserStatsOnDataChange(userId, operation) {
  if (!userId) return

  console.log(`📊 Actualizando estadísticas tras operación: ${operation}`)

  // Invalidar cache para forzar recálculo en próxima consulta
  invalidateUserStatsCache(userId)

  // Opcionalmente, recalcular estadísticas de forma anticipada (pre-warming cache)
  // calculateUserStats(userId, true).catch(error => {
  //   console.warn('⚠️ Error pre-calculando estadísticas:', error.message)
  // })
}

/**
 * Obtiene las semillas del usuario (delegada a seedService)
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de consulta
 * @returns {Promise<Object>} Lista de semillas del usuario
 */
export async function getUserSeeds(userId, options = {}) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('ID de usuario requerido')
    }

    console.log('🌱 Obteniendo semillas del usuario:', userId)

    // Delegar a seedService que ya tiene esta funcionalidad implementada
    const result = await getSeedsFromService(userId, options)

    if (result.success) {
      console.log(`✅ ${result.data.length} semillas obtenidas del usuario`)
      return {
        success: true,
        data: result.data,
        count: result.count,
        message: `${result.data.length} semillas encontradas`,
      }
    } else {
      throw new Error(result.error || 'Error obteniendo semillas')
    }
  } catch (error) {
    console.error('❌ Error obteniendo semillas del usuario:', error)
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0,
      message: 'Error al obtener las semillas del usuario',
    }
  }
}

/**
 * BLOQUE 8 - PASO 7.1: Valida si un usuario está listo para participar en intercambios
 * Versión mejorada con validaciones específicas y datos para UI
 * @param {string|Object} userProfileOrId - ID del usuario o perfil completo
 * @returns {Promise<Object>} Resultado de validación detallado
 */
export async function validateUserForExchanges(userProfileOrId) {
  try {
    // Soporte para recibir ID o perfil completo
    let userData = null

    if (typeof userProfileOrId === 'string') {
      // Si es ID, obtener perfil
      const profileResult = await getUserProfile(userProfileOrId)
      if (!profileResult.success) {
        throw new Error('Error obteniendo perfil del usuario')
      }
      userData = profileResult.data
    } else if (userProfileOrId && typeof userProfileOrId === 'object') {
      // Si es objeto, usarlo directamente
      userData = userProfileOrId
    } else {
      throw new Error('Parámetro inválido: se requiere ID o perfil de usuario')
    }

    // Validación exhaustiva de campos críticos
    const missingFields = []
    const issues = []
    const warnings = []

    // 1. Validar nombre (requerido, mínimo 2 caracteres)
    if (!userData.name || typeof userData.name !== 'string') {
      missingFields.push('name')
      issues.push('Nombre completo no configurado')
    } else if (userData.name.trim().length < 2) {
      missingFields.push('name')
      issues.push('Nombre demasiado corto (mínimo 2 caracteres)')
    }

    // 2. Validar WhatsApp (crítico para intercambios)
    if (
      !userData.whatsappNumber ||
      typeof userData.whatsappNumber !== 'string'
    ) {
      missingFields.push('whatsappNumber')
      issues.push('Número de WhatsApp no configurado')
    } else if (!isValidEcuadorianPhone(userData.whatsappNumber)) {
      missingFields.push('whatsappNumber')
      issues.push(
        'Formato de WhatsApp inválido. Debe ser formato ecuatoriano (+593XXXXXXXXX)'
      )
    }

    // 3. Validar ubicación (requerido, al menos básico)
    if (
      !userData.location ||
      typeof userData.location !== 'string' ||
      userData.location.trim() === ''
    ) {
      missingFields.push('location')
      issues.push('Ubicación no configurada')
    }

    // 4. Verificar configuraciones de privacidad
    if (userData.settings?.privacy?.allowExchangeRequests === false) {
      warnings.push(
        'Intercambios deshabilitados en configuración de privacidad'
      )
    }

    // Determinar si puede participar en intercambios
    const canExchange = missingFields.length === 0 && issues.length === 0

    // Construir resultado detallado para UI
    return {
      success: true,
      data: {
        canExchange,
        missingFields,
        issues,
        warnings,
        // Información específica para checklist UI
        fieldsStatus: {
          hasName: !!userData.name && userData.name.trim().length >= 2,
          hasWhatsapp:
            !!userData.whatsappNumber &&
            isValidEcuadorianPhone(userData.whatsappNumber),
          hasLocation: !!userData.location && userData.location.trim() !== '',
          allowsRequests:
            userData.settings?.privacy?.allowExchangeRequests !== false,
        },
        // Para el checklist visual
        completionStatus: {
          name: !missingFields.includes('name'),
          whatsapp: !missingFields.includes('whatsappNumber'),
          location: !missingFields.includes('location'),
          privacy: userData.settings?.privacy?.allowExchangeRequests !== false,
        },
      },
      message: canExchange
        ? 'Usuario listo para intercambios'
        : `Perfil incompleto para intercambios: ${issues.join(', ')}`,
    }
  } catch (error) {
    console.error('❌ Error validando usuario para intercambios:', error)
    return {
      success: false,
      error: error.message,
      data: {
        canExchange: false,
        missingFields: [],
        issues: [error.message],
        warnings: [],
        fieldsStatus: {
          hasName: false,
          hasWhatsapp: false,
          hasLocation: false,
          allowsRequests: false,
        },
        completionStatus: {
          name: false,
          whatsapp: false,
          location: false,
          privacy: false,
        },
      },
      message: 'Error validando usuario para intercambios',
    }
  }
}

/**
 * Función wrapper para getUserStats que mantiene compatibilidad
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Estadísticas calculadas
 */
export async function getUserStats(userId) {
  return await calculateUserStats(userId, false)
}

// Exportar funciones principales
export default {
  getUserProfile,
  updateUserProfile,
  updateWhatsAppNumber,
  getUserStats,
  getUserSeeds,
  validateUserForExchanges,
}
