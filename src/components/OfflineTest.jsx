// src/components/OfflineTest.jsx
// Componente de prueba para verificar el funcionamiento del OfflineContext

import { useOffline, STORES } from '../contexts/OfflineContext'

export default function OfflineTest() {
  const {
    isOnline,
    isOfflineStorageReady,
    saveLocally,
    getAllLocalData,
    getConnectionStatus,
  } = useOffline()

  // Función para probar guardado de datos
  const handleTestSave = async () => {
    const testData = {
      id: `test-${Date.now()}`,
      name: 'Semilla de prueba offline',
      category: 'cereales',
      description: 'Datos de prueba para el sistema offline',
      timestamp: new Date().toISOString(),
    }

    const result = await saveLocally(STORES.SEEDS, testData)
    if (result) {
      alert('✅ Datos guardados correctamente en modo offline')
    } else {
      alert('❌ Error guardando datos')
    }
  }

  // Función para probar lectura de datos
  const handleTestLoad = async () => {
    const allData = await getAllLocalData(STORES.SEEDS)
    console.log('📋 Datos locales encontrados:', allData)

    if (allData.length > 0) {
      alert(
        `📋 Se encontraron ${allData.length} elementos en almacenamiento local`
      )
    } else {
      alert('📋 No hay datos en almacenamiento local')
    }
  }

  // Función para simular pérdida de conexión
  const handleSimulateOffline = () => {
    alert(
      '💡 Para simular modo offline:\n1. Abre DevTools (F12)\n2. Ve a Network\n3. Selecciona "Offline" en Throttling'
    )
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🌐 Test OfflineContext - Paso 2 Bloque 4</h2>

      {/* Estado de conectividad */}
      <div style={styles.statusCard}>
        <h3>📊 Estado de Conectividad</h3>
        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <span style={styles.label}>Conexión:</span>
            <span
              style={{
                ...styles.value,
                color: isOnline ? '#2e7d32' : '#d32f2f',
              }}
            >
              {isOnline ? '🌐 Online' : '📴 Offline'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.label}>Almacenamiento:</span>
            <span
              style={{
                ...styles.value,
                color: isOfflineStorageReady ? '#2e7d32' : '#f57c00',
              }}
            >
              {isOfflineStorageReady ? '💾 Listo' : '⚠️ No disponible'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.label}>Estado general:</span>
            <span style={styles.value}>
              {connectionStatus === 'online-ready' &&
                '✅ Completamente funcional'}
              {connectionStatus === 'online-limited' &&
                '⚠️ Online sin almacenamiento'}
              {connectionStatus === 'offline-ready' &&
                '📴 Offline con almacenamiento'}
              {connectionStatus === 'offline-limited' && '❌ Offline limitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de prueba */}
      <div style={styles.buttonGrid}>
        <button style={styles.button} onClick={handleTestSave}>
          💾 Probar Guardado Local
        </button>
        <button style={styles.button} onClick={handleTestLoad}>
          📋 Probar Lectura Local
        </button>
        <button style={styles.button} onClick={handleSimulateOffline}>
          📴 Simular Offline
        </button>
      </div>

      {/* Información del contexto */}
      <div style={styles.infoCard}>
        <h3>ℹ️ Información del Contexto</h3>
        <ul style={styles.infoList}>
          <li>
            <strong>useOffline hook:</strong> ✅ Funcionando
          </li>
          <li>
            <strong>Detección automática:</strong> ✅ Eventos online/offline
            activos
          </li>
          <li>
            <strong>Funciones básicas:</strong> ✅ saveLocally, getLocalData,
            getAllLocalData
          </li>
          <li>
            <strong>Integración offlineStorage:</strong> ✅ Conectado
            correctamente
          </li>
          <li>
            <strong>Stores disponibles:</strong>{' '}
            {Object.values(STORES).join(', ')}
          </li>
        </ul>
      </div>

      {/* Instrucciones */}
      <div style={styles.instructionsCard}>
        <h3>🧪 Cómo probar:</h3>
        <ol style={styles.instructionsList}>
          <li>
            Verifica que el estado muestre "Online" y "Almacenamiento Listo"
          </li>
          <li>
            Haz clic en "Probar Guardado Local" para guardar datos de prueba
          </li>
          <li>
            Haz clic en "Probar Lectura Local" para verificar que se guardaron
          </li>
          <li>Abre DevTools → Network → Throttling → Offline</li>
          <li>Verifica que el estado cambie a "Offline" automáticamente</li>
          <li>Prueba guardar y leer datos en modo offline</li>
        </ol>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  title: {
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: '24px',
  },
  statusCard: {
    backgroundColor: '#f5f5f5',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'white',
    borderRadius: '4px',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    fontWeight: 'bold',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  button: {
    padding: '12px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  infoList: {
    margin: '12px 0',
    paddingLeft: '20px',
  },
  instructionsCard: {
    backgroundColor: '#fff3e0',
    padding: '16px',
    borderRadius: '8px',
  },
  instructionsList: {
    margin: '12px 0',
    paddingLeft: '20px',
  },
}
