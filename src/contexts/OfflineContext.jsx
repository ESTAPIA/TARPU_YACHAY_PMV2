// src/contexts/OfflineContext.jsx
// Contexto de conectividad offline para Tarpu Yachay PMV2

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  initOfflineStorage,
  saveData,
  getData,
  getAllData,
  STORES,
} from '../utils/offlineStorage'

// Crear el contexto
const OfflineContext = createContext()

// Hook para usar el contexto
export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOffline debe usarse dentro de un OfflineProvider')
  }
  return context
}

// Provider del contexto
export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isOfflineStorageReady, setIsOfflineStorageReady] = useState(false)

  // Inicializar el sistema de almacenamiento offline al montar
  useEffect(() => {
    const initStorage = async () => {
      try {
        await initOfflineStorage()
        setIsOfflineStorageReady(true)
        console.log('✅ Sistema offline inicializado correctamente')
      } catch (error) {
        console.error('❌ Error inicializando sistema offline:', error)
        // Continúa funcionando sin almacenamiento offline
        setIsOfflineStorageReady(false)
      }
    }

    initStorage()
  }, [])

  // Configurar listeners para eventos de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🌐 Conexión restaurada')
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('📴 Conexión perdida - modo offline activado')
    }

    // Agregar listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup listeners
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Función simplificada para guardar datos localmente
  const saveLocally = async (storeName, data) => {
    try {
      if (!isOfflineStorageReady) {
        console.warn('⚠️ Sistema offline no está listo')
        return false
      }

      const result = await saveData(storeName, data)
      if (result) {
        console.log(`💾 Datos guardados localmente en ${storeName}:`, data.id)
      }
      return result
    } catch (error) {
      console.error('❌ Error guardando datos localmente:', error)
      return false
    }
  }

  // Función simplificada para obtener datos locales por ID
  const getLocalData = async (storeName, id) => {
    try {
      if (!isOfflineStorageReady) {
        console.warn('⚠️ Sistema offline no está listo')
        return null
      }

      const data = await getData(storeName, id)
      if (data) {
        console.log(`📖 Datos recuperados localmente de ${storeName}:`, id)
      }
      return data
    } catch (error) {
      console.error('❌ Error obteniendo datos localmente:', error)
      return null
    }
  }

  // Función simplificada para obtener todos los datos de un store
  const getAllLocalData = async storeName => {
    try {
      if (!isOfflineStorageReady) {
        console.warn('⚠️ Sistema offline no está listo')
        return []
      }

      const data = await getAllData(storeName)
      console.log(`📋 ${data.length} elementos recuperados de ${storeName}`)
      return data
    } catch (error) {
      console.error('❌ Error obteniendo todos los datos localmente:', error)
      return []
    }
  }

  // Función para verificar si una operación debe ser offline
  const shouldUseOffline = () => {
    return !isOnline || !isOfflineStorageReady
  }

  // Función de utilidad para mostrar el estado de conectividad
  const getConnectionStatus = () => {
    if (isOnline && isOfflineStorageReady) {
      return 'online-ready' // Online y sistema offline listo
    } else if (isOnline && !isOfflineStorageReady) {
      return 'online-limited' // Online pero sin sistema offline
    } else if (!isOnline && isOfflineStorageReady) {
      return 'offline-ready' // Offline pero con sistema offline listo
    } else {
      return 'offline-limited' // Offline y sin sistema offline
    }
  } // Memorizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(
    () => ({
      // Estados
      isOnline,
      isOfflineStorageReady,

      // Funciones básicas de almacenamiento
      saveLocally,
      getLocalData,
      getAllLocalData,

      // Funciones de utilidad
      shouldUseOffline,
      getConnectionStatus,

      // Constantes útiles
      STORES, // Exportar los nombres de stores para uso fácil
    }),
    [
      isOnline,
      isOfflineStorageReady,
      saveLocally,
      getLocalData,
      getAllLocalData,
      shouldUseOffline,
      getConnectionStatus,
    ]
  )

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  )
}

// PropTypes
OfflineProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

// Exportar también las constantes de stores para uso directo
export { STORES }

// Uso del contexto:
// 1. Envolver la app: <OfflineProvider>...</OfflineProvider>
// 2. Usar el hook: const { isOnline, saveLocally, getLocalData } = useOffline()
// 3. Ejemplo: await saveLocally(STORES.SEEDS, seedData)
