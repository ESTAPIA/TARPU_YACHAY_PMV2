// Ejemplo de testing para userProfileService - PASO 1.3
// Agregar este código en un componente temporal o en la consola del navegador

import {
  getUserStats,
  calculateUserStats,
  invalidateUserStatsCache,
  updateUserStatsOnDataChange,
} from '../services/userProfileService'

export const testUserProfileStats = async userId => {
  console.log('🧪 INICIANDO PRUEBAS DE ESTADÍSTICAS DE USUARIO')
  console.log('=========================================')

  try {
    // Test 1: Obtener estadísticas básicas (con cache)
    console.log('\n📊 Test 1: Estadísticas básicas')
    const stats1 = await getUserStats(userId)
    console.log('Resultado 1:', stats1)

    // Test 2: Verificar que segunda llamada usa cache
    console.log('\n⚡ Test 2: Verificación de cache')
    const stats2 = await getUserStats(userId)
    console.log('Resultado 2 (debería ser del cache):', stats2)

    // Test 3: Forzar recálculo sin cache
    console.log('\n🔄 Test 3: Recálculo forzado')
    const stats3 = await calculateUserStats(userId, true)
    console.log('Resultado 3 (recalculado):', stats3)

    // Test 4: Invalidar cache
    console.log('\n🗑️ Test 4: Invalidación de cache')
    invalidateUserStatsCache(userId)
    const stats4 = await getUserStats(userId)
    console.log('Resultado 4 (tras invalidar cache):', stats4)

    // Test 5: Simular actualización de datos
    console.log('\n📝 Test 5: Actualización tras cambio de datos')
    updateUserStatsOnDataChange(userId, 'seed_added')
    const stats5 = await getUserStats(userId)
    console.log('Resultado 5 (tras simular cambio):', stats5)

    console.log('\n✅ PRUEBAS COMPLETADAS')
    console.log('===================')

    return {
      success: true,
      tests: [stats1, stats2, stats3, stats4, stats5],
    }
  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Función para probar en el navegador
export const testInBrowser = async () => {
  // Obtener userId del contexto de autenticación
  const userId = 'test-user-id' // Reemplazar con ID real

  console.log('🌐 Ejecutando pruebas en el navegador...')
  const result = await testUserProfileStats(userId)

  if (result.success) {
    console.log('🎉 Todas las pruebas pasaron correctamente!')
  } else {
    console.log('💥 Las pruebas fallaron:', result.error)
  }

  return result
}

// Para usar en el navegador:
// 1. Abrir DevTools Console
// 2. Importar este archivo
// 3. Ejecutar: testInBrowser()
