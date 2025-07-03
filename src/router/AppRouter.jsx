// src/router/AppRouter.jsx
// Configuración principal de rutas para Tarpu Yachay PMV2
// Actualizado para Paso 8: Integración final con sistema de autenticación

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Importar páginas existentes
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import WelcomePage from '../pages/WelcomePage'
import ProfilePage from '../pages/ProfilePage'

// Importar páginas principales de navegación
import HomePage from '../pages/HomePage'
import CatalogPage from '../pages/CatalogPage'
import AddSeedPage from '../pages/AddSeedPage'
import ExchangesPage from '../pages/ExchangesPage'

// Importar componente de prueba temporal para Bloque 4
import OfflineTest from '../components/OfflineTest'
// Importar componente de prueba para Paso 5 Bloque 4
import AuthOfflineTest from '../components/AuthOfflineTest'
// Importar componente de prueba para Paso 6 Bloque 4
import SeedsOfflineTest from '../components/SeedsOfflineTest'
// Importar componente de testing integral para Paso 8 Bloque 4
import OfflineSystemTest from '../components/OfflineSystemTest'
// Importar componente de detalle de semilla para pruebas manuales
import { SeedDetailModalExample } from '../components/catalog'

// Importar componente de rutas protegidas
import PrivateRoute from '../components/auth/PrivateRoute'
// Importar layout principal
import AppLayout from '../components/layout/AppLayout'
// Importar componente de página 404
import NotFoundPage from '../components/ui/NotFoundPage'

function AppRouter() {
  const { isAuthenticated, loading } = useAuth()

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Cargando...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas de autenticación - SIN LAYOUT */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/welcome" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/welcome" replace />
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/welcome" replace />
            ) : (
              <ForgotPasswordPage />
            )
          }
        />

        {/* Rutas protegidas - CON LAYOUT */}
        <Route
          path="/welcome"
          element={
            <PrivateRoute>
              <AppLayout>
                <WelcomePage />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Rutas principales de la aplicación (5 secciones del bottom nav) */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <PrivateRoute>
              <AppLayout>
                <CatalogPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-seed"
          element={
            <PrivateRoute>
              <AppLayout>
                <AddSeedPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/exchanges"
          element={
            <PrivateRoute>
              <AppLayout>
                <ExchangesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Ruta temporal para probar OfflineContext - Paso 2 Bloque 4 */}
        <Route
          path="/offline-test"
          element={
            <PrivateRoute>
              <AppLayout>
                <OfflineTest />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Ruta temporal para probar AuthContext offline - Paso 5 Bloque 4 */}
        <Route
          path="/auth-offline-test"
          element={
            <PrivateRoute>
              <AppLayout>
                <AuthOfflineTest />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Ruta temporal para probar almacenamiento de semillas - Paso 6 Bloque 4 */}
        <Route
          path="/seeds-offline-test"
          element={
            <PrivateRoute>
              <AppLayout>
                <SeedsOfflineTest />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Ruta temporal para testing integral offline - Paso 8 Bloque 4 */}
        <Route
          path="/offline-system-test"
          element={
            <PrivateRoute>
              <AppLayout>
                <OfflineSystemTest />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Ruta temporal para pruebas manuales del modal de detalle de semilla */}
        <Route
          path="/catalog/modal-example"
          element={<SeedDetailModalExample />}
        />

        {/* Redirecciones optimizadas según autenticación */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? '/home' : '/login'} replace />
          }
        />

        {/* Ruta para usuarios autenticados que acceden a rutas de auth */}
        <Route
          path="/auth/*"
          element={
            <Navigate to={isAuthenticated ? '/home' : '/login'} replace />
          }
        />

        {/* Ruta 404 - página no encontrada */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <AppLayout>
                <NotFoundPage isAuthenticated={true} />
              </AppLayout>
            ) : (
              <NotFoundPage isAuthenticated={false} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
