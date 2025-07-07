// src/models/userProfileModel.js
// BLOQUE 8 - PASO 1.1: Modelo de datos de perfil de usuario
//
// Definición completa de la estructura de datos para perfiles de usuario
// Integración con Firebase Firestore y sistema offline existente
// Base para desbloquear funcionalidades del Bloque 7 (intercambios)

/**
 * @typedef {Object} UserProfileData
 * @description Estructura completa del perfil de usuario en Firestore
 * @property {string} uid - Firebase UID del usuario (clave primaria)
 * @property {string} name - Nombre completo del usuario
 * @property {string} email - Email del usuario (desde Firebase Auth)
 * @property {string} location - Ubicación general del usuario
 * @property {string} whatsappNumber - Número de WhatsApp (formato ecuatoriano +593XXXXXXXXX)
 * @property {string} profileImageUrl - URL de imagen de perfil (opcional)
 * @property {string} createdAt - Timestamp de creación de la cuenta
 * @property {string} updatedAt - Timestamp de última actualización
 * @property {UserSettings} settings - Configuraciones de privacidad y notificaciones
 * @property {UserStats} stats - Estadísticas de actividad del usuario
 */

/**
 * @typedef {Object} UserSettings
 * @description Configuraciones de privacidad y notificaciones
 * @property {PrivacySettings} privacy - Configuraciones de privacidad
 * @property {NotificationSettings} notifications - Configuraciones de notificaciones
 */

/**
 * @typedef {Object} PrivacySettings
 * @description Configuraciones de privacidad del usuario
 * @property {boolean} showPhoneNumber - Mostrar WhatsApp solo en intercambios aceptados
 * @property {boolean} showExactLocation - Mostrar ubicación exacta (false = solo general)
 * @property {boolean} allowExchangeRequests - Permitir recibir solicitudes de intercambio
 */

/**
 * @typedef {Object} NotificationSettings
 * @description Configuraciones de notificaciones del usuario
 * @property {boolean} newExchangeRequests - Notificar nuevas solicitudes de intercambio
 * @property {boolean} exchangeStatusUpdates - Notificar cambios de estado en intercambios
 */

/**
 * @typedef {Object} UserStats
 * @description Estadísticas de actividad calculadas en tiempo real
 * @property {number} seedsRegistered - Total de semillas registradas por el usuario
 * @property {number} exchangesCompleted - Total de intercambios completados
 * @property {number} exchangesPending - Total de intercambios pendientes (enviados + recibidos)
 * @property {MostPopularSeed} mostPopularSeed - Semilla más solicitada del usuario
 */

/**
 * @typedef {Object} MostPopularSeed
 * @description Información de la semilla más popular del usuario
 * @property {string} seedId - ID de la semilla más solicitada
 * @property {string} name - Nombre de la semilla
 * @property {number} requestCount - Número de solicitudes recibidas
 */

/**
 * Estructura completa del modelo de datos de perfil de usuario
 * Esta estructura será usada en Firestore colección 'users'
 *
 * Relaciones con otras colecciones:
 * - seeds: ownerId -> users.uid (un usuario puede tener muchas semillas)
 * - exchanges: requesterId, ownerId -> users.uid (un usuario puede participar en muchos intercambios)
 * - notifications: userId -> users.uid (un usuario puede tener muchas notificaciones)
 */
export const userProfileDataModel = {
  uid: 'firebase-uid', // String - Firebase UID (clave primaria)
  name: 'nombre-usuario', // String - Nombre completo del usuario
  email: 'email@ejemplo.com', // String - Email del usuario (desde Firebase Auth)
  location: 'ubicacion-general', // String - Ubicación general (ej: "Chugchilán, Cotopaxi")
  whatsappNumber: '+593XXXXXXXXX', // String - CRÍTICO para intercambios (formato ecuatoriano)
  profileImageUrl: 'url-opcional', // String - URL de imagen de perfil (opcional)
  createdAt: 'timestamp', // Timestamp - Fecha de creación de la cuenta
  updatedAt: 'timestamp', // Timestamp - Fecha de última actualización

  settings: {
    privacy: {
      showPhoneNumber: false, // Boolean - Mostrar WhatsApp solo en intercambios aceptados
      showExactLocation: false, // Boolean - Mostrar solo ubicación general
      allowExchangeRequests: true, // Boolean - Permitir solicitudes de intercambio
    },
    notifications: {
      newExchangeRequests: true, // Boolean - Notificar nuevas solicitudes
      exchangeStatusUpdates: true, // Boolean - Notificar cambios de estado
    },
  },

  stats: {
    seedsRegistered: 0, // Number - Total de semillas registradas
    exchangesCompleted: 0, // Number - Total de intercambios completados
    exchangesPending: 0, // Number - Total de intercambios pendientes
    mostPopularSeed: {
      seedId: 'id', // String - ID de la semilla más solicitada
      name: 'nombre', // String - Nombre de la semilla
      requestCount: 0, // Number - Número de solicitudes recibidas
    },
  },
}

/**
 * Estructura de ejemplo con datos reales para validación
 */
export const userProfileDataExample = {
  uid: 'abc123def456ghi789',
  name: 'María Elena Quingatuña',
  email: 'maria.quingatuna@tarpuyachay.com',
  location: 'Chugchilán, Cotopaxi',
  whatsappNumber: '+593987654321',
  profileImageUrl:
    'https://firebasestorage.googleapis.com/v0/b/tarpu-yachay/o/profiles%2Fabc123.jpg',
  createdAt: '2025-07-02T10:30:00.000Z',
  updatedAt: '2025-07-05T14:20:00.000Z',

  settings: {
    privacy: {
      showPhoneNumber: false,
      showExactLocation: false,
      allowExchangeRequests: true,
    },
    notifications: {
      newExchangeRequests: true,
      exchangeStatusUpdates: true,
    },
  },

  stats: {
    seedsRegistered: 5,
    exchangesCompleted: 3,
    exchangesPending: 2,
    mostPopularSeed: {
      seedId: 'seed-quinoa-roja-123',
      name: 'Quinoa Roja Orgánica',
      requestCount: 8,
    },
  },
}

/**
 * Validaciones requeridas para el modelo de datos
 */
export const userProfileValidationRules = {
  uid: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 128,
  },
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/,
  },
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  location: {
    required: false,
    type: 'string',
    maxLength: 100,
  },
  whatsappNumber: {
    required: false, // Se vuelve obligatorio para intercambios
    type: 'string',
    pattern: /^\+593\d{9}$/, // Formato ecuatoriano estricto
    description: 'Formato requerido: +593XXXXXXXXX (Ecuador)',
  },
  profileImageUrl: {
    required: false,
    type: 'string',
    pattern: /^https?:\/\/.+/,
  },
}

/**
 * Campos requeridos para diferentes operaciones
 */
export const requiredFieldsByOperation = {
  // Para crear cuenta básica
  registration: ['uid', 'name', 'email'],

  // Para participar en intercambios (CRÍTICO para desbloquear Bloque 7)
  exchanges: ['uid', 'name', 'email', 'whatsappNumber'],

  // Para perfil completo
  fullProfile: ['uid', 'name', 'email', 'location', 'whatsappNumber'],
}

/**
 * Valores por defecto para configuraciones
 */
export const defaultUserSettings = {
  privacy: {
    showPhoneNumber: false, // Seguridad: WhatsApp solo visible tras aceptar intercambio
    showExactLocation: false, // Privacidad: solo ubicación general
    allowExchangeRequests: true, // Funcionalidad: permitir solicitudes por defecto
  },
  notifications: {
    newExchangeRequests: true, // UX: notificar nuevas solicitudes
    exchangeStatusUpdates: true, // UX: notificar cambios de estado
  },
}

/**
 * Estadísticas iniciales para usuarios nuevos
 */
export const defaultUserStats = {
  seedsRegistered: 0,
  exchangesCompleted: 0,
  exchangesPending: 0,
  mostPopularSeed: {
    seedId: null,
    name: null,
    requestCount: 0,
  },
}

export default {
  userProfileDataModel,
  userProfileDataExample,
  userProfileValidationRules,
  requiredFieldsByOperation,
  defaultUserSettings,
  defaultUserStats,
}
