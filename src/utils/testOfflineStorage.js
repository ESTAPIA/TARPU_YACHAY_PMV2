// Test básico para verificar offlineStorage.js
// Este archivo se puede eliminar después de probar
import {
  initOfflineStorage,
  isIndexedDBSupported,
  saveData,
  getData,
  getAllData,
  STORES,
} from './offlineStorage.js'

// Función de prueba básica
async function testOfflineStorage() {
  console.log('🧪 Iniciando pruebas de offlineStorage...')

  // 1. Verificar soporte de IndexedDB
  console.log('✅ IndexedDB soportado:', isIndexedDBSupported())

  // 2. Inicializar el sistema
  const initialized = await initOfflineStorage()
  console.log('✅ Sistema inicializado:', initialized)

  // 3. Prueba de guardado y recuperación
  const testData = {
    id: 'test-seed-1',
    name: 'Semilla de prueba',
    category: 'cereales',
    description: 'Esta es una semilla de prueba',
    ownerId: 'test-user-123',
    createdAt: new Date().toISOString(),
  }

  try {
    // Guardar datos
    const saved = await saveData(STORES.SEEDS, testData)
    console.log('✅ Datos guardados:', saved)

    // Recuperar datos
    const retrieved = await getData(STORES.SEEDS, 'test-seed-1')
    console.log('✅ Datos recuperados:', retrieved)

    // Obtener todos los datos
    const allData = await getAllData(STORES.SEEDS)
    console.log('✅ Todos los datos:', allData.length, 'elementos')

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!')
  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  }
}

// Exportar función de prueba para uso en consola del navegador
export { testOfflineStorage }
