// src/components/OfflineSystemTest.jsx
// Suite de testing integral para validación offline - Paso 8 Bloque 4
// Prueba sistemática de toda la funcionalidad offline implementada

import { useState } from 'react'
import { useOffline } from '../hooks/useOffline'
import { useAuth } from '../contexts/AuthContext'
import {
  initOfflineStorage,
  isIndexedDBSupported,
  getAllSeeds,
  getAllData,
  saveSeed,
  saveExchange,
} from '../utils/offlineStorage'

function OfflineSystemTest() {
  const [testResults, setTestResults] = useState({})
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState('')
  const [testLog, setTestLog] = useState([])

  const {
    isOnline,
    isReady,
    getOfflineStats,
    getStatusMessage,
    getDataStrategy,
  } = useOffline()

  const {
    user,
    isAuthenticated,
    hasOfflineUserData,
    saveUserDataLocally,
    getUserDataLocally,
  } = useAuth()

  // Función para agregar logs
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setTestLog(prev => [...prev, { timestamp, message, type }])
    console.log(`[${timestamp}] ${message}`)
  }

  // Función para actualizar resultados de tests
  const updateTestResult = (testName, passed, details = '') => {
    setTestResults(prev => ({
      ...prev,
      [testName]: {
        passed,
        details,
        timestamp: new Date().toLocaleTimeString(),
      },
    }))
  }

  // Test 1: Verificar soporte de IndexedDB
  const testIndexedDBSupport = async () => {
    setCurrentTest('Soporte IndexedDB')
    addLog('🧪 Probando soporte de IndexedDB...')

    try {
      const supported = isIndexedDBSupported()
      if (supported) {
        addLog('✅ IndexedDB soportado correctamente', 'success')
        updateTestResult('indexeddb', true, 'IndexedDB disponible')
      } else {
        addLog('❌ IndexedDB no soportado', 'error')
        updateTestResult('indexeddb', false, 'IndexedDB no disponible')
      }
    } catch (error) {
      addLog(`❌ Error verificando IndexedDB: ${error.message}`, 'error')
      updateTestResult('indexeddb', false, error.message)
    }
  }

  // Test 2: Inicialización del sistema offline
  const testOfflineInitialization = async () => {
    setCurrentTest('Inicialización Sistema Offline')
    addLog('🧪 Probando inicialización del sistema offline...')

    try {
      const initialized = await initOfflineStorage()
      if (initialized) {
        addLog('✅ Sistema offline inicializado correctamente', 'success')
        updateTestResult('initialization', true, 'Sistema inicializado')
      } else {
        addLog('❌ Fallo en inicialización del sistema offline', 'error')
        updateTestResult('initialization', false, 'Error de inicialización')
      }
    } catch (error) {
      addLog(`❌ Error en inicialización: ${error.message}`, 'error')
      updateTestResult('initialization', false, error.message)
    }
  }

  // Test 3: Detectores de conectividad
  const testConnectivityDetection = async () => {
    setCurrentTest('Detección de Conectividad')
    addLog('🧪 Probando detectores de conectividad...')

    try {
      const statusMessage = getStatusMessage()
      const dataStrategy = getDataStrategy()

      addLog(`📡 Estado actual: ${isOnline ? 'Online' : 'Offline'}`)
      addLog(`📊 Mensaje de estado: ${statusMessage}`)
      addLog(`🎯 Estrategia de datos: ${dataStrategy}`)
      addLog(`⚡ Sistema listo: ${isReady}`)

      if (typeof isOnline === 'boolean' && statusMessage && dataStrategy) {
        addLog('✅ Detectores de conectividad funcionando', 'success')
        updateTestResult(
          'connectivity',
          true,
          `${statusMessage} | Estrategia: ${dataStrategy}`
        )
      } else {
        addLog('❌ Problemas con detectores de conectividad', 'error')
        updateTestResult('connectivity', false, 'Valores indefinidos')
      }
    } catch (error) {
      addLog(`❌ Error en detectores: ${error.message}`, 'error')
      updateTestResult('connectivity', false, error.message)
    }
  }

  // Test 4: Almacenamiento de semillas
  const testSeedStorage = async () => {
    setCurrentTest('Almacenamiento de Semillas')
    addLog('🧪 Probando almacenamiento de semillas...')

    try {
      // Crear semilla de prueba
      const testSeed = {
        id: `test-seed-${Date.now()}`,
        name: 'Semilla de Prueba - Sistema Test',
        variety: 'Variedad Test',
        category: 'Cereales',
        description: 'Semilla creada durante testing del sistema offline',
        ownerId: user?.uid || 'test-user',
        ownerName: user?.displayName || 'Usuario Test',
        isAvailableForExchange: true,
        createdAt: new Date().toISOString(),
      }

      // Intentar guardar
      const saved = await saveSeed(testSeed)
      if (saved) {
        addLog(`✅ Semilla guardada: ${testSeed.name}`, 'success')

        // Verificar recuperación
        const allSeeds = await getAllSeeds()
        const foundSeed = allSeeds.find(s => s.id === testSeed.id)

        if (foundSeed) {
          addLog(`✅ Semilla recuperada correctamente`, 'success')
          updateTestResult(
            'seedStorage',
            true,
            `Guardada y recuperada: ${testSeed.name}`
          )
        } else {
          addLog(`❌ Semilla no encontrada después de guardar`, 'error')
          updateTestResult('seedStorage', false, 'Error en recuperación')
        }
      } else {
        addLog('❌ Error guardando semilla', 'error')
        updateTestResult('seedStorage', false, 'Error en guardado')
      }
    } catch (error) {
      addLog(`❌ Error en test de semillas: ${error.message}`, 'error')
      updateTestResult('seedStorage', false, error.message)
    }
  }

  // Test 5: Autenticación offline
  const testOfflineAuth = async () => {
    setCurrentTest('Autenticación Offline')
    addLog('🧪 Probando sistema de autenticación offline...')

    try {
      addLog(`👤 Usuario autenticado: ${isAuthenticated}`)
      addLog(`💾 Datos offline disponibles: ${hasOfflineUserData}`)

      if (user && isAuthenticated) {
        // Probar guardado manual
        const saved = await saveUserDataLocally(user)
        if (saved) {
          addLog('✅ Datos de usuario guardados localmente', 'success')

          // Probar recuperación
          const retrieved = await getUserDataLocally(user.uid)
          if (retrieved) {
            addLog('✅ Datos de usuario recuperados correctamente', 'success')
            updateTestResult('authOffline', true, `Usuario: ${user.email}`)
          } else {
            addLog('❌ Error recuperando datos de usuario', 'error')
            updateTestResult('authOffline', false, 'Error en recuperación')
          }
        } else {
          addLog('❌ Error guardando datos de usuario', 'error')
          updateTestResult('authOffline', false, 'Error en guardado')
        }
      } else {
        addLog('⚠️ No hay usuario autenticado para probar', 'warning')
        updateTestResult('authOffline', false, 'No hay usuario autenticado')
      }
    } catch (error) {
      addLog(`❌ Error en test de autenticación: ${error.message}`, 'error')
      updateTestResult('authOffline', false, error.message)
    }
  }

  // Test 6: Sistema de intercambios
  const testExchangeSystem = async () => {
    setCurrentTest('Sistema de Intercambios')
    addLog('🧪 Probando sistema de intercambios offline...')

    try {
      // Crear intercambio de prueba
      const testExchange = {
        id: `test-exchange-${Date.now()}`,
        seedOfferedId: 'test-seed-offered',
        seedRequestedId: 'test-seed-requested',
        requesterId: user?.uid || 'test-requester',
        ownerId: 'test-owner',
        status: 'pending',
        message: 'Intercambio de prueba del sistema offline',
        createdAt: new Date().toISOString(),
      }

      // Intentar guardar
      const saved = await saveExchange(testExchange)
      if (saved) {
        addLog(`✅ Intercambio guardado correctamente`, 'success')

        // Verificar recuperación usando getAllData en lugar de getUserExchanges
        const allExchanges = await getAllData('exchanges')
        const foundExchange = allExchanges.find(e => e.id === testExchange.id)

        if (foundExchange) {
          addLog(`✅ Intercambio recuperado correctamente`, 'success')
          updateTestResult(
            'exchangeSystem',
            true,
            'Guardado y recuperado correctamente'
          )
        } else {
          addLog(`❌ Intercambio no encontrado después de guardar`, 'error')
          updateTestResult('exchangeSystem', false, 'Error en recuperación')
        }
      } else {
        addLog('❌ Error guardando intercambio', 'error')
        updateTestResult('exchangeSystem', false, 'Error en guardado')
      }
    } catch (error) {
      addLog(`❌ Error en test de intercambios: ${error.message}`, 'error')
      updateTestResult('exchangeSystem', false, error.message)
    }
  }

  // Test 7: Estadísticas offline
  const testOfflineStats = async () => {
    setCurrentTest('Estadísticas Offline')
    addLog('🧪 Probando estadísticas del sistema offline...')

    try {
      const stats = await getOfflineStats()

      addLog(`📊 Semillas offline: ${stats.seeds}`)
      addLog(`🔄 Intercambios offline: ${stats.exchanges}`)
      addLog(`👤 Datos de usuario: ${stats.userData}`)
      addLog(`📝 Datos temporales: ${stats.tempData}`)
      addLog(`📈 Total elementos: ${stats.total}`)

      if (typeof stats.total === 'number' && stats.total >= 0) {
        addLog('✅ Estadísticas offline funcionando', 'success')
        updateTestResult(
          'offlineStats',
          true,
          `Total: ${stats.total} elementos`
        )
      } else {
        addLog('❌ Error en estadísticas offline', 'error')
        updateTestResult('offlineStats', false, 'Estadísticas inválidas')
      }
    } catch (error) {
      addLog(`❌ Error en estadísticas: ${error.message}`, 'error')
      updateTestResult('offlineStats', false, error.message)
    }
  }

  // Test 8: Service Worker y Cache
  const testServiceWorkerCache = async () => {
    setCurrentTest('Service Worker y Cache')
    addLog('🧪 Probando Service Worker y sistema de cache...')

    try {
      // Verificar soporte de Service Worker
      if ('serviceWorker' in navigator) {
        addLog('✅ Service Worker soportado', 'success')

        // Verificar Service Worker registrado
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          addLog(
            `✅ Service Worker registrado: ${registration.scope}`,
            'success'
          )

          // Verificar estado del Service Worker
          if (registration.active) {
            addLog('✅ Service Worker activo', 'success')
          } else {
            addLog('⚠️ Service Worker no está activo', 'warning')
          }
        } else {
          addLog('⚠️ Service Worker no registrado', 'warning')
        }

        // Verificar soporte de Cache API
        if ('caches' in window) {
          addLog('✅ Cache API soportada', 'success')

          // Listar caches disponibles
          const cacheNames = await caches.keys()
          addLog(`📦 Caches encontrados: ${cacheNames.length}`, 'info')
          cacheNames.forEach(name => {
            addLog(`  📋 Cache: ${name}`, 'info')
          })

          updateTestResult(
            'serviceWorkerCache',
            true,
            `SW: ${registration ? 'Registrado' : 'No registrado'} | Caches: ${cacheNames.length}`
          )
        } else {
          addLog('❌ Cache API no soportada', 'error')
          updateTestResult(
            'serviceWorkerCache',
            false,
            'Cache API no disponible'
          )
        }
      } else {
        addLog('❌ Service Worker no soportado', 'error')
        updateTestResult(
          'serviceWorkerCache',
          false,
          'Service Worker no disponible'
        )
      }
    } catch (error) {
      addLog(`❌ Error verificando Service Worker: ${error.message}`, 'error')
      updateTestResult('serviceWorkerCache', false, error.message)
    }
  }

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults({})
    setTestLog([])
    setCurrentTest('')

    addLog('🚀 Iniciando suite completa de tests offline...', 'info')

    const tests = [
      testIndexedDBSupport,
      testOfflineInitialization,
      testConnectivityDetection,
      testSeedStorage,
      testOfflineAuth,
      testExchangeSystem,
      testOfflineStats,
      testServiceWorkerCache,
    ]

    for (const test of tests) {
      try {
        await test()
        await new Promise(resolve => setTimeout(resolve, 500)) // Pausa entre tests
      } catch (error) {
        addLog(`❌ Error ejecutando test: ${error.message}`, 'error')
      }
    }

    setCurrentTest('')
    setIsRunning(false)
    addLog('🏁 Suite de tests completada', 'info')
  }

  // Limpiar datos de prueba
  const cleanTestData = () => {
    setTestResults({})
    setTestLog([])
    addLog('🧹 Datos de prueba limpiados', 'info')
  }

  // Calcular resumen de resultados
  const getTestSummary = () => {
    const results = Object.values(testResults)
    const total = results.length
    const passed = results.filter(r => r.passed).length
    const failed = total - passed

    return { total, passed, failed }
  }

  const summary = getTestSummary()

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧪 Testing y Validación Offline - Paso 8</h2>

      {/* Estado actual del sistema */}
      <div style={styles.statusCard}>
        <h3>📊 Estado Actual del Sistema</h3>
        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <span>Conectividad:</span>
            <span style={{ color: isOnline ? '#10b981' : '#ef4444' }}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span>Sistema Offline:</span>
            <span style={{ color: isReady ? '#10b981' : '#f59e0b' }}>
              {isReady ? '✅ Listo' : '⚠️ Inicializando'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span>Usuario:</span>
            <span style={{ color: isAuthenticated ? '#10b981' : '#6b7280' }}>
              {isAuthenticated ? '👤 Autenticado' : '👤 No autenticado'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span>Mensaje de Estado:</span>
            <span style={{ fontSize: '0.9rem' }}>{getStatusMessage()}</span>
          </div>
        </div>
      </div>

      {/* Controles de testing */}
      <div style={styles.controlsCard}>
        <h3>🎮 Controles de Testing</h3>
        <div style={styles.buttonGrid}>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            style={{
              ...styles.button,
              backgroundColor: isRunning ? '#6b7280' : '#10b981',
            }}
          >
            {isRunning ? '🔄 Ejecutando...' : '🚀 Ejecutar Todos los Tests'}
          </button>
          <button
            onClick={cleanTestData}
            disabled={isRunning}
            style={{ ...styles.button, backgroundColor: '#f59e0b' }}
          >
            🧹 Limpiar Resultados
          </button>
        </div>

        {currentTest && (
          <div style={styles.currentTest}>
            <span>🧪 Ejecutando: {currentTest}</span>
          </div>
        )}
      </div>

      {/* Resumen de resultados */}
      {summary.total > 0 && (
        <div style={styles.summaryCard}>
          <h3>📈 Resumen de Resultados</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span style={{ color: '#10b981' }}>
                ✅ Pasaron: {summary.passed}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={{ color: '#ef4444' }}>
                ❌ Fallaron: {summary.failed}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={{ color: '#6b7280' }}>
                📊 Total: {summary.total}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Resultados detallados */}
      {Object.keys(testResults).length > 0 && (
        <div style={styles.resultsCard}>
          <h3>📋 Resultados Detallados</h3>
          {Object.entries(testResults).map(([testName, result]) => (
            <div
              key={testName}
              style={{
                ...styles.resultItem,
                borderLeft: `3px solid ${result.passed ? '#10b981' : '#ef4444'}`,
              }}
            >
              <div style={styles.resultHeader}>
                <span style={{ fontWeight: 'bold' }}>
                  {result.passed ? '✅' : '❌'} {testName}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {result.timestamp}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                {result.details}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log de ejecución */}
      {testLog.length > 0 && (
        <div style={styles.logCard}>
          <h3>📝 Log de Ejecución</h3>
          <div style={styles.logContainer}>
            {' '}
            {testLog.map((log, index) => {
              const getLogColor = type => {
                switch (type) {
                  case 'error':
                    return '#ef4444'
                  case 'success':
                    return '#10b981'
                  case 'warning':
                    return '#f59e0b'
                  default:
                    return '#4b5563'
                }
              }

              return (
                <div
                  key={`log-${index}-${log.timestamp}`}
                  style={{
                    ...styles.logItem,
                    color: getLogColor(log.type),
                  }}
                >
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    [{log.timestamp}]
                  </span>
                  <span>{log.message}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Instrucciones de testing manual */}
      <div style={styles.instructionsCard}>
        <h3>📋 Guía de Testing Manual</h3>
        <div style={styles.instructionsList}>
          <p>
            <strong>1. Testing de Conectividad:</strong>
          </p>
          <ul>
            <li>Ejecuta los tests con conexión normal</li>
            <li>Desconecta internet (Network tab → Offline en DevTools)</li>
            <li>Verifica que aparezca el indicador &quot;Sin conexión&quot;</li>
            <li>Ejecuta los tests nuevamente en modo offline</li>
          </ul>

          <p>
            <strong>2. Testing de Persistencia:</strong>
          </p>
          <ul>
            <li>Registra semillas con conexión</li>
            <li>Desconecta internet</li>
            <li>Registra más semillas</li>
            <li>Recarga la página (F5)</li>
            <li>Verifica que las semillas persistan</li>
          </ul>

          <p>
            <strong>3. Testing de Indicadores:</strong>
          </p>
          <ul>
            <li>Alterna conexión online/offline</li>
            <li>Verifica cambios inmediatos en indicadores</li>
            <li>Confirma mensajes de estado correctos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Estilos para el componente
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
  },
  title: {
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  statusCard: {
    backgroundColor: '#f8fafc',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  controlsCard: {
    backgroundColor: '#f0f9ff',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #bae6fd',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  button: {
    padding: '0.75rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    transition: 'opacity 0.2s',
  },
  currentTest: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#dbeafe',
    borderRadius: '8px',
    color: '#1e40af',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#f0fdf4',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #bbf7d0',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  summaryItem: {
    textAlign: 'center',
    padding: '0.75rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
    fontWeight: 'bold',
  },
  resultsCard: {
    backgroundColor: '#fefefe',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '1px solid #e5e5e5',
  },
  resultItem: {
    padding: '1rem',
    marginBottom: '0.5rem',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    borderLeft: '3px solid #ccc',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  logCard: {
    backgroundColor: '#1f2937',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  logContainer: {
    maxHeight: '300px',
    overflowY: 'auto',
    backgroundColor: '#111827',
    padding: '1rem',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
  },
  logItem: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.25rem',
    wordBreak: 'break-word',
  },
  instructionsCard: {
    backgroundColor: '#fffbeb',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #fed7aa',
  },
  instructionsList: {
    marginTop: '1rem',
    lineHeight: '1.6',
  },
}

export default OfflineSystemTest
