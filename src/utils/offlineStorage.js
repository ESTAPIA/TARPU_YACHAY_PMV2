// src/utils/offlineStorage.js
// Sistema de almacenamiento offline para Tarpu Yachay PMV2
// Configuración básica de IndexedDB con fallback a LocalStorage

/**
 * Configuración de la base de datos IndexedDB
 */
const DB_NAME = 'TarpuYachayDB'
const DB_VERSION = 1

// Stores (tablas) que usaremos en la aplicación
const STORES = {
  SEEDS: 'seeds', // Almacenar semillas registradas
  EXCHANGES: 'exchanges', // Almacenar solicitudes de intercambio
  USER_DATA: 'userData', // Datos de usuario para cache local
  TEMP_DATA: 'tempData', // Datos temporales para operaciones offline
}

// Variable global para mantener la conexión a la DB
let dbInstance = null

/**
 * Verifica si IndexedDB está soportado en el navegador
 * @returns {boolean} true si IndexedDB está disponible
 */
export const isIndexedDBSupported = () => {
  return 'indexedDB' in window && window.indexedDB !== null
}

/**
 * Inicializa la base de datos IndexedDB con los stores necesarios
 * @returns {Promise<IDBDatabase>} Instancia de la base de datos
 */
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      console.warn('IndexedDB no soportado, usando LocalStorage como fallback')
      resolve(null)
      return
    }

    // Si ya tenemos una instancia activa, la reutilizamos
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Error abriendo IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      console.log('IndexedDB inicializada correctamente')
      resolve(dbInstance)
    }

    // Configuración inicial de la base de datos (solo se ejecuta una vez)
    request.onupgradeneeded = event => {
      const db = event.target.result

      // Crear store para semillas
      if (!db.objectStoreNames.contains(STORES.SEEDS)) {
        const seedsStore = db.createObjectStore(STORES.SEEDS, {
          keyPath: 'id',
        })
        // Índices para búsqueda eficiente
        seedsStore.createIndex('ownerId', 'ownerId', { unique: false })
        seedsStore.createIndex('category', 'category', { unique: false })
        seedsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Crear store para intercambios
      if (!db.objectStoreNames.contains(STORES.EXCHANGES)) {
        const exchangesStore = db.createObjectStore(STORES.EXCHANGES, {
          keyPath: 'id',
        })
        // Índices para filtrar intercambios
        exchangesStore.createIndex('requesterId', 'requesterId', {
          unique: false,
        })
        exchangesStore.createIndex('ownerId', 'ownerId', { unique: false })
        exchangesStore.createIndex('status', 'status', { unique: false })
      }

      // Crear store para datos de usuario (cache)
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, {
          keyPath: 'userId',
        })
      }

      // Crear store para datos temporales
      if (!db.objectStoreNames.contains(STORES.TEMP_DATA)) {
        const tempStore = db.createObjectStore(STORES.TEMP_DATA, {
          keyPath: 'id',
        })
        tempStore.createIndex('type', 'type', { unique: false })
        tempStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      console.log('Stores de IndexedDB creados correctamente')
    }
  })
}

/**
 * Guarda datos en IndexedDB o LocalStorage como fallback
 * @param {string} storeName - Nombre del store donde guardar
 * @param {Object} data - Datos a guardar (debe incluir un campo 'id')
 * @returns {Promise<boolean>} true si se guardó correctamente
 */
export const saveData = async (storeName, data) => {
  try {
    // Validar que los datos tengan un ID
    if (!data || !data.id) {
      throw new Error('Los datos deben incluir un campo "id"')
    }

    // Intentar guardar en IndexedDB primero
    if (isIndexedDBSupported()) {
      const db = await initDatabase()

      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          const request = store.put(data)

          request.onsuccess = () => {
            console.log(`Datos guardados en IndexedDB (${storeName}):`, data.id)
            resolve(true)
          }

          request.onerror = () => {
            console.error('Error guardando en IndexedDB:', request.error)
            reject(request.error)
          }
        })
      }
    }

    // Fallback a LocalStorage
    return saveToLocalStorage(storeName, data)
  } catch (error) {
    console.error('Error en saveData:', error)
    // Intentar fallback a LocalStorage en caso de error
    return saveToLocalStorage(storeName, data)
  }
}

/**
 * Recupera datos por ID desde IndexedDB o LocalStorage
 * @param {string} storeName - Nombre del store
 * @param {string} id - ID del elemento a recuperar
 * @returns {Promise<Object|null>} Datos encontrados o null
 */
export const getData = async (storeName, id) => {
  try {
    // Intentar obtener de IndexedDB primero
    if (isIndexedDBSupported()) {
      const db = await initDatabase()

      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly')
          const store = transaction.objectStore(storeName)
          const request = store.get(id)

          request.onsuccess = () => {
            const result = request.result
            console.log(`Datos recuperados de IndexedDB (${storeName}):`, id)
            resolve(result || null)
          }

          request.onerror = () => {
            console.error('Error obteniendo de IndexedDB:', request.error)
            reject(request.error)
          }
        })
      }
    }

    // Fallback a LocalStorage
    return getFromLocalStorage(storeName, id)
  } catch (error) {
    console.error('Error en getData:', error)
    // Fallback a LocalStorage en caso de error
    return getFromLocalStorage(storeName, id)
  }
}

/**
 * Alias de getData para compatibilidad
 * @param {string} storeName - Nombre del store
 * @param {string} key - Clave del dato
 * @returns {Promise<any>} - Datos almacenados
 */
export const getFromStorage = async (storeName, key) => {
  return await getData(storeName, key)
}

/**
 * Obtiene todos los datos de un store
 * @param {string} storeName - Nombre del store
 * @returns {Promise<Array>} Array con todos los datos del store
 */
export const getAllData = async storeName => {
  try {
    // Intentar obtener de IndexedDB primero
    if (isIndexedDBSupported()) {
      const db = await initDatabase()

      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly')
          const store = transaction.objectStore(storeName)
          const request = store.getAll()

          request.onsuccess = () => {
            const results = request.result || []
            console.log(
              `Todos los datos recuperados de IndexedDB (${storeName}):`,
              results.length
            )
            resolve(results)
          }

          request.onerror = () => {
            console.error(
              'Error obteniendo todos los datos de IndexedDB:',
              request.error
            )
            reject(request.error)
          }
        })
      }
    }

    // Fallback a LocalStorage
    return getAllFromLocalStorage(storeName)
  } catch (error) {
    console.error('Error en getAllData:', error)
    // Fallback a LocalStorage en caso de error
    return getAllFromLocalStorage(storeName)
  }
}

/**
 * Actualiza datos existentes en el store
 * @param {string} storeName - Nombre del store
 * @param {string} id - ID del elemento a actualizar
 * @param {Object} newData - Nuevos datos (se fusionarán con los existentes)
 * @returns {Promise<boolean>} true si se actualizó correctamente
 */
export const updateData = async (storeName, id, newData) => {
  try {
    // Obtener datos existentes
    const existingData = await getData(storeName, id)

    if (!existingData) {
      throw new Error(`No se encontraron datos con ID: ${id}`)
    }

    // Fusionar datos existentes con nuevos datos
    const updatedData = {
      ...existingData,
      ...newData,
      id, // Mantener el ID original
      updatedAt: new Date().toISOString(), // Timestamp de actualización
    }

    // Guardar datos actualizados
    return await saveData(storeName, updatedData)
  } catch (error) {
    console.error('Error en updateData:', error)
    return false
  }
}

/**
 * Elimina datos específicos de un store
 * @param {string} storeName - Nombre del store
 * @param {string} id - ID del elemento a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const deleteData = async (storeName, id) => {
  try {
    // Intentar eliminar de IndexedDB primero
    if (isIndexedDBSupported()) {
      const db = await initDatabase()

      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          const request = store.delete(id)

          request.onsuccess = () => {
            console.log(`Datos eliminados de IndexedDB (${storeName}):`, id)
            resolve(true)
          }

          request.onerror = () => {
            console.error('Error eliminando de IndexedDB:', request.error)
            reject(request.error)
          }
        })
      }
    }

    // Fallback a LocalStorage
    return deleteFromLocalStorage(storeName, id)
  } catch (error) {
    console.error('Error en deleteData:', error)
    // Fallback a LocalStorage en caso de error
    return deleteFromLocalStorage(storeName, id)
  }
}

/**
 * Limpia completamente un store
 * @param {string} storeName - Nombre del store a limpiar
 * @returns {Promise<boolean>} true si se limpió correctamente
 */
export const clearStore = async storeName => {
  try {
    // Intentar limpiar IndexedDB primero
    if (isIndexedDBSupported()) {
      const db = await initDatabase()

      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          const request = store.clear()

          request.onsuccess = () => {
            console.log(`Store limpiado en IndexedDB: ${storeName}`)
            resolve(true)
          }

          request.onerror = () => {
            console.error('Error limpiando store en IndexedDB:', request.error)
            reject(request.error)
          }
        })
      }
    }

    // Fallback a LocalStorage
    return clearLocalStorageStore(storeName)
  } catch (error) {
    console.error('Error en clearStore:', error)
    // Fallback a LocalStorage en caso de error
    return clearLocalStorageStore(storeName)
  }
}

// ========================================
// FUNCIONES DE FALLBACK PARA LOCALSTORAGE
// ========================================

/**
 * Guarda datos en LocalStorage como fallback
 */
const saveToLocalStorage = (storeName, data) => {
  try {
    const key = `${storeName}_${data.id}`
    localStorage.setItem(key, JSON.stringify(data))
    console.log(`Datos guardados en LocalStorage (${storeName}):`, data.id)
    return true
  } catch (error) {
    console.error('Error guardando en LocalStorage:', error)
    return false
  }
}

/**
 * Obtiene datos de LocalStorage como fallback
 */
const getFromLocalStorage = (storeName, id) => {
  try {
    const key = `${storeName}_${id}`
    const data = localStorage.getItem(key)
    if (data) {
      console.log(`Datos recuperados de LocalStorage (${storeName}):`, id)
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error('Error obteniendo de LocalStorage:', error)
    return null
  }
}

/**
 * Obtiene todos los datos de un store en LocalStorage
 */
const getAllFromLocalStorage = storeName => {
  try {
    const results = []
    const prefix = `${storeName}_`

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        const data = localStorage.getItem(key)
        if (data) {
          results.push(JSON.parse(data))
        }
      }
    }

    console.log(
      `Todos los datos recuperados de LocalStorage (${storeName}):`,
      results.length
    )
    return results
  } catch (error) {
    console.error('Error obteniendo todos los datos de LocalStorage:', error)
    return []
  }
}

/**
 * Elimina datos de LocalStorage
 */
const deleteFromLocalStorage = (storeName, id) => {
  try {
    const key = `${storeName}_${id}`
    localStorage.removeItem(key)
    console.log(`Datos eliminados de LocalStorage (${storeName}):`, id)
    return true
  } catch (error) {
    console.error('Error eliminando de LocalStorage:', error)
    return false
  }
}

/**
 * Limpia un store completo en LocalStorage
 */
const clearLocalStorageStore = storeName => {
  try {
    const prefix = `${storeName}_`
    const keysToRemove = []

    // Recopilar todas las claves que coincidan con el prefijo
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }

    // Eliminar todas las claves encontradas
    keysToRemove.forEach(key => localStorage.removeItem(key))

    console.log(
      `Store limpiado en LocalStorage: ${storeName} (${keysToRemove.length} elementos)`
    )
    return true
  } catch (error) {
    console.error('Error limpiando store en LocalStorage:', error)
    return false
  }
}

// ========================================
// EXPORTAR CONSTANTES ÚTILES
// ========================================

// Exportar los nombres de stores para uso en otros archivos
export { STORES }

// Función de utilidad para inicializar el sistema completo
export const initOfflineStorage = async () => {
  try {
    console.log('Inicializando sistema de almacenamiento offline...')

    if (isIndexedDBSupported()) {
      await initDatabase()
      console.log('✅ IndexedDB inicializada correctamente')
    } else {
      console.log('⚠️ IndexedDB no disponible, usando LocalStorage')
    }

    return true
  } catch (error) {
    console.error('❌ Error inicializando almacenamiento offline:', error)
    return false
  }
}

// Función de utilidad para obtener estadísticas de almacenamiento
export const getStorageStats = async () => {
  try {
    const stats = {}

    for (const storeName of Object.values(STORES)) {
      const data = await getAllData(storeName)
      stats[storeName] = {
        count: data.length,
        sizeKB: Math.round((JSON.stringify(data).length / 1024) * 100) / 100,
      }
    }

    return stats
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return {}
  }
}

/**
 * Guarda específicamente datos de usuario (usa keyPath: 'userId')
 * @param {Object} userData - Datos del usuario (debe incluir campo 'userId')
 * @returns {Promise<boolean>} true si se guardó correctamente
 */
export const saveUserData = async userData => {
  try {
    // Validar que los datos tengan userId
    if (!userData || !userData.userId) {
      throw new Error('Los datos de usuario deben incluir un campo "userId"')
    }

    // Intentar guardar en IndexedDB primero
    if (isIndexedDBSupported()) {
      const db = await initDatabase()

      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORES.USER_DATA], 'readwrite')
          const store = transaction.objectStore(STORES.USER_DATA)
          const request = store.put(userData)

          request.onsuccess = () => {
            console.log(
              `Datos de usuario guardados en IndexedDB:`,
              userData.userId
            )
            resolve(true)
          }

          request.onerror = () => {
            console.error(
              'Error guardando usuario en IndexedDB:',
              request.error
            )
            reject(request.error)
          }
        })
      }
    }

    // Fallback a LocalStorage
    saveUserToLocalStorage(userData)
    return true
  } catch (error) {
    console.error('Error en saveUserData:', error)
    // Intentar fallback a LocalStorage
    try {
      saveUserToLocalStorage(userData)
      return true
    } catch (fallbackError) {
      console.error('Error en fallback localStorage:', fallbackError)
      return false
    }
  }
}

/**
 * Guarda datos de usuario en LocalStorage como fallback
 */
const saveUserToLocalStorage = userData => {
  try {
    const key = `${STORES.USER_DATA}_${userData.userId}`
    localStorage.setItem(key, JSON.stringify(userData))
    console.log('Datos de usuario guardados en LocalStorage:', userData.userId)
    return true
  } catch (error) {
    console.error('Error guardando usuario en LocalStorage:', error)
    return false
  }
}

/**
 * Recupera específicamente datos de usuario por userId
 * @param {string} userId - ID del usuario a recuperar
 * @returns {Promise<Object|null>} Datos del usuario o null
 */
export const getUserData = async userId => {
  try {
    if (!userId) return null

    // Intentar recuperar de IndexedDB primero
    if (isIndexedDBSupported()) {
      const db = await initDatabase()

      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORES.USER_DATA], 'readonly')
          const store = transaction.objectStore(STORES.USER_DATA)
          const request = store.get(userId)

          request.onsuccess = () => {
            const result = request.result
            if (result) {
              console.log('Datos de usuario recuperados de IndexedDB:', userId)
              resolve(result)
            } else {
              resolve(null)
            }
          }

          request.onerror = () => {
            console.error(
              'Error recuperando usuario de IndexedDB:',
              request.error
            )
            reject(request.error)
          }
        })
      }
    }

    // Fallback a LocalStorage
    return getUserFromLocalStorage(userId)
  } catch (error) {
    console.error('Error en getUserData:', error)
    try {
      return getUserFromLocalStorage(userId)
    } catch (fallbackError) {
      console.error('Error en fallback localStorage:', fallbackError)
      return null
    }
  }
}

/**
 * Recupera datos de usuario de LocalStorage como fallback
 */
const getUserFromLocalStorage = userId => {
  try {
    const key = `${STORES.USER_DATA}_${userId}`
    const data = localStorage.getItem(key)
    if (data) {
      console.log('Datos de usuario recuperados de LocalStorage:', userId)
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error('Error recuperando usuario de LocalStorage:', error)
    return null
  }
}

// ========================================
// FUNCIONES ESPECÍFICAS PARA SEMILLAS - PASO 6 BLOQUE 4
// ========================================

/**
 * Guarda una semilla en el almacenamiento local
 * @param {Object} seedData - Datos de la semilla
 * @returns {Promise<boolean>} true si se guardó correctamente
 */
export const saveSeed = async seedData => {
  try {
    // Validar datos mínimos requeridos
    if (!seedData.id || !seedData.name || !seedData.ownerId) {
      throw new Error('La semilla debe incluir: id, name, ownerId')
    }

    // Agregar metadatos si no existen
    const seedWithMeta = {
      ...seedData,
      createdAt: seedData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAvailableForExchange: seedData.isAvailableForExchange !== false, // default true
    }

    return await saveData(STORES.SEEDS, seedWithMeta)
  } catch (error) {
    console.error('Error guardando semilla:', error)
    return false
  }
}

/**
 * Obtiene una semilla específica por ID
 * @param {string} seedId - ID de la semilla
 * @returns {Promise<Object|null>} Datos de la semilla o null
 */
export const getSeed = async seedId => {
  try {
    return await getData(STORES.SEEDS, seedId)
  } catch (error) {
    console.error('Error obteniendo semilla:', error)
    return null
  }
}

/**
 * Obtiene todas las semillas almacenadas localmente
 * @returns {Promise<Array>} Array con todas las semillas
 */
export const getAllSeeds = async () => {
  try {
    const seeds = await getAllData(STORES.SEEDS)
    // Ordenar por fecha de creación (más recientes primero)
    return seeds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Error obteniendo todas las semillas:', error)
    return []
  }
}

/**
 * Obtiene semillas de un propietario específico
 * @param {string} ownerId - ID del propietario
 * @returns {Promise<Array>} Array con semillas del propietario
 */
export const getSeedsByOwner = async ownerId => {
  try {
    const allSeeds = await getAllSeeds()
    return allSeeds.filter(seed => seed.ownerId === ownerId)
  } catch (error) {
    console.error('Error obteniendo semillas por propietario:', error)
    return []
  }
}

/**
 * Obtiene semillas filtradas por categoría
 * @param {string} category - Categoría a filtrar
 * @returns {Promise<Array>} Array con semillas de la categoría
 */
export const getSeedsByCategory = async category => {
  try {
    const allSeeds = await getAllSeeds()
    return allSeeds.filter(seed => seed.category === category)
  } catch (error) {
    console.error('Error obteniendo semillas por categoría:', error)
    return []
  }
}

/**
 * Busca semillas por término de búsqueda en nombre y descripción
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Array con semillas que coinciden
 */
export const searchSeeds = async searchTerm => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return await getAllSeeds()
    }

    const allSeeds = await getAllSeeds()
    const term = searchTerm.toLowerCase().trim()

    return allSeeds.filter(
      seed =>
        seed.name.toLowerCase().includes(term) ||
        (seed.description && seed.description.toLowerCase().includes(term)) ||
        (seed.variety && seed.variety.toLowerCase().includes(term))
    )
  } catch (error) {
    console.error('Error buscando semillas:', error)
    return []
  }
}

/**
 * Obtiene semillas disponibles para intercambio
 * @param {string} excludeOwnerId - ID del propietario a excluir (opcional)
 * @returns {Promise<Array>} Array con semillas disponibles
 */
export const getAvailableSeeds = async (excludeOwnerId = null) => {
  try {
    const allSeeds = await getAllSeeds()
    return allSeeds.filter(
      seed =>
        seed.isAvailableForExchange &&
        (excludeOwnerId ? seed.ownerId !== excludeOwnerId : true)
    )
  } catch (error) {
    console.error('Error obteniendo semillas disponibles:', error)
    return []
  }
}

// ========================================
// FUNCIONES ESPECÍFICAS PARA INTERCAMBIOS - PASO 6 BLOQUE 4
// ========================================

/**
 * Guarda una solicitud de intercambio
 * @param {Object} exchangeData - Datos del intercambio
 * @returns {Promise<boolean>} true si se guardó correctamente
 */
export const saveExchange = async exchangeData => {
  try {
    // Validar datos mínimos requeridos
    if (
      !exchangeData.id ||
      !exchangeData.seedOfferedId ||
      !exchangeData.seedRequestedId ||
      !exchangeData.requesterId ||
      !exchangeData.ownerId
    ) {
      throw new Error(
        'El intercambio debe incluir: id, seedOfferedId, seedRequestedId, requesterId, ownerId'
      )
    }

    // Agregar metadatos si no existen
    const exchangeWithMeta = {
      ...exchangeData,
      status: exchangeData.status || 'pending',
      createdAt: exchangeData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return await saveData(STORES.EXCHANGES, exchangeWithMeta)
  } catch (error) {
    console.error('Error guardando intercambio:', error)
    return false
  }
}

/**
 * Obtiene intercambios de un usuario (como solicitante o propietario)
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Objeto con intercambios separados por tipo
 */
export const getExchangesByUser = async userId => {
  try {
    const allExchanges = await getAllData(STORES.EXCHANGES)

    return {
      // Intercambios solicitados por el usuario
      requested: allExchanges.filter(
        exchange => exchange.requesterId === userId
      ),
      // Intercambios recibidos por el usuario
      received: allExchanges.filter(exchange => exchange.ownerId === userId),
      // Historial completo
      all: allExchanges.filter(
        exchange =>
          exchange.requesterId === userId || exchange.ownerId === userId
      ),
    }
  } catch (error) {
    console.error('Error obteniendo intercambios por usuario:', error)
    return { requested: [], received: [], all: [] }
  }
}

/**
 * Actualiza el estado de un intercambio
 * @param {string} exchangeId - ID del intercambio
 * @param {string} newStatus - Nuevo estado (pending, accepted, rejected, completed)
 * @returns {Promise<boolean>} true si se actualizó correctamente
 */
export const updateExchangeStatus = async (exchangeId, newStatus) => {
  try {
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed']
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Estado inválido: ${newStatus}. Debe ser uno de: ${validStatuses.join(', ')}`
      )
    }

    return await updateData(STORES.EXCHANGES, exchangeId, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error actualizando estado de intercambio:', error)
    return false
  }
}

/**
 * Obtiene intercambios por estado
 * @param {string} status - Estado a filtrar
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Array>} Array con intercambios del estado especificado
 */
export const getExchangesByStatus = async (status, userId = null) => {
  try {
    const allExchanges = await getAllData(STORES.EXCHANGES)

    let filtered = allExchanges.filter(exchange => exchange.status === status)

    // Si se especifica userId, filtrar solo intercambios relacionados con ese usuario
    if (userId) {
      filtered = filtered.filter(
        exchange =>
          exchange.requesterId === userId || exchange.ownerId === userId
      )
    }

    return filtered.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )
  } catch (error) {
    console.error('Error obteniendo intercambios por estado:', error)
    return []
  }
}

// ========================================
// FUNCIONES DE UTILIDAD PARA CATÁLOGO - PASO 6 BLOQUE 4
// ========================================

/**
 * Obtiene estadísticas del catálogo local
 * @returns {Promise<Object>} Estadísticas del catálogo
 */
export const getCatalogStats = async () => {
  try {
    const seeds = await getAllSeeds()
    const exchanges = await getAllData(STORES.EXCHANGES)

    // Agrupar por categorías
    const categories = {}
    seeds.forEach(seed => {
      const category = seed.category || 'Sin categoría'
      categories[category] = (categories[category] || 0) + 1
    })

    return {
      totalSeeds: seeds.length,
      availableSeeds: seeds.filter(s => s.isAvailableForExchange).length,
      categories,
      totalExchanges: exchanges.length,
      pendingExchanges: exchanges.filter(e => e.status === 'pending').length,
      completedExchanges: exchanges.filter(e => e.status === 'completed')
        .length,
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas del catálogo:', error)
    return {
      totalSeeds: 0,
      availableSeeds: 0,
      categories: {},
      totalExchanges: 0,
      pendingExchanges: 0,
      completedExchanges: 0,
    }
  }
}

/**
 * Alias de saveData para compatibilidad
 * @param {string} storeName - Nombre del store donde guardar
 * @param {string} key - Clave del dato (será usado como ID)
 * @param {Object} data - Datos a guardar
 * @returns {Promise<boolean>} true si se guardó correctamente
 */
export const saveToStorage = async (storeName, key, data) => {
  // Asegurar que el objeto tenga la propiedad id
  const dataWithId = { ...data, id: key }
  return await saveData(storeName, dataWithId)
}
