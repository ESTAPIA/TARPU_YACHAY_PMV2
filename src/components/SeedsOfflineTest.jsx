// src/components/SeedsOfflineTest.jsx
// Componente de prueba para verificar almacenamiento offline de semillas
// Paso 6 Bloque 4: Testing de funcionalidades de semillas e intercambios

import { useState } from 'react'
import {
  saveSeed,
  getAllSeeds,
  getSeedsByOwner,
  searchSeeds,
  saveExchange,
  getExchangesByUser,
  getCatalogStats,
} from '../utils/offlineStorage'
import { useAuth } from '../contexts/AuthContext'

function SeedsOfflineTest() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [...prev, { message, type, timestamp }])
    console.log(`🧪 [${timestamp}] ${message}`)
  }

  const handleTestSeeds = async () => {
    if (!user) {
      addResult('❌ Debes estar autenticado para probar', 'error')
      return
    }

    setIsLoading(true)
    setTestResults([])

    try {
      addResult('🌱 Iniciando pruebas de almacenamiento de semillas...')

      // 1. Crear semilla de prueba
      const testSeed = {
        id: `test-seed-${Date.now()}`,
        name: 'Quinoa Roja',
        variety: 'Chenopodium quinoa',
        category: 'Cereales',
        description: 'Quinoa roja de alta calidad de los Andes',
        location: 'Chugchilán, Ecuador',
        ownerId: user.uid,
        ownerName: user.displayName || user.email,
        isAvailableForExchange: true,
      }

      // 2. Guardar semilla
      addResult('💾 Guardando semilla de prueba...')
      const saved = await saveSeed(testSeed)
      addResult(
        `${saved ? '✅' : '❌'} Semilla guardada: ${saved}`,
        saved ? 'success' : 'error'
      )

      // 3. Recuperar todas las semillas
      addResult('📂 Recuperando todas las semillas...')
      const allSeeds = await getAllSeeds()
      addResult(
        `📊 Total de semillas en almacén local: ${allSeeds.length}`,
        'success'
      )

      // 4. Buscar semillas por propietario
      addResult('🔍 Buscando semillas por propietario...')
      const userSeeds = await getSeedsByOwner(user.uid)
      addResult(`👤 Semillas del usuario: ${userSeeds.length}`, 'success')

      // 5. Buscar semillas por término
      addResult('🔎 Probando búsqueda de texto...')
      const searchResults = await searchSeeds('quinoa')
      addResult(
        `🔍 Resultados de búsqueda "quinoa": ${searchResults.length}`,
        'success'
      )

      // 6. Obtener estadísticas
      addResult('📈 Obteniendo estadísticas del catálogo...')
      const stats = await getCatalogStats()
      addResult(
        `📊 Estadísticas - Semillas: ${stats.totalSeeds}, Disponibles: ${stats.availableSeeds}`,
        'success'
      )

      addResult('✅ Pruebas de semillas completadas exitosamente', 'success')
    } catch (error) {
      addResult(`❌ Error en pruebas: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestExchanges = async () => {
    if (!user) {
      addResult('❌ Debes estar autenticado para probar', 'error')
      return
    }

    setIsLoading(true)

    try {
      addResult('🔄 Iniciando pruebas de intercambios...')

      // Crear intercambio de prueba
      const testExchange = {
        id: `test-exchange-${Date.now()}`,
        seedOfferedId: 'seed-offered-123',
        seedRequestedId: 'seed-requested-456',
        requesterId: user.uid,
        ownerId: 'otro-usuario-id',
        message: 'Me interesa intercambiar esta semilla',
        status: 'pending',
      }

      // Guardar intercambio
      addResult('💾 Guardando intercambio de prueba...')
      const saved = await saveExchange(testExchange)
      addResult(
        `${saved ? '✅' : '❌'} Intercambio guardado: ${saved}`,
        saved ? 'success' : 'error'
      )

      // Obtener intercambios del usuario
      addResult('📂 Recuperando intercambios del usuario...')
      const userExchanges = await getExchangesByUser(user.uid)
      addResult(
        `📊 Intercambios - Solicitados: ${userExchanges.requested.length}, Recibidos: ${userExchanges.received.length}`,
        'success'
      )

      addResult('✅ Pruebas de intercambios completadas', 'success')
    } catch (error) {
      addResult(
        `❌ Error en pruebas de intercambios: ${error.message}`,
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div style={styles.container}>
      <h2>🌱 Pruebas Almacenamiento Semillas - Paso 6</h2>

      <div style={styles.actions}>
        <button
          onClick={handleTestSeeds}
          disabled={isLoading || !user}
          style={styles.button}
        >
          🌱 Probar Semillas
        </button>

        <button
          onClick={handleTestExchanges}
          disabled={isLoading || !user}
          style={styles.button}
        >
          🔄 Probar Intercambios
        </button>

        <button
          onClick={clearResults}
          style={{ ...styles.button, backgroundColor: '#6b7280' }}
        >
          🗑️ Limpiar
        </button>
      </div>

      {!user && (
        <div style={styles.warning}>
          ⚠️ Debes estar autenticado para ejecutar las pruebas
        </div>
      )}

      {testResults.length > 0 && (
        <div style={styles.results}>
          <h3>📋 Resultados de Pruebas</h3>
          <div style={styles.resultsList}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  ...styles.resultItem,
                  color:
                    result.type === 'error'
                      ? '#ef4444'
                      : result.type === 'success'
                        ? '#10b981'
                        : '#374151',
                }}
              >
                <span style={styles.timestamp}>[{result.timestamp}]</span>
                <span>{result.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.instructions}>
        <h3>💡 Instrucciones</h3>
        <ol>
          <li>Asegúrate de estar autenticado</li>
          <li>
            Haz clic en &quot;Probar Semillas&quot; para testear funciones de
            semillas
          </li>
          <li>
            Haz clic en &quot;Probar Intercambios&quot; para testear funciones
            intercambio
          </li>
          <li>Revisa los resultados y la consola del navegador</li>
          <li>Verifica que las pruebas pasen correctamente</li>
        </ol>
      </div>
    </div>
  )
}

// Estilos
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  warning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    border: '1px solid #fde047',
  },
  results: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
  },
  resultsList: {
    maxHeight: '400px',
    overflowY: 'auto',
    fontSize: '0.875rem',
  },
  resultItem: {
    padding: '0.25rem 0',
    borderBottom: '1px solid #f3f4f6',
    fontFamily: 'monospace',
  },
  timestamp: {
    color: '#6b7280',
    marginRight: '0.5rem',
  },
  instructions: {
    backgroundColor: '#eff6ff',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #dbeafe',
  },
}

export default SeedsOfflineTest
