# Documentación Técnica - Sistema Offline Básico (Bloque 4)

## 📋 Información General

**Versión:** 1.0  
**Fecha:** Julio 2025  
**Proyecto:** Tarpu Yachay PMV2  
**Módulo:** Gestión Offline Básica

### 🎯 Objetivo del Sistema

El sistema offline básico implementado en el Bloque 4 proporciona una infraestructura robusta para el almacenamiento local de datos y manejo de conectividad, permitiendo que la aplicación funcione completamente sin conexión a internet.

### ✅ Funcionalidades Implementadas

- **Detección automática** de estado online/offline
- **Almacenamiento local** con IndexedDB + fallback LocalStorage
- **Context y hooks** para gestión de estado offline
- **Indicadores visuales** de conectividad
- **Integración con autenticación** para persistencia de sesiones
- **Sistema de storage** para semillas e intercambios
- **Service Worker mejorado** para cache avanzado
- **Suite de testing** completa para validación

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN REACT                         │
├─────────────────────────────────────────────────────────────┤
│  OfflineProvider (Context)                                  │
│  ├── Estado: isOnline, isOfflineStorageReady                │
│  ├── Funciones: saveLocally, getLocalData, getAllLocalData  │
│  └── Listeners: online/offline events                       │
├─────────────────────────────────────────────────────────────┤
│  useOffline Hook                                            │
│  ├── API simplificada: saveOffline, getOffline             │
│  ├── Helpers: getOfflineStats, getDataStrategy             │
│  └── Estados derivados: canSaveOffline, shouldUseOffline   │
├─────────────────────────────────────────────────────────────┤
│  Componentes UI                                             │
│  ├── ConnectivityIndicator (indicador visual)              │
│  ├── Componentes de testing (OfflineSystemTest, etc.)      │
│  └── Integración en AuthContext                            │
├─────────────────────────────────────────────────────────────┤
│  Capa de Almacenamiento (offlineStorage.js)                │
│  ├── IndexedDB (principal)                                 │
│  ├── LocalStorage (fallback)                               │
│  └── Gestión de stores: SEEDS, EXCHANGES, USER_DATA, etc.  │
├─────────────────────────────────────────────────────────────┤
│  Service Worker (Vite PWA)                                 │
│  ├── Cache de recursos estáticos                           │
│  ├── Runtime caching                                       │
│  └── Fallback offline                                      │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
📱 Usuario interactúa
    ↓
🔍 useOffline Hook determina estrategia
    ↓
┌─ Online ──────────┬─ Offline ────────┐
│                   │                  │
│ 🌐 Firebase        │ 💾 IndexedDB      │
│ + Backup local    │ + LocalStorage   │
│                   │                  │
└───────────────────┴──────────────────┘
    ↓
📊 Actualización de UI y estado
    ↓
👁️ Indicadores visuales reflejan estado
```

---

## 💾 Estructura de IndexedDB

### Base de Datos: `TarpuYachayOfflineDB`

**Versión:** 1

### Object Stores

#### 1. **SEEDS** - Almacenamiento de Semillas

```javascript
// Estructura de datos
{
  id: "seed-{timestamp}",           // Clave primaria
  name: "Quinoa roja",              // Nombre de la semilla
  category: "granos",               // Categoría
  description: "Descripción...",     // Descripción detallada
  ownerId: "user-uid",              // ID del propietario
  imageUrl: "path/to/image.jpg",    // URL de imagen (opcional)
  variety: "criolla",               // Variedad
  harvestDate: "2025-06-15",        // Fecha de cosecha
  location: "Chugchilán",           // Ubicación
  quantity: 500,                    // Cantidad en gramos
  exchangePreferences: ["cereales"], // Preferencias de intercambio
  tags: ["orgánica", "criolla"],    // Etiquetas
  status: "available",              // Estado: available, exchanged, reserved
  createdAt: "2025-07-02T...",      // Timestamp de creación
  updatedAt: "2025-07-02T...",      // Timestamp de actualización
  syncStatus: "pending"             // Estado de sincronización
}

// Índices
- id (keyPath, unique)
- ownerId (index)
- category (index)
- status (index)
- createdAt (index)
```

#### 2. **EXCHANGES** - Intercambios de Semillas

```javascript
// Estructura de datos
{
  id: "exchange-{timestamp}",       // Clave primaria
  fromUserId: "user-uid-1",         // Usuario que ofrece
  toUserId: "user-uid-2",           // Usuario que recibe
  fromSeedId: "seed-123",           // Semilla ofrecida
  toSeedId: "seed-456",             // Semilla solicitada
  status: "pending",                // Estado: pending, accepted, completed, cancelled
  proposedDate: "2025-07-10",       // Fecha propuesta
  location: "Plaza central",         // Lugar de intercambio
  notes: "Intercambio por...",       // Notas adicionales
  createdAt: "2025-07-02T...",      // Timestamp de creación
  updatedAt: "2025-07-02T...",      // Timestamp de actualización
  completedAt: "2025-07-10T...",    // Timestamp de completado (opcional)
  syncStatus: "pending"             // Estado de sincronización
}

// Índices
- id (keyPath, unique)
- fromUserId (index)
- toUserId (index)
- status (index)
- createdAt (index)
```

#### 3. **USER_DATA** - Datos de Usuario

```javascript
// Estructura de datos
{
  id: "user-{uid}",                 // Clave primaria (Firebase UID)
  uid: "firebase-uid",              // Firebase UID
  email: "user@example.com",        // Email del usuario
  displayName: "Juan Pérez",        // Nombre del usuario
  photoURL: "path/to/photo.jpg",    // URL de foto de perfil
  location: "Chugchilán",           // Ubicación del usuario
  bio: "Agricultor local...",        // Biografía
  preferences: {                    // Preferencias de usuario
    exchangeRadius: 10,             // Radio de intercambio (km)
    notifications: true,            // Notificaciones activadas
    privateMode: false              // Modo privado
  },
  statistics: {                     // Estadísticas del usuario
    seedsRegistered: 15,            // Semillas registradas
    exchangesCompleted: 8,          // Intercambios completados
    rating: 4.7                     // Calificación promedio
  },
  createdAt: "2025-07-02T...",      // Timestamp de creación
  updatedAt: "2025-07-02T...",      // Timestamp de actualización
  lastLoginAt: "2025-07-02T...",    // Último login
  syncStatus: "pending"             // Estado de sincronización
}

// Índices
- id (keyPath, unique)
- uid (index, unique)
- email (index)
- location (index)
```

#### 4. **TEMP_DATA** - Datos Temporales

```javascript
// Estructura de datos
{
  id: "temp-{timestamp}",           // Clave primaria
  type: "draft_seed",               // Tipo de dato temporal
  data: { /* objeto con datos */ }, // Datos serializados
  expiresAt: "2025-07-09T...",      // Fecha de expiración
  createdAt: "2025-07-02T...",      // Timestamp de creación
  metadata: {                       // Metadatos adicionales
    userAgent: "Mozilla/5.0...",    // User agent
    sessionId: "session-123"        // ID de sesión
  }
}

// Índices
- id (keyPath, unique)
- type (index)
- expiresAt (index)
- createdAt (index)
```

## 📑 Ejemplos de Tipos y Documentación (typedefs)

A continuación se presentan ejemplos de typedefs/documentación de tipos para los objetos principales del sistema offline. Estos pueden usarse como referencia para desarrollo, validación y futuras migraciones a TypeScript.

```js
/**
 * @typedef {Object} Seed
 * @property {string} id - Clave primaria, formato 'seed-{timestamp}'
 * @property {string} name - Nombre de la semilla
 * @property {string} category - Categoría (ej: 'granos')
 * @property {string} description - Descripción detallada
 * @property {string} ownerId - ID del propietario (usuario)
 * @property {string} [imageUrl] - URL de imagen (opcional)
 * @property {string} variety - Variedad de la semilla
 * @property {string} harvestDate - Fecha de cosecha (YYYY-MM-DD)
 * @property {string} location - Ubicación
 * @property {number} quantity - Cantidad en gramos
 * @property {string[]} exchangePreferences - Preferencias de intercambio
 * @property {string[]} tags - Etiquetas
 * @property {'available'|'exchanged'|'reserved'} status - Estado de la semilla
 * @property {string} createdAt - Timestamp de creación (ISO)
 * @property {string} updatedAt - Timestamp de actualización (ISO)
 * @property {'pending'|'synced'} syncStatus - Estado de sincronización
 */

/**
 * @typedef {Object} Exchange
 * @property {string} id - Clave primaria, formato 'exchange-{timestamp}'
 * @property {string} fromUserId - Usuario que ofrece
 * @property {string} toUserId - Usuario que recibe
 * @property {string} fromSeedId - Semilla ofrecida
 * @property {string} toSeedId - Semilla solicitada
 * @property {'pending'|'accepted'|'completed'|'cancelled'} status - Estado del intercambio
 * @property {string} proposedDate - Fecha propuesta (YYYY-MM-DD)
 * @property {string} location - Lugar de intercambio
 * @property {string} notes - Notas adicionales
 * @property {string} createdAt - Timestamp de creación (ISO)
 * @property {string} updatedAt - Timestamp de actualización (ISO)
 * @property {string} [completedAt] - Timestamp de completado (opcional)
 * @property {'pending'|'synced'} syncStatus - Estado de sincronización
 */

/**
 * @typedef {Object} UserData
 * @property {string} id - Clave primaria (Firebase UID)
 * @property {string} uid - Firebase UID
 * @property {string} email - Email del usuario
 * @property {string} displayName - Nombre del usuario
 * @property {string} [photoURL] - URL de foto de perfil
 * @property {string} location - Ubicación del usuario
 * @property {string} bio - Biografía
 * @property {Object} preferences - Preferencias de usuario
 * @property {number} preferences.exchangeRadius - Radio de intercambio (km)
 * @property {boolean} preferences.notifications - Notificaciones activadas
 * @property {boolean} preferences.privateMode - Modo privado
 * @property {Object} statistics - Estadísticas del usuario
 * @property {number} statistics.seedsRegistered - Semillas registradas
 * @property {number} statistics.exchangesCompleted - Intercambios completados
 * @property {number} statistics.rating - Calificación promedio
 * @property {string} createdAt - Timestamp de creación (ISO)
 * @property {string} updatedAt - Timestamp de actualización (ISO)
 * @property {string} lastLoginAt - Último login (ISO)
 * @property {'pending'|'synced'} syncStatus - Estado de sincronización
 */
```

---

## 🔄 Flujo de Datos Offline/Online

### Estrategias de Datos

#### 1. **Online Ready** (Completamente funcional)

- **Condición:** `isOnline = true` && `isOfflineStorageReady = true`
- **Estrategia:** Híbrida (preferir online, backup offline)
- **Flujo:**
  ```
  Operación solicitada
      ↓
  Intentar Firebase
      ↓
  ✅ Éxito → Backup local + Retornar datos
      ↓
  ❌ Error → Usar datos locales si disponibles
  ```

#### 2. **Online Limited** (Solo online)

- **Condición:** `isOnline = true` && `isOfflineStorageReady = false`
- **Estrategia:** Solo Firebase
- **Flujo:**
  ```
  Operación solicitada
      ↓
  Intentar Firebase
      ↓
  ✅ Éxito → Retornar datos (sin backup)
      ↓
  ❌ Error → Mostrar error, no hay fallback
  ```

#### 3. **Offline Ready** (Completamente offline)

- **Condición:** `isOnline = false` && `isOfflineStorageReady = true`
- **Estrategia:** Solo local
- **Flujo:**
  ```
  Operación solicitada
      ↓
  Usar IndexedDB/LocalStorage
      ↓
  ✅ Éxito → Marcar para sincronización futura
      ↓
  ❌ Error → Mostrar error específico
  ```

#### 4. **Offline Limited** (Funcionalidad reducida)

- **Condición:** `isOnline = false` && `isOfflineStorageReady = false`
- **Estrategia:** Solo memoria/session storage
- **Flujo:**
  ```
  Operación solicitada
      ↓
  Usar almacenamiento temporal
      ↓
  Mostrar advertencia de funcionalidad limitada
  ```

### Detección de Cambio de Estado

```javascript
// Listeners automáticos en OfflineContext
window.addEventListener('online', () => {
  console.log('🌐 Conexión restaurada')
  // Aquí se pueden activar procesos de sincronización
})

window.addEventListener('offline', () => {
  console.log('📴 Conexión perdida - modo offline activado')
  // Aquí se puede preparar el sistema para modo offline
})
```

---

## 🛠️ APIs y Funciones Disponibles

### OfflineContext (src/contexts/OfflineContext.jsx)

#### Estados Disponibles

```javascript
const {
  isOnline, // boolean - Estado de conectividad
  isOfflineStorageReady, // boolean - Almacenamiento offline disponible
  STORES, // object - Constantes de stores disponibles
} = useOffline()
```

#### Funciones Principales

```javascript
// Guardar datos localmente
const result = await saveLocally(storeName, data)
// Parámetros:
//   storeName: string (STORES.SEEDS, STORES.EXCHANGES, etc.)
//   data: object (debe incluir campo 'id')
// Retorna: boolean (true si guardó exitosamente)

// Obtener datos por ID
const data = await getLocalData(storeName, id)
// Parámetros:
//   storeName: string
//   id: string
// Retorna: object|null

// Obtener todos los datos de un store
const allData = await getAllLocalData(storeName)
// Parámetros:
//   storeName: string
// Retorna: array
```

#### Funciones de Utilidad

```javascript
// Verificar si debe usar offline
const shouldUse = shouldUseOffline()
// Retorna: boolean

// Obtener estado de conexión
const status = getConnectionStatus()
// Retorna: string ('online-ready', 'online-limited', 'offline-ready', 'offline-limited')
```

### useOffline Hook (src/hooks/useOffline.js)

#### API Simplificada

```javascript
const {
  // Estados básicos
  isOnline, // boolean - En línea
  isOfflineReady, // boolean - Offline disponible
  isReady, // boolean - Sistema listo

  // Funciones principales
  saveOffline, // async (storeType, data) => boolean
  getOffline, // async (storeType, id) => object|null
  getAllOffline, // async (storeType) => array
  hasOfflineData, // async (storeType, id) => boolean

  // Funciones de utilidad
  getOfflineStats, // async () => object
  getDataStrategy, // () => string
  getStatusMessage, // () => string

  // Estados derivados
  canSaveOffline, // boolean
  shouldUseOffline, // boolean
  connectionStatus, // string
} = useOffline()
```

#### Ejemplos de Uso

##### Guardar Semilla

```javascript
import { useOffline } from '../hooks/useOffline'

function AddSeedComponent() {
  const { saveOffline, isReady } = useOffline()

  const handleSaveSeed = async (seedData) => {
    if (!isReady) {
      alert('Sistema offline no disponible')
      return
    }

    const seedWithId = {
      id: `seed-${Date.now()}`,
      ...seedData,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending'
    }

    const saved = await saveOffline('seeds', seedWithId)
    if (saved) {
      console.log('Semilla guardada exitosamente')
    } else {
      console.error('Error guardando semilla')
    }
  }

  return (
    // JSX del componente
  )
}
```

##### Estrategia Híbrida de Datos

```javascript
import { useOffline } from '../hooks/useOffline'

function SeedsListComponent() {
  const { getDataStrategy, getAllOffline } = useOffline()
  const [seeds, setSeeds] = useState([])

  const loadSeeds = async () => {
    const strategy = getDataStrategy()

    switch (strategy) {
      case 'online':
        // Cargar solo de Firebase
        try {
          const firebaseSeeds = await loadSeedsFromFirebase()
          setSeeds(firebaseSeeds)
        } catch (error) {
          console.error('Error cargando de Firebase:', error)
        }
        break

      case 'offline':
        // Cargar solo datos locales
        const localSeeds = await getAllOffline('seeds')
        setSeeds(localSeeds)
        break

      case 'hybrid':
        // Estrategia híbrida: intentar Firebase, fallback local
        try {
          const firebaseSeeds = await loadSeedsFromFirebase()
          setSeeds(firebaseSeeds)
          // Opcional: sincronizar con datos locales
        } catch (error) {
          const localSeeds = await getAllOffline('seeds')
          setSeeds(localSeeds)
          console.log('Usando datos locales por error de conexión')
        }
        break
    }
  }

  useEffect(() => {
    loadSeeds()
  }, [])

  return (
    // JSX del componente
  )
}
```

##### Verificar Disponibilidad de Datos

```javascript
import { useOffline } from '../hooks/useOffline'

function SeedDetailComponent({ seedId }) {
  const { hasOfflineData, getOffline } = useOffline()
  const [seedData, setSeedData] = useState(null)
  const [isAvailableOffline, setIsAvailableOffline] = useState(false)

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await hasOfflineData('seeds', seedId)
      setIsAvailableOffline(available)

      if (available) {
        const data = await getOffline('seeds', seedId)
        setSeedData(data)
      }
    }

    checkAvailability()
  }, [seedId])

  return (
    <div>
      {isAvailableOffline ? (
        <div>Datos disponibles offline ✅</div>
      ) : (
        <div>Requiere conexión a internet ⚠️</div>
      )}
      {/* Resto del componente */}
    </div>
  )
}
```

### offlineStorage.js (src/utils/offlineStorage.js)

#### Funciones de Bajo Nivel

```javascript
// Inicializar sistema
const initialized = await initOfflineStorage()

// Verificar soporte
const supported = isIndexedDBSupported()

// Operaciones CRUD
const saved = await saveData(STORES.SEEDS, data)
const data = await getData(STORES.SEEDS, id)
const allData = await getAllData(STORES.SEEDS)
const deleted = await deleteData(STORES.SEEDS, id)
const cleared = await clearStore(STORES.SEEDS)
```

---

## 🎨 Componentes UI Implementados

### ConnectivityIndicator (src/components/ui/ConnectivityIndicator.jsx)

#### Características

- **Posición:** Fixed, esquina superior derecha
- **Estados visuales:** Online (verde), Offline (rojo), Inicializando (amarillo)
- **Responsivo:** Se adapta a diferentes tamaños de pantalla
- **No intrusivo:** Se oculta automáticamente después de mostrar el estado

#### Integración

```javascript
import ConnectivityIndicator from '../components/ui/ConnectivityIndicator'

function AppLayout() {
  return (
    <div>
      <ConnectivityIndicator />
      {/* Resto del layout */}
    </div>
  )
}
```

### Componentes de Testing

#### OfflineSystemTest (src/components/OfflineSystemTest.jsx)

- **Propósito:** Suite completa de testing automatizado
- **Funcionalidades:** 8+ tests diferentes para validar sistema offline
- **Acceso:** Ruta `/offline-system-test`

#### AuthOfflineTest (src/components/AuthOfflineTest.jsx)

- **Propósito:** Testing específico de autenticación offline
- **Funcionalidades:** Validación de persistencia de usuario
- **Acceso:** Componente independiente

#### SeedsOfflineTest (src/components/SeedsOfflineTest.jsx)

- **Propósito:** Testing de almacenamiento de semillas e intercambios
- **Funcionalidades:** CRUD completo de datos de semillas
- **Acceso:** Componente independiente

---

## 🔧 Integración con Autenticación

### Modificaciones en AuthContext

El `AuthContext` ha sido extendido para soportar funcionalidad offline:

#### Nuevas Funciones Disponibles

```javascript
const {
  // Funciones existentes de autenticación...

  // Nuevas funciones offline
  isOnline, // boolean - Estado de conectividad
  hasOfflineUserData, // boolean - Datos de usuario disponibles offline
  saveUserDataLocally, // async (userData) => boolean
  getUserDataLocally, // async (uid) => object|null
} = useAuth()
```

#### Persistencia Automática

- **Login exitoso:** Los datos del usuario se guardan automáticamente en local
- **Logout:** Los datos locales se mantienen para siguiente sesión
- **Reconexión:** Se intenta sincronizar datos locales con Firebase

#### Ejemplo de Uso

```javascript
import { useAuth } from '../contexts/AuthContext'

function ProfileComponent() {
  const { user, isOnline, hasOfflineUserData, getUserDataLocally } = useAuth()
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (isOnline && user) {
        // Cargar de Firebase
        setProfileData(user)
      } else if (hasOfflineUserData && user) {
        // Cargar datos locales
        const localData = await getUserDataLocally(user.uid)
        setProfileData(localData)
      }
    }

    loadProfile()
  }, [user, isOnline, hasOfflineUserData])

  return (
    <div>
      {profileData ? (
        <div>
          <h2>{profileData.displayName}</h2>
          <p>{profileData.email}</p>
          {!isOnline && (
            <div className="offline-warning">Mostrando datos offline</div>
          )}
        </div>
      ) : (
        <div>Cargando perfil...</div>
      )}
    </div>
  )
}
```

---

## ⚙️ Configuración del Service Worker

### Vite PWA Config (vite.config.js)

#### Estrategias de Cache Implementadas

```javascript
workbox: {
  runtimeCaching: [
    // 1. Cache de assets de la aplicación
    {
      urlPattern: /^https:\/\/localhost:\d+\/.*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'local-assets-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
        },
      },
    },

    // 2. Cache de imágenes
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
      },
    },

    // 3. Fallback para navegación
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'navigation-cache',
        networkTimeoutSeconds: 3,
        fallbacks: {
          document: '/offline.html',
        },
      },
    },
  ]
}
```

#### Beneficios del Cache

- **Carga rápida:** Assets se cargan desde cache local
- **Offline navigation:** Páginas funcionan sin conexión
- **Gestión automática:** Limpieza automática de cache expirado

---

## 🧪 Testing y Validación

### Suite de Tests Automatizados

#### Tests Implementados

1. **Test de Soporte IndexedDB**
   - Verifica disponibilidad de IndexedDB API
   - Valida capacidad de crear bases de datos

2. **Test de Inicialización**
   - Prueba creación de base de datos offline
   - Valida inicialización de object stores

3. **Test de Conectividad**
   - Verifica detección de estado online/offline
   - Valida listeners de eventos de red

4. **Test de Almacenamiento de Semillas**
   - Prueba CRUD completo de semillas
   - Valida estructura de datos

5. **Test de Autenticación Offline**
   - Verifica persistencia de datos de usuario
   - Valida recuperación de sesión offline

6. **Test de Sistema de Intercambios**
   - Prueba almacenamiento de intercambios
   - Valida relaciones entre usuarios y semillas

7. **Test de Estadísticas Offline**
   - Verifica conteo de datos locales
   - Valida funciones de estadísticas

8. **Test de Service Worker**
   - Confirma registro del service worker
   - Valida estrategias de cache

#### Ejecutar Tests

1. **Acceder a la suite de testing:**

   ```
   http://localhost:5173/offline-system-test
   ```

2. **Ejecutar tests automáticos:**
   - Clic en "🧪 Ejecutar Todos los Tests"
   - Revisar resultados en tiempo real
   - Verificar logs detallados

3. **Testing manual:**
   - Seguir guía de testing manual en la página
   - Probar desconectando internet
   - Verificar indicadores visuales

---

## 🚧 Limitaciones y Consideraciones

### Limitaciones Actuales

1. **Sincronización:**
   - No hay sincronización automática bidireccional
   - Los datos offline se marcan como 'pending' para sincronización futura

2. **Conflictos de Datos:**
   - No hay resolución automática de conflictos
   - Los datos modificados offline pueden crear inconsistencias

3. **Almacenamiento:**
   - Límite de almacenamiento del navegador (generalmente 1GB+)
   - No hay compresión de datos implementada

4. **Validación:**
   - Validación básica de estructura de datos
   - No hay validación compleja de reglas de negocio offline

### Consideraciones de Rendimiento

1. **Memoria:**
   - Los datos se mantienen en memoria durante la sesión
   - Recomendado limpiar datos temporales periódicamente

2. **Tamaño de Base de Datos:**
   - Monitorear crecimiento de IndexedDB
   - Implementar limpieza automática si es necesario

3. **Operaciones Asíncronas:**
   - Todas las operaciones de IndexedDB son asíncronas
   - Manejar apropiadamente estados de carga

### Recomendaciones de Uso

1. **Estrategia Híbrida:**
   - Usar `getDataStrategy()` para determinar fuente de datos óptima
   - Priorizar datos en línea cuando estén disponibles

2. **Indicadores de Estado:**
   - Mostrar claramente al usuario cuando está offline
   - Indicar cuando los datos son locales vs remotos

3. **Manejo de Errores:**
   - Implementar fallbacks apropiados para operaciones fallidas
   - Mostrar mensajes de error claros y útiles

---

## 📚 Referencias y Recursos

### Archivos Principales Implementados

```
src/
├── utils/
│   └── offlineStorage.js           # Core del sistema de almacenamiento
├── contexts/
│   └── OfflineContext.jsx          # Context React para estado offline
├── hooks/
│   └── useOffline.js               # Hook personalizado con API simplificada
├── components/
│   ├── ui/
│   │   └── ConnectivityIndicator.jsx  # Indicador visual de conectividad
│   ├── OfflineSystemTest.jsx       # Suite de testing automatizado
│   ├── AuthOfflineTest.jsx         # Testing de autenticación offline
│   └── SeedsOfflineTest.jsx        # Testing de semillas e intercambios
└── contexts/
    └── AuthContext.jsx             # Autenticación con soporte offline
```

### Configuración

```
vite.config.js                     # Configuración PWA y Service Worker
```

### Documentación

```
docs/
├── OFFLINE_BASIC_IMPLEMENTATION.md  # Esta documentación
├── BLOQUE_4_RESUMEN_FINAL.md        # Resumen ejecutivo del bloque
└── PASO_8_BLOQUE_4_TESTING_VALIDACION.md  # Documentación de testing
```

### Constantes y Configuración

```javascript
// Stores disponibles
export const STORES = {
  SEEDS: 'seeds',
  EXCHANGES: 'exchanges',
  USER_DATA: 'userData',
  TEMP_DATA: 'tempData',
}

// Estados de conectividad
const CONNECTION_STATES = {
  ONLINE_READY: 'online-ready',
  ONLINE_LIMITED: 'online-limited',
  OFFLINE_READY: 'offline-ready',
  OFFLINE_LIMITED: 'offline-limited',
}
```

---

## 🔮 Preparación para Siguientes Bloques

### Interfaz Lista para Integración

El sistema offline implementado en el Bloque 4 está diseñado para ser fácilmente integrable con los siguientes bloques:

#### Bloque 5: Registro de Semillas

```javascript
// El hook useOffline ya está listo para ser usado
const { saveOffline, getAllOffline } = useOffline()

// Guardar nueva semilla
await saveOffline('seeds', seedData)

// Cargar catálogo de semillas
const seeds = await getAllOffline('seeds')
```

#### Bloque 6: Sistema de Intercambios

```javascript
// Crear intercambio offline
await saveOffline('exchanges', exchangeData)

// Consultar intercambios del usuario
const userExchanges = await getAllOffline('exchanges')
const filtered = userExchanges.filter(ex => ex.fromUserId === userId)
```

#### Bloque 7: Catálogo y Búsqueda

```javascript
// Búsqueda en datos locales
const allSeeds = await getAllOffline('seeds')
const filtered = allSeeds.filter(seed =>
  seed.name.toLowerCase().includes(searchTerm.toLowerCase())
)
```

#### Bloque 8: Perfil de Usuario

```javascript
// Datos de perfil offline
const profileData = await getOffline('userData', userId)
const userStats = await getOfflineStats()
```

### APIs Extensibles

El sistema actual puede ser extendido fácilmente con:

- **Sincronización avanzada** (Bloque futuro)
- **Resolución de conflictos** (Bloque futuro)
- **Cache inteligente** (mejoras futuras)
- **Compresión de datos** (optimizaciones futuras)

---

## 📞 Soporte y Mantenimiento

### Para Desarrolladores

1. **Debugging:**
   - Usar las herramientas de testing implementadas
   - Revisar logs en consola del navegador
   - Inspeccionar IndexedDB en DevTools

2. **Extensión del Sistema:**
   - Agregar nuevos stores en `STORES` constant
   - Extender el hook `useOffline` con nuevas funciones
   - Crear componentes de testing específicos

3. **Monitoreo:**
   - Usar `getOfflineStats()` para monitorear uso de almacenamiento
   - Implementar métricas de rendimiento si es necesario

### Troubleshooting Común

1. **IndexedDB no disponible:**
   - El sistema automáticamente usa LocalStorage como fallback
   - Verificar que el navegador soporte almacenamiento local

2. **Datos no se guardan:**
   - Verificar que el objeto incluya campo 'id'
   - Revisar que `isOfflineStorageReady` sea true

3. **Indicador de conectividad no funciona:**
   - Verificar que `ConnectivityIndicator` esté incluido en el layout
   - Comprobar que `OfflineProvider` envuelva la aplicación

---

## ✅ Conclusión

El sistema offline básico implementado en el Bloque 4 proporciona una base sólida y extensible para las funcionalidades core de Tarpu Yachay PMV2. Con soporte completo para almacenamiento local, detección de conectividad, y una API simplificada, los desarrolladores pueden implementar fácilmente funcionalidades que trabajen tanto online como offline.

El sistema está completamente documentado, testado, y listo para ser integrado con los siguientes bloques del proyecto.

**Próximo paso:** Integración con el Bloque 5 (Registro de Semillas) usando las APIs implementadas.

---

_Documentación generada para Tarpu Yachay PMV2 - Bloque 4: Gestión Offline Básica_  
_Versión 1.0 - Julio 2025_
