// src/services/seedCatalogService.js
// BLOQUE 6 - PASO 1: Servicio de consulta de semillas para catálogo
//
// Funcionalidades:
// - Consulta de semillas públicas desde Firestore
// - Paginación básica con cursor
// - Filtros por categoría y disponibilidad
// - Cache local para navegación offline
// - Manejo de estados de carga y errores

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase-config'
import { seedCategories } from '../data/seedCategories'
import { saveToStorage, getFromStorage } from '../utils/offlineStorage'

// Configuración del servicio
const SEEDS_COLLECTION = 'seeds'
const DEFAULT_PAGE_SIZE = 20
const CACHE_KEY_PREFIX = 'catalog_seeds'
const CACHE_EXPIRY_MINUTES = 15 // Cache válido por 15 minutos

/**
 * Genera clave de cache basada en filtros
 * @param {Object} filters - Filtros aplicados
 * @param {number} page - Número de página
 * @returns {string} Clave de cache
 */
function generateCacheKey(filters = {}, page = 1) {
  const { category = 'all', showOnlyAvailable = false } = filters
  return `${CACHE_KEY_PREFIX}_${category}_${showOnlyAvailable}_page${page}`
}

/**
 * Verifica si el cache está vigente
 * @param {Object} cachedData - Datos del cache
 * @returns {boolean} True si el cache es válido
 */
function isCacheValid(cachedData) {
  if (!cachedData || !cachedData.timestamp) return false

  const now = Date.now()
  const cacheAge = now - cachedData.timestamp
  const maxAge = CACHE_EXPIRY_MINUTES * 60 * 1000 // Convertir a milliseconds

  return cacheAge < maxAge
}

/**
 * Construye query de Firestore con filtros
 * @param {Object} filters - Filtros a aplicar
 * @param {number} pageSize - Tamaño de página
 * @param {Object} lastDoc - Último documento para paginación
 * @returns {Object} Query de Firestore
 */
function buildSeedsQuery(
  filters = {},
  pageSize = DEFAULT_PAGE_SIZE,
  lastDoc = null
) {
  const { category = 'all', showOnlyAvailable = false } = filters

  let seedsQuery = query(
    collection(db, SEEDS_COLLECTION),
    where('isActive', '==', true), // Solo semillas activas
    orderBy('createdAt', 'desc'), // Más recientes primero
    limit(pageSize)
  )

  // Filtro por categoría
  if (category !== 'all' && category) {
    seedsQuery = query(
      collection(db, SEEDS_COLLECTION),
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )
  }

  // Filtro por disponibilidad (se aplicará después debido a limitaciones de Firestore)
  // Nota: Firestore no permite múltiples where con != en diferentes campos

  // Paginación
  if (lastDoc) {
    seedsQuery = query(seedsQuery, startAfter(lastDoc))
  }

  return seedsQuery
}

/**
 * Aplica filtros post-consulta que no se pueden hacer en Firestore
 * @param {Array} seeds - Array de semillas
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Semillas filtradas
 */
function applyPostFilters(seeds, filters = {}) {
  const { showOnlyAvailable = false } = filters

  let filteredSeeds = [...seeds]

  // Filtrar por disponibilidad
  if (showOnlyAvailable) {
    filteredSeeds = filteredSeeds.filter(
      seed => seed.isAvailableForExchange === true
    )
  }

  return filteredSeeds
}

/**
 * Transforma documento de Firestore a objeto de semilla
 * @param {Object} doc - Documento de Firestore
 * @returns {Object} Objeto de semilla
 */
function transformSeedDocument(doc) {
  const data = doc.data()

  return {
    id: doc.id,
    name: data.name || '',
    variety: data.variety || '',
    category: data.category || '',
    description: data.description || '',
    location: data.location || '',
    imageUrl: data.imageUrl || '',

    // Información del propietario (sin datos sensibles)
    ownerId: data.ownerId || '',
    ownerName: data.ownerName || 'Usuario',
    // NO incluir ownerPhone por privacidad

    // Estado de intercambio
    isAvailableForExchange: data.isAvailableForExchange || false,
    exchangeNotes: data.exchangeNotes || '',

    // Timestamps
    createdAt:
      data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
    updatedAt:
      data.updatedAt?.toDate?.() || new Date(data.updatedAt) || new Date(),

    // Metadatos
    version: data.version || 1,
    isActive: data.isActive !== false, // default true
  }
}

/**
 * Obtiene semillas públicas con filtros y paginación
 * @param {Object} options - Opciones de consulta
 * @returns {Promise<Object>} Resultado con semillas y metadatos
 */
export async function getPublicSeeds(options = {}) {
  const {
    filters = {},
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    useCache = true,
    lastDocId = null,
  } = options

  try {
    console.log('🔍 Consultando semillas públicas...', {
      filters,
      page,
      pageSize,
    })

    // Intentar obtener desde cache primero (solo para página 1)
    if (useCache && page === 1) {
      const cacheKey = generateCacheKey(filters, page)
      const cachedData = await getFromStorage('seeds', cacheKey)

      if (cachedData && isCacheValid(cachedData)) {
        console.log('💾 Datos obtenidos desde cache local')
        return {
          success: true,
          seeds: cachedData.seeds,
          hasMore: cachedData.hasMore,
          page: page,
          totalLoaded: cachedData.seeds.length,
          fromCache: true,
          filters: filters,
        }
      }
    }

    // Consultar desde Firestore
    let lastDoc = null

    // Para paginación, necesitamos obtener el documento anterior
    if (page > 1 && lastDocId) {
      // En implementación real, necesitaremos manejar esto mejor
      // Por ahora, usar offset simple (no es ideal para Firestore)
    }

    const seedsQuery = buildSeedsQuery(filters, pageSize, lastDoc)
    const querySnapshot = await getDocs(seedsQuery)

    if (querySnapshot.empty) {
      console.log('📭 No se encontraron semillas')
      return {
        success: true,
        seeds: [],
        hasMore: false,
        page: page,
        totalLoaded: 0,
        fromCache: false,
        filters: filters,
      }
    }

    // Transformar documentos a objetos de semilla
    let seeds = []
    querySnapshot.forEach(doc => {
      const seedData = transformSeedDocument(doc)
      seeds.push(seedData)
    })

    // Aplicar filtros post-consulta
    seeds = applyPostFilters(seeds, filters)

    // Determinar si hay más páginas
    const hasMore = querySnapshot.size === pageSize

    // Guardar en cache (solo página 1)
    if (useCache && page === 1) {
      const cacheKey = generateCacheKey(filters, page)
      const cacheData = {
        seeds: seeds,
        hasMore: hasMore,
        timestamp: Date.now(),
        filters: filters,
      }

      try {
        await saveToStorage('seeds', cacheKey, cacheData)
        console.log('💾 Datos guardados en cache local')
      } catch (cacheError) {
        console.warn('⚠️ No se pudo guardar en cache:', cacheError.message)
        // No es crítico, continuar sin cache
      }
    }

    const result = {
      success: true,
      seeds: seeds,
      hasMore: hasMore,
      page: page,
      totalLoaded: seeds.length,
      fromCache: false,
      filters: filters,
    }

    console.log('✅ Semillas obtenidas exitosamente:', {
      count: seeds.length,
      hasMore,
      fromCache: false,
    })

    return result
  } catch (error) {
    console.error('❌ Error obteniendo semillas:', error)

    // Intentar fallback a cache en caso de error
    if (useCache && page === 1) {
      const cacheKey = generateCacheKey(filters, page)
      const cachedData = await getFromStorage('seeds', cacheKey)

      if (cachedData && cachedData.seeds) {
        console.log('💾 Usando datos de cache como fallback')
        return {
          success: true,
          seeds: cachedData.seeds,
          hasMore: cachedData.hasMore || false,
          page: page,
          totalLoaded: cachedData.seeds.length,
          fromCache: true,
          error: error.message,
          filters: filters,
        }
      }
    }

    return {
      success: false,
      seeds: [],
      hasMore: false,
      page: page,
      totalLoaded: 0,
      fromCache: false,
      error: error.message || 'Error obteniendo semillas',
      filters: filters,
    }
  }
}

/**
 * Obtiene estadísticas básicas del catálogo
 * @returns {Promise<Object>} Estadísticas del catálogo
 */
export async function getCatalogStats() {
  try {
    // Obtener todas las semillas para estadísticas básicas
    const result = await getPublicSeeds({
      filters: {},
      pageSize: 1000, // Límite alto para contar
      useCache: false,
    })

    if (!result.success) {
      throw new Error(result.error || 'Error obteniendo estadísticas')
    }

    const seeds = result.seeds
    const totalSeeds = seeds.length
    const availableSeeds = seeds.filter(
      seed => seed.isAvailableForExchange
    ).length

    // Contar por categorías
    const categoryStats = {}
    seedCategories.forEach(cat => {
      categoryStats[cat.id] = seeds.filter(
        seed => seed.category === cat.id
      ).length
    })

    return {
      success: true,
      stats: {
        totalSeeds,
        availableSeeds,
        unavailableSeeds: totalSeeds - availableSeeds,
        categoryStats,
        lastUpdated: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error)
    return {
      success: false,
      stats: null,
      error: error.message || 'Error obteniendo estadísticas del catálogo',
    }
  }
}

/**
 * Limpia cache de catálogo (útil para refrescar datos)
 * @returns {Promise<boolean>} True si se limpió exitosamente
 */
export async function clearCatalogCache() {
  try {
    // Limpiar todas las claves de cache que empiecen con el prefijo
    // Nota: Esta implementación es básica, en un caso real necesitaríamos
    // una función para enumerar y limpiar claves por patrón

    const commonFilters = [
      { category: 'all', showOnlyAvailable: false },
      { category: 'all', showOnlyAvailable: true },
      { category: 'cereales', showOnlyAvailable: false },
      { category: 'legumbres', showOnlyAvailable: false },
      { category: 'hortalizas', showOnlyAvailable: false },
      { category: 'frutales', showOnlyAvailable: false },
      { category: 'aromaticas', showOnlyAvailable: false },
      { category: 'otros', showOnlyAvailable: false },
    ]

    for (const filter of commonFilters) {
      const cacheKey = generateCacheKey(filter, 1)
      try {
        // Intentar eliminar (la función getFromStorage puede no tener delete)
        // Por ahora, simplemente sobrescribimos con datos vacíos
        await saveToStorage('seeds', cacheKey, {
          seeds: [],
          timestamp: 0,
          expired: true,
        })
      } catch (e) {
        // Ignorar errores individuales
      }
    }

    console.log('🧹 Cache de catálogo limpiado')
    return true
  } catch (error) {
    console.error('❌ Error limpiando cache:', error)
    return false
  }
}

/**
 * Valida filtros de entrada
 * @param {Object} filters - Filtros a validar
 * @returns {Object} Filtros validados
 */
export function validateFilters(filters = {}) {
  const validatedFilters = {}

  // Validar categoría
  const { category = 'all' } = filters
  const validCategories = ['all', ...seedCategories.map(cat => cat.id)]
  validatedFilters.category = validCategories.includes(category)
    ? category
    : 'all'

  // Validar disponibilidad
  const { showOnlyAvailable = false } = filters
  validatedFilters.showOnlyAvailable = Boolean(showOnlyAvailable)

  return validatedFilters
}

// Exportaciones principales
export default {
  getPublicSeeds,
  getCatalogStats,
  clearCatalogCache,
  validateFilters,
}
