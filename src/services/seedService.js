// src/services/seedService.js
// Servicio para operaciones CRUD de semillas en Firestore
// Paso 6 Bloque 5: Integración con Firestore para guardar semillas

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase-config'

// Nombre de la colección en Firestore
const SEEDS_COLLECTION = 'seeds'

/**
 * Genera un ID único para semillas offline (para uso futuro)
 * @returns {string} ID único
 */
function _generateOfflineId() {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Valida los datos de una semilla antes de guardar
 * @param {Object} seedData - Datos de la semilla
 * @returns {Object} Resultado de validación
 */
function validateSeedData(seedData) {
  const errors = []

  // Campos obligatorios
  if (!seedData.name || seedData.name.trim() === '') {
    errors.push('El nombre de la semilla es obligatorio')
  }

  if (!seedData.category || seedData.category.trim() === '') {
    errors.push('La categoría es obligatoria')
  }

  if (!seedData.description || seedData.description.trim() === '') {
    errors.push('La descripción es obligatoria')
  }

  if (!seedData.ownerId || seedData.ownerId.trim() === '') {
    errors.push('El ID del propietario es obligatorio')
  }

  if (!seedData.ownerName || seedData.ownerName.trim() === '') {
    errors.push('El nombre del propietario es obligatorio')
  }

  // Validaciones de formato
  if (seedData.name && seedData.name.length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres')
  }

  if (seedData.description && seedData.description.length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres')
  }

  if (seedData.ownerPhone && !isValidPhone(seedData.ownerPhone)) {
    errors.push('El formato del teléfono no es válido')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida formato de teléfono (Ecuador/internacional)
 * @param {string} phone - Número de teléfono
 * @returns {boolean} True si es válido
 */
function isValidPhone(phone) {
  // Formato ecuatoriano: +593, 09, 0939... o internacional
  const phoneRegex = /^(\+593|0)?\d{8,10}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

/**
 * Prepara los datos de semilla para guardar en Firestore
 * @param {Object} seedData - Datos de la semilla
 * @param {Object} user - Usuario autenticado
 * @returns {Object} Datos preparados
 */
function prepareSeedData(seedData, user) {
  return {
    // Datos básicos de la semilla
    name: seedData.name.trim(),
    variety: seedData.variety?.trim() || '',
    category: seedData.category,
    description: seedData.description.trim(),
    location: seedData.location?.trim() || '',

    // URL de imagen (puede estar vacía si no se subió)
    imageUrl: seedData.imageUrl || '',

    // Información del propietario
    ownerId: user.uid,
    ownerName: user.displayName || user.email || 'Usuario',
    ownerPhone: seedData.ownerPhone?.trim() || '',

    // Configuración de intercambio
    isAvailableForExchange: seedData.isAvailableForExchange !== false, // default true
    exchangeNotes: seedData.exchangeNotes?.trim() || '',

    // Timestamps (usar serverTimestamp para Firestore)
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    // Estado de sincronización (para soporte offline futuro)
    syncStatus: 'synced', // 'pending', 'synced', 'error'

    // Metadatos adicionales
    version: 1, // Para futuras migraciones
    isActive: true, // Para soft delete futuro
  }
}

/**
 * Guarda una nueva semilla en Firestore
 * @param {Object} seedData - Datos de la semilla
 * @param {Object} user - Usuario autenticado (desde useAuth)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function saveSeed(seedData, user) {
  try {
    console.log('🌱 Iniciando guardado de semilla...', {
      seedData,
      userId: user?.uid,
    })

    // Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      throw new Error('Usuario no autenticado. Inicia sesión para continuar.')
    }

    // Validar datos de entrada
    const validation = validateSeedData({
      ...seedData,
      ownerId: user.uid,
      ownerName: user.displayName || user.email,
    })
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`)
    }

    // Preparar datos para Firestore
    const preparedData = prepareSeedData(seedData, user)
    console.log('📝 Datos preparados para Firestore:', preparedData)

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, SEEDS_COLLECTION), preparedData)

    console.log('✅ Semilla guardada exitosamente con ID:', docRef.id)

    return {
      success: true,
      seedId: docRef.id,
      message: 'Semilla registrada exitosamente',
      data: {
        id: docRef.id,
        ...preparedData,
        // Convertir serverTimestamp a fecha para mostrar
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('❌ Error guardando semilla:', error)

    // Determinar tipo de error para mejor UX
    let userMessage = 'Error al guardar la semilla. Intenta nuevamente.'

    if (error.code === 'permission-denied') {
      userMessage =
        'No tienes permisos para registrar semillas. Verifica tu autenticación.'
    } else if (error.code === 'unavailable') {
      userMessage =
        'Sin conexión a internet. La semilla se guardará localmente y se sincronizará después.'
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
 * Obtiene una semilla por su ID
 * @param {string} seedId - ID de la semilla
 * @returns {Promise<Object>} Datos de la semilla
 */
export async function getSeed(seedId) {
  try {
    const docRef = doc(db, SEEDS_COLLECTION, seedId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data(),
          // Convertir timestamps a fechas
          createdAt:
            docSnap.data().createdAt?.toDate?.()?.toISOString() || null,
          updatedAt:
            docSnap.data().updatedAt?.toDate?.()?.toISOString() || null,
        },
      }
    } else {
      return {
        success: false,
        error: 'Semilla no encontrada',
      }
    }
  } catch (error) {
    console.error('❌ Error obteniendo semilla:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Obtiene todas las semillas de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de consulta
 * @returns {Promise<Object>} Lista de semillas
 */
export async function getUserSeeds(userId, options = {}) {
  try {
    const {
      limit = 20,
      orderByField = 'createdAt',
      orderDirection = 'desc',
    } = options

    let q = query(
      collection(db, SEEDS_COLLECTION),
      where('ownerId', '==', userId),
      where('isActive', '==', true),
      orderBy(orderByField, orderDirection)
    )

    const querySnapshot = await getDocs(q)
    const seeds = []

    querySnapshot.forEach(doc => {
      seeds.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      })
    })

    return {
      success: true,
      data: seeds,
      count: seeds.length,
    }
  } catch (error) {
    console.error('❌ Error obteniendo semillas del usuario:', error)
    return {
      success: false,
      error: error.message,
      data: [],
    }
  }
}

/**
 * Obtiene semillas disponibles para intercambio
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de semillas
 */
export async function getAvailableSeeds(filters = {}) {
  try {
    const { category = null, excludeUserId = null, limit = 50 } = filters

    let constraints = [
      where('isAvailableForExchange', '==', true),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
    ]

    // Filtrar por categoría si se especifica
    if (category) {
      constraints.push(where('category', '==', category))
    }

    // Excluir semillas del propio usuario si se especifica
    if (excludeUserId) {
      constraints.push(where('ownerId', '!=', excludeUserId))
    }

    const q = query(collection(db, SEEDS_COLLECTION), ...constraints)
    const querySnapshot = await getDocs(q)
    const seeds = []

    querySnapshot.forEach(doc => {
      seeds.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      })
    })

    return {
      success: true,
      data: seeds,
      count: seeds.length,
    }
  } catch (error) {
    console.error('❌ Error obteniendo semillas disponibles:', error)
    return {
      success: false,
      error: error.message,
      data: [],
    }
  }
}

/**
 * Actualiza una semilla existente
 * @param {string} seedId - ID de la semilla
 * @param {Object} updateData - Datos a actualizar
 * @param {string} userId - ID del usuario (para verificar permisos)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updateSeed(seedId, updateData, userId) {
  try {
    // Verificar que la semilla existe y pertenece al usuario
    const seedResult = await getSeed(seedId)
    if (!seedResult.success) {
      throw new Error('Semilla no encontrada')
    }

    if (seedResult.data.ownerId !== userId) {
      throw new Error('No tienes permisos para editar esta semilla')
    }

    // Preparar datos de actualización
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp(),
      version: (seedResult.data.version || 1) + 1,
    }

    const docRef = doc(db, SEEDS_COLLECTION, seedId)
    await updateDoc(docRef, updatedData)

    return {
      success: true,
      message: 'Semilla actualizada exitosamente',
    }
  } catch (error) {
    console.error('❌ Error actualizando semilla:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Elimina una semilla (soft delete)
 * @param {string} seedId - ID de la semilla
 * @param {string} userId - ID del usuario (para verificar permisos)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function deleteSeed(seedId, userId) {
  try {
    // Verificar permisos
    const seedResult = await getSeed(seedId)
    if (!seedResult.success) {
      throw new Error('Semilla no encontrada')
    }

    if (seedResult.data.ownerId !== userId) {
      throw new Error('No tienes permisos para eliminar esta semilla')
    }

    // Soft delete: marcar como inactiva
    const docRef = doc(db, SEEDS_COLLECTION, seedId)
    await updateDoc(docRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      success: true,
      message: 'Semilla eliminada exitosamente',
    }
  } catch (error) {
    console.error('❌ Error eliminando semilla:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Exportar funciones principales
export default {
  saveSeed,
  getSeed,
  getUserSeeds,
  getAvailableSeeds,
  updateSeed,
  deleteSeed,
  validateSeedData,
}
