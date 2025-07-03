// src/hooks/useNavigationManager.js
// Hook personalizado para lógica de navegación avanzada
// Separado del componente para compatibilidad con Fast Refresh

import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook personalizado para manejar la lógica de navegación
 * según el estado de autenticación del usuario
 */
export function useNavigationManager() {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Determina si un usuario es nuevo basado en metadata de Firebase
   */
  const isNewUser = () => {
    if (!user?.metadata) return false

    const userCreationTime = user.metadata.creationTime
    const lastSignInTime = user.metadata.lastSignInTime

    if (userCreationTime && lastSignInTime) {
      const timeDiff = new Date(lastSignInTime) - new Date(userCreationTime)
      // Si la diferencia entre creación y último login es menor a 5 minutos,
      // consideramos que es un usuario nuevo
      return timeDiff < 5 * 60 * 1000
    }

    return false
  }

  /**
   * Navega a la página apropiada después del login
   */
  const navigateAfterLogin = () => {
    if (!isAuthenticated) return

    // Para usuarios nuevos, ir a welcome
    if (isNewUser()) {
      navigate('/welcome', { replace: true })
    } else {
      // Para usuarios existentes, ir a home
      navigate('/home', { replace: true })
    }
  }

  /**
   * Navega a la página apropiada después del registro
   */
  const navigateAfterRegister = () => {
    if (!isAuthenticated) return

    // Siempre ir a welcome para usuarios recién registrados
    navigate('/welcome', { replace: true })
  }

  /**
   * Navega a la página apropiada después del logout
   */
  const navigateAfterLogout = () => {
    navigate('/login', { replace: true })
  }

  /**
   * Determina si la ruta actual requiere autenticación
   */
  const isProtectedRoute = () => {
    const publicRoutes = ['/login', '/register', '/forgot-password']
    return !publicRoutes.includes(location.pathname)
  }

  /**
   * Determina si mostrar el Bottom Navigation Bar
   */
  const shouldShowBottomNav = () => {
    const authRoutes = ['/login', '/register', '/forgot-password']
    return isAuthenticated && !authRoutes.includes(location.pathname)
  }

  /**
   * Determina si mostrar el Header
   */
  const shouldShowHeader = () => {
    const authRoutes = ['/login', '/register', '/forgot-password']
    return isAuthenticated && !authRoutes.includes(location.pathname)
  }

  return {
    // Estado
    isAuthenticated,
    loading,
    user,
    currentPath: location.pathname,

    // Funciones de utilidad
    isNewUser: isNewUser(),
    isProtectedRoute: isProtectedRoute(),
    shouldShowBottomNav: shouldShowBottomNav(),
    shouldShowHeader: shouldShowHeader(),

    // Funciones de navegación
    navigateAfterLogin,
    navigateAfterRegister,
    navigateAfterLogout,
  }
}
