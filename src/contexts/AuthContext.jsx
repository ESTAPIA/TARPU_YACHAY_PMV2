// src/contexts/AuthContext.jsx
// Contexto global de autenticación para Tarpu Yachay PMV2
// Actualizado para Paso 5 Bloque 4: Integración con funcionalidad offline

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react'
import PropTypes from 'prop-types'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase-config'
// Integración con sistema offline - Paso 5 Bloque 4
import { saveUserData, getUserData } from '../utils/offlineStorage'

// Crear el contexto
const AuthContext = createContext()

// Hook para usar el contexto
export function useAuth() {
  return useContext(AuthContext)
}

// Provider del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Detectar cambios de conectividad - Paso 5 Bloque 4
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Persistencia de sesión (local)
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
  }, [])

  // Función para guardar datos de usuario localmente - Paso 5 Bloque 4
  const saveUserDataLocally = useCallback(async userData => {
    if (!userData || !userData.uid) {
      console.error('❌ No se pueden guardar datos: usuario inválido')
      return false
    }

    try {
      // Crear estructura compatible con offlineStorage store USER_DATA (keyPath: 'userId')
      const userDataForStorage = {
        userId: userData.uid, // Campo clave para IndexedDB
        uid: userData.uid, // Mantener uid original
        email: userData.email,
        displayName: userData.displayName,
        emailVerified: userData.emailVerified,
        photoURL: userData.photoURL,
        createdAt: userData.metadata?.creationTime || new Date().toISOString(),
        lastLoginAt:
          userData.metadata?.lastSignInTime || new Date().toISOString(),
        savedAt: new Date().toISOString(), // Timestamp de cuando se guardó offline
      }

      // Usar función específica para usuario que no valide campo 'id'
      const saved = await saveUserData(userDataForStorage)
      console.log('💾 Datos de usuario guardados localmente:', saved)
      return saved
    } catch (error) {
      console.error('❌ Error guardando datos de usuario localmente:', error)
      return false
    }
  }, [])

  // Función para recuperar datos de usuario localmente - Paso 5 Bloque 4
  const getUserDataLocally = useCallback(async userId => {
    if (!userId) return null

    try {
      const localUserData = await getUserData(userId)
      if (localUserData) {
        console.log(
          '📂 Datos de usuario recuperados localmente:',
          localUserData
        )
        return localUserData
      }
      return null
    } catch (error) {
      console.error('❌ Error recuperando datos de usuario localmente:', error)
      return null
    }
  }, [])

  // Función de sincronización cuando se recupera la conexión - Paso 5 Bloque 4
  const syncUserDataOnReconnect = useCallback(async () => {
    if (!isOnline || !user) return

    try {
      // Verificar si hay datos locales para sincronizar
      const localData = await getUserDataLocally(user.uid)
      if (localData) {
        console.log('🔄 Sincronizando datos de usuario al recuperar conexión')
        // Actualizar datos locales con información actual de Firebase
        await saveUserDataLocally(user)
      }
    } catch (error) {
      console.error('❌ Error en sincronización de datos de usuario:', error)
    }
  }, [isOnline, user, getUserDataLocally, saveUserDataLocally])

  // Sincronizar cuando se recupera la conexión
  useEffect(() => {
    if (isOnline && user) {
      syncUserDataOnReconnect()
    }
  }, [isOnline, user, syncUserDataOnReconnect])

  // Escuchar cambios de autenticación - Actualizado para Paso 5 Bloque 4
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser)

      // Guardar datos de usuario localmente cuando hay cambios - Paso 5 Bloque 4
      if (currentUser && isOnline) {
        await saveUserDataLocally(currentUser)
      }

      setLoading(false)
    })
    return unsubscribe
  }, [isOnline, saveUserDataLocally])

  // Helper: Registrar usuario - Actualizado para Paso 5 Bloque 4
  const register = useCallback(
    async (email, password) => {
      try {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )

        // Guardar datos localmente después del registro exitoso
        if (result.user && isOnline) {
          await saveUserDataLocally(result.user)
        }

        return result
      } catch (error) {
        // Si falla por conectividad, proporcionar información útil
        if (!isOnline) {
          throw new Error(
            'No hay conexión a internet. El registro requiere conexión.'
          )
        }
        throw error
      }
    },
    [isOnline, saveUserDataLocally]
  )

  // Helper: Login - Actualizado para Paso 5 Bloque 4
  const login = useCallback(
    async (email, password) => {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password)

        // Guardar datos localmente después del login exitoso
        if (result.user && isOnline) {
          await saveUserDataLocally(result.user)
        }

        return result
      } catch (error) {
        // Si falla por conectividad, intentar recuperar datos locales
        if (!isOnline) {
          console.log('🔄 Sin conexión, verificando datos locales...')
          // Nota: En una implementación más avanzada, aquí podríamos
          // intentar validar credenciales contra datos locales guardados
          throw new Error(
            'No hay conexión a internet. Intenta cuando tengas conexión.'
          )
        }
        throw error
      }
    },
    [isOnline, saveUserDataLocally]
  )

  // Helper: Logout - Actualizado para Paso 5 Bloque 4
  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      // Los datos locales se mantienen para futuras sesiones offline
      console.log('👋 Sesión cerrada exitosamente')
    } catch (error) {
      // Permitir logout offline (solo limpiar estado local)
      if (!isOnline) {
        setUser(null)
        console.log('👋 Sesión cerrada offline (datos locales conservados)')
        return
      }
      throw error
    }
  }, [isOnline])

  // Helper: Reset password - Actualizado para Paso 5 Bloque 4
  const resetPassword = useCallback(
    async email => {
      if (!isOnline) {
        throw new Error(
          'No hay conexión a internet. La recuperación de contraseña requiere conexión.'
        )
      }
      return sendPasswordResetEmail(auth, email)
    },
    [isOnline]
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isOnline, // Nuevo: estado de conectividad - Paso 5 Bloque 4
      register,
      login,
      logout,
      resetPassword,
      isAuthenticated: !!user,
      // Nuevas funciones offline - Paso 5 Bloque 4
      saveUserDataLocally,
      getUserDataLocally,
      hasOfflineUserData: !!user, // Indica si hay datos de usuario disponibles
    }),
    [
      user,
      loading,
      isOnline,
      register,
      login,
      logout,
      resetPassword,
      saveUserDataLocally,
      getUserDataLocally,
    ]
  )

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

// Uso:
// 1. Envolviendo la app en main.jsx: <AuthProvider>...</AuthProvider>
// 2. Usar el hook: const { user, login, register, logout, isOnline } = useAuth()
// 3. Nuevas funciones offline: const { saveUserDataLocally, getUserDataLocally } = useAuth()
