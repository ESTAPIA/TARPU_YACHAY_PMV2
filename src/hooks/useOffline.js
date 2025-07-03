// src/hooks/useOffline.js
// Hook personalizado para operaciones offline simplificadas
// Paso 3 del Bloque 4: Gestión Offline Básica

import { useOffline as useOfflineContext } from '../contexts/OfflineContext'

/**
 * Hook personalizado que proporciona acceso simplificado al contexto offline
 * con funciones helper adicionales para operaciones comunes.
 *
 * @returns {Object} Objeto con estado y funciones offline
 *
 * @example
 * // Uso básico en un componente
 * import { useOffline } from '../hooks/useOffline'
 *
 * function MiComponente() {
 *   const { isOnline, saveOffline, getOffline, isReady } = useOffline()
 *
 *   const handleSave = async () => {
 *     if (!isOnline) {
 *       await saveOffline('seeds', miSemilla)
 *     }
 *   }
 *
 *   return <div>{isOnline ? 'Conectado' : 'Sin conexión'}</div>
 * }
 */
export function useOffline() {
  // Obtener contexto completo
  const context = useOfflineContext()

  /**
   * Función helper simplificada para guardar datos offline
   * Maneja automáticamente la verificación de disponibilidad
   *
   * @param {string} storeType - Tipo de store ('seeds', 'exchanges', 'userData', 'tempData')
   * @param {Object} data - Datos a guardar (debe incluir campo 'id')
   * @returns {Promise<boolean>} true si se guardó exitosamente
   *
   * @example
   * const { saveOffline } = useOffline()
   *
   * const seedData = { id: 'seed-123', name: 'Maíz criollo', ... }
   * const saved = await saveOffline('seeds', seedData)
   * if (saved) console.log('Semilla guardada offline')
   */
  const saveOffline = async (storeType, data) => {
    if (!context.isOfflineStorageReady) {
      console.warn('⚠️ Sistema offline no está disponible')
      return false
    }

    if (!data?.id) {
      console.error('❌ Los datos deben incluir un campo "id"')
      return false
    }

    return await context.saveLocally(
      context.STORES[storeType.toUpperCase()],
      data
    )
  }

  /**
   * Función helper simplificada para obtener datos offline por ID
   *
   * @param {string} storeType - Tipo de store ('seeds', 'exchanges', 'userData', 'tempData')
   * @param {string} id - ID del elemento a recuperar
   * @returns {Promise<Object|null>} Datos encontrados o null
   *
   * @example
   * const { getOffline } = useOffline()
   *
   * const seedData = await getOffline('seeds', 'seed-123')
   * if (seedData) {
   *   console.log('Semilla encontrada:', seedData.name)
   * }
   */
  const getOffline = async (storeType, id) => {
    if (!context.isOfflineStorageReady) {
      console.warn('⚠️ Sistema offline no está disponible')
      return null
    }

    return await context.getLocalData(
      context.STORES[storeType.toUpperCase()],
      id
    )
  }

  /**
   * Función helper para obtener todos los datos de un tipo
   *
   * @param {string} storeType - Tipo de store ('seeds', 'exchanges', 'userData', 'tempData')
   * @returns {Promise<Array>} Array con todos los datos del tipo
   *
   * @example
   * const { getAllOffline } = useOffline()
   *
   * const allSeeds = await getAllOffline('seeds')
   * console.log(`Tengo ${allSeeds.length} semillas guardadas offline`)
   */
  const getAllOffline = async storeType => {
    if (!context.isOfflineStorageReady) {
      console.warn('⚠️ Sistema offline no está disponible')
      return []
    }

    return await context.getAllLocalData(
      context.STORES[storeType.toUpperCase()]
    )
  }

  /**
   * Función helper para verificar si los datos están disponibles offline
   *
   * @param {string} storeType - Tipo de store a verificar
   * @param {string} id - ID del elemento a verificar
   * @returns {Promise<boolean>} true si los datos existen offline
   *
   * @example
   * const { hasOfflineData } = useOffline()
   *
   * const exists = await hasOfflineData('seeds', 'seed-123')
   * if (exists) {
   *   console.log('La semilla está disponible offline')
   * }
   */
  const hasOfflineData = async (storeType, id) => {
    const data = await getOffline(storeType, id)
    return data !== null
  }

  /**
   * Función helper para obtener estadísticas de almacenamiento offline
   *
   * @returns {Promise<Object>} Objeto con estadísticas de cada store
   *
   * @example
   * const { getOfflineStats } = useOffline()
   *
   * const stats = await getOfflineStats()
   * console.log(`Semillas offline: ${stats.seeds}`)
   * console.log(`Intercambios offline: ${stats.exchanges}`)
   */
  const getOfflineStats = async () => {
    if (!context.isOfflineStorageReady) {
      return { seeds: 0, exchanges: 0, userData: 0, tempData: 0 }
    }

    try {
      const [seeds, exchanges, userData, tempData] = await Promise.all([
        getAllOffline('seeds'),
        getAllOffline('exchanges'),
        getAllOffline('userData'),
        getAllOffline('tempData'),
      ])

      return {
        seeds: seeds.length,
        exchanges: exchanges.length,
        userData: userData.length,
        tempData: tempData.length,
        total:
          seeds.length + exchanges.length + userData.length + tempData.length,
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas offline:', error)
      return { seeds: 0, exchanges: 0, userData: 0, tempData: 0, total: 0 }
    }
  }

  /**
   * Función helper para determinar la estrategia de datos recomendada
   *
   * @returns {string} 'online', 'offline', 'hybrid'
   *
   * @example
   * const { getDataStrategy } = useOffline()
   *
   * const strategy = getDataStrategy()
   * if (strategy === 'offline') {
   *   // Usar solo datos locales
   * } else if (strategy === 'online') {
   *   // Usar Firebase
   * } else {
   *   // Estrategia híbrida
   * }
   */
  const getDataStrategy = () => {
    const status = context.getConnectionStatus()

    switch (status) {
      case 'online-ready':
        return 'hybrid' // Puede usar ambos, preferir online
      case 'online-limited':
        return 'online' // Solo online, no hay capacidad offline
      case 'offline-ready':
        return 'offline' // Solo offline
      case 'offline-limited':
        return 'offline' // Intentar offline aunque sea limitado
      default:
        return 'online'
    }
  }

  /**
   * Función helper para obtener un mensaje descriptivo del estado
   *
   * @returns {string} Mensaje descriptivo del estado actual
   *
   * @example
   * const { getStatusMessage } = useOffline()
   *
   * const message = getStatusMessage()
   * // "Conectado - Funcionalidad offline lista"
   * // "Sin conexión - Usando datos locales"
   * // etc.
   */
  const getStatusMessage = () => {
    const status = context.getConnectionStatus()

    const messages = {
      'online-ready': 'Conectado - Funcionalidad offline lista',
      'online-limited': 'Conectado - Sin capacidad offline',
      'offline-ready': 'Sin conexión - Usando datos locales',
      'offline-limited': 'Sin conexión - Capacidad limitada',
    }

    return messages[status] || 'Estado desconocido'
  }

  // Retornar API simplificada del hook
  return {
    // Estado básico (más fácil de entender)
    isOnline: context.isOnline,
    isOfflineReady: context.isOfflineStorageReady,
    isReady: context.isOfflineStorageReady, // Alias más simple

    // Funciones principales simplificadas
    saveOffline,
    getOffline,
    getAllOffline,
    hasOfflineData,

    // Funciones de utilidad
    getOfflineStats,
    getDataStrategy,
    getStatusMessage,

    // Estados derivados útiles
    canSaveOffline: context.isOfflineStorageReady,
    shouldUseOffline: context.shouldUseOffline(),
    connectionStatus: context.getConnectionStatus(),

    // Acceso al contexto completo si es necesario
    fullContext: context,

    // Constantes útiles
    STORE_TYPES: {
      SEEDS: 'seeds',
      EXCHANGES: 'exchanges',
      USER_DATA: 'userData',
      TEMP_DATA: 'tempData',
    },
  }
}

// Exportar también las constantes para uso directo
export const OFFLINE_STORE_TYPES = {
  SEEDS: 'seeds',
  EXCHANGES: 'exchanges',
  USER_DATA: 'userData',
  TEMP_DATA: 'tempData',
}

/**
 * EJEMPLOS DE USO AVANZADO:
 *
 * // 1. Guardar semilla con verificación automática
 * const { saveOffline, isReady } = useOffline()
 *
 * if (isReady) {
 *   await saveOffline('seeds', {
 *     id: 'seed-' + Date.now(),
 *     name: 'Quinoa roja',
 *     category: 'granos',
 *     ownerId: user.uid
 *   })
 * }
 *
 * // 2. Estrategia híbrida de datos
 * const { getDataStrategy, getAllOffline } = useOffline()
 *
 * const loadSeeds = async () => {
 *   const strategy = getDataStrategy()
 *
 *   if (strategy === 'offline') {
 *     return await getAllOffline('seeds')
 *   } else if (strategy === 'online') {
 *     return await loadSeedsFromFirebase()
 *   } else {
 *     // Híbrido: intentar online, fallback a offline
 *     try {
 *       return await loadSeedsFromFirebase()
 *     } catch (error) {
 *       return await getAllOffline('seeds')
 *     }
 *   }
 * }
 *
 * // 3. Verificar disponibilidad de datos
 * const { hasOfflineData, getOfflineStats } = useOffline()
 *
 * const checkDataAvailability = async () => {
 *   const stats = await getOfflineStats()
 *   console.log(`Datos disponibles offline: ${stats.total} elementos`)
 *
 *   const seedExists = await hasOfflineData('seeds', 'my-seed-id')
 *   if (!seedExists) {
 *     // Mostrar mensaje de "no disponible offline"
 *   }
 * }
 *
 * // 4. Mostrar estado de conectividad al usuario
 * const { getStatusMessage, isOnline } = useOffline()
 *
 * function StatusIndicator() {
 *   const statusMessage = getStatusMessage()
 *   return (
 *     <div className={isOnline ? 'status-online' : 'status-offline'}>
 *       {statusMessage}
 *     </div>
 *   )
 * }
 */
