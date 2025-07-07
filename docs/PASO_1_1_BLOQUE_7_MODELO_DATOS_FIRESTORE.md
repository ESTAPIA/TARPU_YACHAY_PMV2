# PASO 1.1 BLOQUE 7: Modelo de Datos y Estructura Firestore

**Fecha:** 14 de enero de 2025  
**Estado:** ✅ COMPLETADO  
**Bloque:** Bloque 7 - Sistema de Intercambios con WhatsApp

---

## 🎯 Objetivo del Paso

Definir y documentar la estructura completa del modelo de datos para el sistema de intercambios de semillas, incluyendo colecciones Firestore, relaciones, reglas de seguridad e índices necesarios.

---

## 📊 Modelo de Datos `exchangeData`

### Colección: `exchanges`

```javascript
{
  // === IDENTIFICACIÓN ===
  id: "exchange-{timestamp}",                    // Clave primaria (auto-generada por Firestore)
  exchangeId: "EX-{timestamp}-{randomId}",       // ID amigable para usuario (EX-20250114-ABC123)

  // === USUARIOS INVOLUCRADOS ===
  requesterId: "firebase-uid-requester",         // UID del usuario que solicita el intercambio
  requesterName: "María González",               // Nombre del solicitante
  requesterPhone: "+593987654321",               // Teléfono del solicitante (opcional)

  ownerId: "firebase-uid-owner",                 // UID del propietario de la semilla
  ownerName: "Juan Pérez",                       // Nombre del propietario
  ownerPhone: "+593912345678",                   // Teléfono del propietario

  // === SEMILLAS INVOLUCRADAS ===
  requestedSeedId: "seed-abc123",                // ID de la semilla solicitada
  requestedSeedName: "Quinoa roja criolla",      // Nombre de la semilla solicitada
  requestedSeedCategory: "granos",               // Categoría de la semilla solicitada

  offeredSeedId: "seed-def456",                  // ID de la semilla ofrecida (opcional si es donación)
  offeredSeedName: "Maíz blanco gigante",        // Nombre de la semilla ofrecida
  offeredSeedCategory: "cereales",               // Categoría de la semilla ofrecida

  // === DETALLES DEL INTERCAMBIO ===
  exchangeType: "trade",                         // Tipo: "trade" | "donation" | "request"
  status: "pending",                             // Estado: "pending" | "accepted" | "in_progress" | "completed" | "cancelled" | "rejected"

  // === COORDINACIÓN ===
  proposedDate: "2025-01-20",                    // Fecha propuesta para el intercambio (YYYY-MM-DD)
  proposedTime: "14:00",                         // Hora propuesta (HH:MM)
  proposedLocation: "Plaza central de Chugchilán", // Lugar propuesto

  confirmedDate: "2025-01-20",                   // Fecha confirmada (cuando se acepta)
  confirmedTime: "15:00",                        // Hora confirmada
  confirmedLocation: "Plaza central de Chugchilán", // Lugar confirmado

  // === COMUNICACIÓN ===
  requesterMessage: "Me interesa tu quinoa...",  // Mensaje inicial del solicitante
  ownerResponse: "Perfecto, podemos intercambiar", // Respuesta del propietario
  additionalNotes: "Llevar recipientes propios", // Notas adicionales

  // === DETALLES WHATSAPP ===
  whatsappGroupId: "120363123456789@g.us",       // ID del grupo de WhatsApp (cuando se crea)
  whatsappInviteLink: "https://chat.whatsapp.com/...", // Link de invitación al grupo
  whatsappStatus: "pending",                     // Estado WhatsApp: "pending" | "group_created" | "invited" | "active"

  // === CANTIDADES Y ESPECIFICACIONES ===
  requestedQuantity: 500,                        // Cantidad solicitada en gramos
  offeredQuantity: 300,                          // Cantidad ofrecida en gramos
  quantityUnit: "gramos",                        // Unidad: "gramos" | "kilos" | "puñados" | "plantas"

  // === METADATOS ===
  createdAt: Timestamp,                          // Fecha de creación del intercambio
  updatedAt: Timestamp,                          // Última actualización
  acceptedAt: Timestamp,                         // Fecha de aceptación (opcional)
  completedAt: Timestamp,                        // Fecha de completado (opcional)
  cancelledAt: Timestamp,                        // Fecha de cancelación (opcional)

  // === CALIFICACIONES ===
  requesterRating: 5,                            // Calificación del solicitante al propietario (1-5)
  ownerRating: 4,                                // Calificación del propietario al solicitante (1-5)
  requesterReview: "Excelente intercambio",      // Comentario del solicitante
  ownerReview: "Persona muy puntual",            // Comentario del propietario

  // === ESTADO DE SINCRONIZACIÓN ===
  syncStatus: "synced",                          // "pending" | "synced" | "error"
  version: 1,                                    // Para futuras migraciones
  isActive: true,                                // Para soft delete

  // === UBICACIÓN ===
  exchangeLocation: {                            // Coordenadas del lugar de intercambio
    latitude: -0.4263,                           // Latitud
    longitude: -78.8906,                         // Longitud
    address: "Plaza Central, Chugchilán"         // Dirección legible
  }
}
```

---

## 📨 Modelo de Datos `notificationData`

### Colección: `notifications`

```javascript
{
  // === IDENTIFICACIÓN ===
  id: "notification-{timestamp}",               // Clave primaria (auto-generada por Firestore)
  notificationId: "NOT-{timestamp}-{randomId}", // ID amigable (NOT-20250114-XYZ789)

  // === DESTINATARIO ===
  userId: "firebase-uid-recipient",             // UID del usuario destinatario
  userEmail: "user@example.com",                // Email del destinatario
  userName: "María González",                   // Nombre del destinatario

  // === CONTENIDO ===
  type: "exchange_request",                     // Tipo de notificación
  title: "Nueva solicitud de intercambio",     // Título de la notificación
  message: "Juan Pérez quiere intercambiar contigo", // Mensaje principal
  shortDescription: "Quinoa roja por Maíz blanco", // Descripción corta

  // === CONTEXTO ===
  relatedEntityType: "exchange",                // Tipo de entidad relacionada
  relatedEntityId: "exchange-abc123",           // ID de la entidad relacionada
  relatedUserId: "firebase-uid-sender",         // UID del usuario que generó la notificación
  relatedUserName: "Juan Pérez",                // Nombre del usuario relacionado

  // === ESTADO ===
  status: "unread",                             // "unread" | "read" | "archived"
  priority: "normal",                           // "low" | "normal" | "high" | "urgent"

  // === ACCIONES ===
  actionType: "exchange_decision",              // Tipo de acción requerida
  actionButtons: [                              // Botones de acción disponibles
    {
      label: "Aceptar",
      action: "accept_exchange",
      style: "primary"
    },
    {
      label: "Rechazar",
      action: "reject_exchange",
      style: "secondary"
    },
    {
      label: "Ver detalles",
      action: "view_exchange",
      style: "outline"
    }
  ],

  // === CANALES DE ENTREGA ===
  deliveryChannels: {
    inApp: true,                                // Mostrar en la app
    push: true,                                 // Enviar push notification
    email: false,                               // Enviar por email
    whatsapp: false                             // Enviar por WhatsApp
  },

  // === METADATOS ===
  createdAt: Timestamp,                         // Fecha de creación
  readAt: Timestamp,                            // Fecha de lectura (opcional)
  archivedAt: Timestamp,                        // Fecha de archivo (opcional)
  expiresAt: Timestamp,                         // Fecha de expiración (opcional)

  // === DATOS ADICIONALES ===
  metadata: {                                   // Datos adicionales según el tipo
    exchangeType: "trade",
    seedNames: ["Quinoa roja", "Maíz blanco"],
    proposedDate: "2025-01-20",
    location: "Chugchilán"
  },

  // === ESTADO DE SINCRONIZACIÓN ===
  syncStatus: "synced",                         // "pending" | "synced" | "error"
  version: 1,                                   // Para futuras migraciones
  isActive: true                                // Para soft delete
}
```

---

## 🔗 Relaciones Entre Colecciones

### Diagrama de Relaciones

```
┌─────────────┐    1:N     ┌─────────────┐    N:1     ┌─────────────┐
│   users     │ ────────── │  exchanges  │ ────────── │    seeds    │
│ (Firebase   │            │             │            │             │
│ Auth Users) │            │             │            │             │
└─────────────┘            └─────────────┘            └─────────────┘
       │                          │
       │ 1:N                      │ 1:N
       │                          │
       ▼                          ▼
┌─────────────┐            ┌─────────────┐
│notifications│            │  exchange_  │
│             │            │  messages   │
│             │            │             │
└─────────────┘            └─────────────┘
```

### Relaciones Detalladas

#### 1. **users ↔ exchanges**

- **Relación:** 1:N (un usuario puede tener múltiples intercambios)
- **Campos de unión:**
  - `exchanges.requesterId` → `users.uid`
  - `exchanges.ownerId` → `users.uid`
- **Consultas frecuentes:**
  - Intercambios donde soy solicitante: `WHERE requesterId == currentUser.uid`
  - Intercambios donde soy propietario: `WHERE ownerId == currentUser.uid`
  - Mis intercambios activos: `WHERE (requesterId == uid OR ownerId == uid) AND status IN ['pending', 'accepted', 'in_progress']`

#### 2. **seeds ↔ exchanges**

- **Relación:** 1:N (una semilla puede estar en múltiples intercambios)
- **Campos de unión:**
  - `exchanges.requestedSeedId` → `seeds.id`
  - `exchanges.offeredSeedId` → `seeds.id`
- **Consultas frecuentes:**
  - Intercambios de una semilla específica: `WHERE requestedSeedId == seedId OR offeredSeedId == seedId`
  - Semillas más intercambiadas: aggregación por `requestedSeedId`

#### 3. **users ↔ notifications**

- **Relación:** 1:N (un usuario puede tener múltiples notificaciones)
- **Campos de unión:** `notifications.userId` → `users.uid`
- **Consultas frecuentes:**
  - Notificaciones no leídas: `WHERE userId == uid AND status == 'unread'`
  - Notificaciones de intercambios: `WHERE userId == uid AND type LIKE 'exchange_%'`

#### 4. **exchanges ↔ notifications**

- **Relación:** 1:N (un intercambio puede generar múltiples notificaciones)
- **Campos de unión:** `notifications.relatedEntityId` → `exchanges.id`
- **Consultas frecuentes:**
  - Notificaciones de un intercambio: `WHERE relatedEntityId == exchangeId AND relatedEntityType == 'exchange'`

---

## 🔒 Reglas de Seguridad Firestore

### Colección `exchanges`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Reglas para intercambios
    match /exchanges/{exchangeId} {
      // Lectura: Solo los usuarios involucrados en el intercambio
      allow read: if request.auth != null &&
                     (request.auth.uid == resource.data.requesterId ||
                      request.auth.uid == resource.data.ownerId);

      // Creación: Solo usuarios autenticados pueden crear intercambios
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.requesterId &&
                       isValidExchangeData(request.resource.data);

      // Actualización: Solo los usuarios involucrados pueden actualizar
      allow update: if request.auth != null &&
                       (request.auth.uid == resource.data.requesterId ||
                        request.auth.uid == resource.data.ownerId) &&
                       isValidExchangeUpdate(request.resource.data, resource.data);

      // Eliminación: Solo soft delete, no permitir delete real
      allow delete: if false;
    }

    // Funciones de validación para intercambios
    function isValidExchangeData(data) {
      return data.keys().hasAll(['requesterId', 'ownerId', 'requestedSeedId', 'status', 'exchangeType']) &&
             data.status == 'pending' &&
             data.exchangeType in ['trade', 'donation', 'request'] &&
             data.requesterId != data.ownerId;
    }

    function isValidExchangeUpdate(newData, oldData) {
      // Solo se pueden actualizar ciertos campos según el rol
      let allowedFields = ['status', 'ownerResponse', 'confirmedDate', 'confirmedTime',
                          'confirmedLocation', 'additionalNotes', 'updatedAt'];

      // El solicitante solo puede cancelar o actualizar algunos campos
      if (request.auth.uid == oldData.requesterId) {
        return (newData.status in ['pending', 'cancelled']) &&
               onlyFieldsChanged(newData, oldData, ['status', 'requesterMessage', 'additionalNotes', 'updatedAt']);
      }

      // El propietario puede aceptar, rechazar o completar
      if (request.auth.uid == oldData.ownerId) {
        return (newData.status in ['pending', 'accepted', 'rejected', 'completed', 'in_progress']) &&
               onlyFieldsChanged(newData, oldData, allowedFields);
      }

      return false;
    }

    function onlyFieldsChanged(newData, oldData, allowedFields) {
      return newData.diff(oldData).affectedKeys().hasOnly(allowedFields);
    }
  }
}
```

### Colección `notifications`

```javascript
// Reglas para notificaciones
match /notifications/{notificationId} {
  // Lectura: Solo el usuario destinatario
  allow read: if request.auth != null &&
                 request.auth.uid == resource.data.userId;

  // Creación: Solo el sistema puede crear notificaciones (via Cloud Functions)
  allow create: if false; // Las notificaciones se crean via Cloud Functions

  // Actualización: Solo el destinatario puede marcar como leída/archivada
  allow update: if request.auth != null &&
                   request.auth.uid == resource.data.userId &&
                   onlyStatusFieldsChanged(request.resource.data, resource.data);

  // Eliminación: Solo soft delete
  allow delete: if false;
}

function onlyStatusFieldsChanged(newData, oldData) {
  let allowedFields = ['status', 'readAt', 'archivedAt', 'updatedAt'];
  return newData.diff(oldData).affectedKeys().hasOnly(allowedFields);
}
```

---

## 📊 Índices Necesarios para Consultas Eficientes

### Índices para `exchanges`

```javascript
// 1. Consultas por usuario solicitante
{
  collectionGroup: "exchanges",
  fields: [
    { fieldPath: "requesterId", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 2. Consultas por usuario propietario
{
  collectionGroup: "exchanges",
  fields: [
    { fieldPath: "ownerId", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 3. Consultas por semilla solicitada
{
  collectionGroup: "exchanges",
  fields: [
    { fieldPath: "requestedSeedId", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 4. Consultas por tipo y estado de intercambio
{
  collectionGroup: "exchanges",
  fields: [
    { fieldPath: "exchangeType", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 5. Consultas por fecha de intercambio
{
  collectionGroup: "exchanges",
  fields: [
    { fieldPath: "proposedDate", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" }
  ]
}

// 6. Búsqueda geográfica (para futuras funcionalidades)
{
  collectionGroup: "exchanges",
  fields: [
    { fieldPath: "exchangeLocation.latitude", order: "ASCENDING" },
    { fieldPath: "exchangeLocation.longitude", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" }
  ]
}
```

### Índices para `notifications`

```javascript
// 1. Notificaciones por usuario y estado
{
  collectionGroup: "notifications",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 2. Notificaciones por tipo
{
  collectionGroup: "notifications",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "type", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 3. Notificaciones por prioridad
{
  collectionGroup: "notifications",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "priority", order: "DESCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 4. Notificaciones por entidad relacionada
{
  collectionGroup: "notifications",
  fields: [
    { fieldPath: "relatedEntityType", order: "ASCENDING" },
    { fieldPath: "relatedEntityId", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// 5. Limpieza de notificaciones expiradas
{
  collectionGroup: "notifications",
  fields: [
    { fieldPath: "expiresAt", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" }
  ]
}
```

---

## 🧪 Ejemplos de Documentos para Validación

### Ejemplo 1: Intercambio de Semillas (Trade)

```javascript
// Documento en colección 'exchanges'
{
  id: "exchange-20250114143052",
  exchangeId: "EX-20250114-ABC123",

  requesterId: "kQmX8YTdUNhKJ9pL2vR3wM5sN7cE",
  requesterName: "María González",
  requesterPhone: "+593987654321",

  ownerId: "pT6nH4jKdL8mQ2vX9rN5wB3sK7cF",
  ownerName: "Juan Pérez",
  ownerPhone: "+593912345678",

  requestedSeedId: "seed-quinoa-roja-123",
  requestedSeedName: "Quinoa roja criolla",
  requestedSeedCategory: "granos",

  offeredSeedId: "seed-maiz-blanco-456",
  offeredSeedName: "Maíz blanco gigante",
  offeredSeedCategory: "cereales",

  exchangeType: "trade",
  status: "pending",

  proposedDate: "2025-01-20",
  proposedTime: "14:00",
  proposedLocation: "Plaza central de Chugchilán",

  requesterMessage: "Hola Juan, me interesa mucho tu quinoa roja. Tengo maíz blanco gigante de muy buena calidad. ¿Te interesa hacer el intercambio?",

  requestedQuantity: 500,
  offeredQuantity: 300,
  quantityUnit: "gramos",

  whatsappStatus: "pending",

  createdAt: Timestamp.fromDate(new Date("2025-01-14T14:30:52Z")),
  updatedAt: Timestamp.fromDate(new Date("2025-01-14T14:30:52Z")),

  syncStatus: "synced",
  version: 1,
  isActive: true,

  exchangeLocation: {
    latitude: -0.4263,
    longitude: -78.8906,
    address: "Plaza Central, Chugchilán, Cotopaxi"
  }
}
```

### Ejemplo 2: Notificación de Solicitud de Intercambio

```javascript
// Documento en colección 'notifications'
{
  id: "notification-20250114143100",
  notificationId: "NOT-20250114-XYZ789",

  userId: "pT6nH4jKdL8mQ2vX9rN5wB3sK7cF", // Juan Pérez (propietario)
  userEmail: "juan.perez@email.com",
  userName: "Juan Pérez",

  type: "exchange_request",
  title: "Nueva solicitud de intercambio",
  message: "María González quiere intercambiar semillas contigo",
  shortDescription: "Maíz blanco gigante por Quinoa roja criolla",

  relatedEntityType: "exchange",
  relatedEntityId: "exchange-20250114143052",
  relatedUserId: "kQmX8YTdUNhKJ9pL2vR3wM5sN7cE", // María González
  relatedUserName: "María González",

  status: "unread",
  priority: "normal",

  actionType: "exchange_decision",
  actionButtons: [
    {
      label: "Aceptar",
      action: "accept_exchange",
      style: "primary"
    },
    {
      label: "Rechazar",
      action: "reject_exchange",
      style: "secondary"
    },
    {
      label: "Ver detalles",
      action: "view_exchange",
      style: "outline"
    }
  ],

  deliveryChannels: {
    inApp: true,
    push: true,
    email: false,
    whatsapp: false
  },

  createdAt: Timestamp.fromDate(new Date("2025-01-14T14:31:00Z")),
  expiresAt: Timestamp.fromDate(new Date("2025-01-21T14:31:00Z")), // 7 días

  metadata: {
    exchangeType: "trade",
    seedNames: ["Maíz blanco gigante", "Quinoa roja criolla"],
    proposedDate: "2025-01-20",
    location: "Chugchilán",
    requesterPhone: "+593987654321"
  },

  syncStatus: "synced",
  version: 1,
  isActive: true
}
```

### Ejemplo 3: Donación de Semillas

```javascript
// Documento en colección 'exchanges' - Tipo donación
{
  id: "exchange-20250114150000",
  exchangeId: "EX-20250114-DON456",

  requesterId: "rQ8nX2mKdL5pT9vY6wN4sB7cK3fG",
  requesterName: "Carlos Morales",
  requesterPhone: "+593998765432",

  ownerId: "sR9oY3nLdM6qU0wZ7xO5tC8dL4gH",
  ownerName: "Ana Silva",
  ownerPhone: "+593987654321",

  requestedSeedId: "seed-tomate-cherry-789",
  requestedSeedName: "Tomate cherry orgánico",
  requestedSeedCategory: "hortalizas",

  offeredSeedId: null, // No hay semilla ofrecida en donaciones
  offeredSeedName: null,
  offeredSeedCategory: null,

  exchangeType: "donation",
  status: "accepted",

  proposedDate: "2025-01-18",
  proposedTime: "10:00",
  proposedLocation: "Casa de Ana Silva",

  confirmedDate: "2025-01-18",
  confirmedTime: "10:30",
  confirmedLocation: "Casa de Ana Silva",

  requesterMessage: "Hola Ana, vi que ofreces tomates cherry en donación. Me interesa mucho para mi huerto familiar.",
  ownerResponse: "Hola Carlos, claro que sí. Ven el viernes por la mañana.",
  additionalNotes: "Llevar recipiente para las semillas",

  requestedQuantity: 50,
  offeredQuantity: 0,
  quantityUnit: "semillas",

  whatsappStatus: "group_created",
  whatsappGroupId: "120363123456789@g.us",

  createdAt: Timestamp.fromDate(new Date("2025-01-14T15:00:00Z")),
  updatedAt: Timestamp.fromDate(new Date("2025-01-14T16:15:00Z")),
  acceptedAt: Timestamp.fromDate(new Date("2025-01-14T16:15:00Z")),

  syncStatus: "synced",
  version: 1,
  isActive: true
}
```

---

## 🎯 Tipos de Estado y Flujos

### Estados de `exchanges.status`

```javascript
const EXCHANGE_STATUSES = {
  PENDING: 'pending', // Solicitud creada, esperando respuesta del propietario
  ACCEPTED: 'accepted', // Propietario aceptó, coordinando detalles
  IN_PROGRESS: 'in_progress', // En proceso de intercambio (grupo WhatsApp activo)
  COMPLETED: 'completed', // Intercambio completado exitosamente
  CANCELLED: 'cancelled', // Cancelado por el solicitante
  REJECTED: 'rejected', // Rechazado por el propietario
}
```

### Estados de `notifications.status`

```javascript
const NOTIFICATION_STATUSES = {
  UNREAD: 'unread', // Notificación no leída
  READ: 'read', // Notificación leída pero no archivada
  ARCHIVED: 'archived', // Notificación archivada
}
```

### Estados de `whatsappStatus`

```javascript
const WHATSAPP_STATUSES = {
  PENDING: 'pending', // Intercambio aceptado, grupo no creado aún
  GROUP_CREATED: 'group_created', // Grupo de WhatsApp creado
  INVITED: 'invited', // Usuarios invitados al grupo
  ACTIVE: 'active', // Grupo activo y funcionando
}
```

---

## ✅ Validación y Testing

### Comandos para crear documentos de prueba en Firestore Console

```javascript
// 1. Crear intercambio de prueba
db.collection('exchanges').add({
  exchangeId: 'EX-TEST-001',
  requesterId: 'test-user-1',
  requesterName: 'Usuario Prueba 1',
  ownerId: 'test-user-2',
  ownerName: 'Usuario Prueba 2',
  requestedSeedId: 'seed-test-123',
  requestedSeedName: 'Semilla de Prueba',
  requestedSeedCategory: 'test',
  exchangeType: 'trade',
  status: 'pending',
  proposedDate: '2025-01-20',
  proposedTime: '14:00',
  proposedLocation: 'Lugar de prueba',
  requesterMessage: 'Mensaje de prueba',
  requestedQuantity: 100,
  quantityUnit: 'gramos',
  whatsappStatus: 'pending',
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  syncStatus: 'synced',
  version: 1,
  isActive: true,
})

// 2. Crear notificación de prueba
db.collection('notifications').add({
  notificationId: 'NOT-TEST-001',
  userId: 'test-user-2',
  userEmail: 'test2@example.com',
  userName: 'Usuario Prueba 2',
  type: 'exchange_request',
  title: 'Solicitud de intercambio de prueba',
  message: 'Usuario Prueba 1 quiere intercambiar contigo',
  shortDescription: 'Intercambio de prueba',
  relatedEntityType: 'exchange',
  relatedEntityId: 'EX-TEST-001',
  relatedUserId: 'test-user-1',
  relatedUserName: 'Usuario Prueba 1',
  status: 'unread',
  priority: 'normal',
  actionType: 'exchange_decision',
  deliveryChannels: {
    inApp: true,
    push: false,
    email: false,
    whatsapp: false,
  },
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  syncStatus: 'synced',
  version: 1,
  isActive: true,
})
```

### Consultas de prueba para validar índices

```javascript
// 1. Obtener intercambios de un usuario (requiere índice requesterId + status + createdAt)
db.collection('exchanges')
  .where('requesterId', '==', 'test-user-1')
  .where('status', 'in', ['pending', 'accepted'])
  .orderBy('createdAt', 'desc')
  .limit(10)

// 2. Obtener notificaciones no leídas (requiere índice userId + status + createdAt)
db.collection('notifications')
  .where('userId', '==', 'test-user-2')
  .where('status', '==', 'unread')
  .orderBy('createdAt', 'desc')

// 3. Búsqueda por tipo de intercambio (requiere índice exchangeType + status + createdAt)
db.collection('exchanges')
  .where('exchangeType', '==', 'donation')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
```

---

## 📋 Checklist de Validación

- [x] **Modelo `exchangeData` definido completamente** ✅
- [x] **Modelo `notificationData` definido completamente** ✅
- [x] **Relaciones entre colecciones documentadas** ✅
- [x] **Reglas de seguridad Firestore propuestas** ✅
- [x] **Índices necesarios identificados y especificados** ✅
- [x] **Ejemplos de documentos creados para validación** ✅
- [x] **Estados y flujos de trabajo definidos** ✅
- [x] **Comandos de testing preparados** ✅

---

## 🎯 Próximos Pasos

**Siguiente:** Paso 1.2 - Implementar servicios básicos de intercambio  
**Incluirá:**

- `exchangeService.js` - CRUD básico para intercambios
- `notificationService.js` - Gestión de notificaciones
- Validaciones de datos
- Manejo de errores

---

## 📝 Notas de Implementación

1. **Optimización de consultas:** Los índices propuestos cubren las consultas más frecuentes esperadas
2. **Seguridad:** Las reglas permiten acceso granular según el rol del usuario en cada intercambio
3. **Escalabilidad:** La estructura soporta futuras funcionalidades como ratings, geolocalización, y múltiples tipos de intercambio
4. **Offline:** Compatibilidad con el sistema offline existente a través de `syncStatus`
5. **WhatsApp:** Preparado para integración con API de WhatsApp Business en pasos posteriores

---

**Estado:** ✅ **PASO 1.1 COMPLETADO**  
**Próximo paso:** Paso 1.2 - Implementar servicios básicos de intercambio
