// src/utils/profileValidation.js
// BLOQUE 8 - PASO 1.1: Validaciones para modelo de perfil de usuario
//
// Funciones de validación específicas para perfiles de usuario
// Integración con whatsappUtils.js existente
// Validaciones tanto para frontend como para preparar datos de Firestore

import {
  isValidEcuadorianPhone,
  normalizeEcuadorianPhone,
} from './whatsappUtils'

/**
 * Valida un perfil de usuario completo
 * @param {Object} profileData - Datos del perfil a validar
 * @returns {Object} Resultado de validación { isValid, errors, warnings }
 */
export function validateUserProfile(profileData) {
  const errors = []
  const warnings = []

  // Validar UID (requerido)
  if (!profileData.uid || typeof profileData.uid !== 'string') {
    errors.push('UID de usuario es requerido')
  }

  // Validar nombre (requerido)
  if (!profileData.name || typeof profileData.name !== 'string') {
    errors.push('Nombre es requerido')
  } else if (profileData.name.trim().length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres')
  } else if (profileData.name.trim().length > 50) {
    errors.push('Nombre no puede exceder 50 caracteres')
  } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(profileData.name.trim())) {
    errors.push('Nombre solo puede contener letras y espacios')
  }

  // Validar email (requerido)
  if (!profileData.email || typeof profileData.email !== 'string') {
    errors.push('Email es requerido')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
    errors.push('Formato de email inválido')
  }

  // Validar ubicación (opcional)
  if (profileData.location && typeof profileData.location === 'string') {
    if (profileData.location.trim().length > 100) {
      errors.push('Ubicación no puede exceder 100 caracteres')
    }
  }

  // Validar WhatsApp (crítico para intercambios)
  if (profileData.whatsappNumber) {
    if (typeof profileData.whatsappNumber !== 'string') {
      errors.push('Número de WhatsApp debe ser texto')
    } else if (!isValidEcuadorianPhone(profileData.whatsappNumber)) {
      errors.push(
        'Número de WhatsApp debe tener formato ecuatoriano válido (+593XXXXXXXXX)'
      )
    }
  } else {
    warnings.push(
      'WhatsApp no configurado - no podrás participar en intercambios'
    )
  }

  // Validar URL de imagen de perfil (opcional)
  if (
    profileData.profileImageUrl &&
    typeof profileData.profileImageUrl === 'string'
  ) {
    if (!/^https?:\/\/.+/.test(profileData.profileImageUrl)) {
      errors.push('URL de imagen de perfil debe ser una URL válida')
    }
  }

  // Validar configuraciones
  if (profileData.settings) {
    const settingsValidation = validateUserSettings(profileData.settings)
    errors.push(...settingsValidation.errors)
    warnings.push(...settingsValidation.warnings)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida configuraciones de usuario
 * @param {Object} settings - Configuraciones del usuario
 * @returns {Object} Resultado de validación { errors, warnings }
 */
export function validateUserSettings(settings) {
  const errors = []
  const warnings = []

  if (!settings || typeof settings !== 'object') {
    errors.push('Configuraciones de usuario requeridas')
    return { errors, warnings }
  }

  // Validar configuraciones de privacidad
  if (!settings.privacy || typeof settings.privacy !== 'object') {
    errors.push('Configuraciones de privacidad requeridas')
  } else {
    const { showPhoneNumber, showExactLocation, allowExchangeRequests } =
      settings.privacy

    if (typeof showPhoneNumber !== 'boolean') {
      errors.push('showPhoneNumber debe ser boolean')
    }

    if (typeof showExactLocation !== 'boolean') {
      errors.push('showExactLocation debe ser boolean')
    }

    if (typeof allowExchangeRequests !== 'boolean') {
      errors.push('allowExchangeRequests debe ser boolean')
    } else if (!allowExchangeRequests) {
      warnings.push('Intercambios deshabilitados - no recibirás solicitudes')
    }
  }

  // Validar configuraciones de notificaciones
  if (!settings.notifications || typeof settings.notifications !== 'object') {
    errors.push('Configuraciones de notificaciones requeridas')
  } else {
    const { newExchangeRequests, exchangeStatusUpdates } =
      settings.notifications

    if (typeof newExchangeRequests !== 'boolean') {
      errors.push('newExchangeRequests debe ser boolean')
    }

    if (typeof exchangeStatusUpdates !== 'boolean') {
      errors.push('exchangeStatusUpdates debe ser boolean')
    }
  }

  return { errors, warnings }
}

/**
 * Valida que un usuario esté listo para participar en intercambios
 * @param {Object} userProfile - Perfil del usuario
 * @returns {Object} Resultado de validación { canExchange, missingFields, issues }
 */
export function validateUserForExchanges(userProfile) {
  const missingFields = []
  const issues = []

  // Campos obligatorios para intercambios
  if (!userProfile.uid) missingFields.push('UID de usuario')
  if (!userProfile.name || userProfile.name.trim().length < 2) {
    missingFields.push('Nombre válido')
  }
  if (
    !userProfile.whatsappNumber ||
    !isValidEcuadorianPhone(userProfile.whatsappNumber)
  ) {
    missingFields.push('Número de WhatsApp ecuatoriano válido')
  }

  // Verificar configuraciones de privacidad
  if (!userProfile.settings?.privacy?.allowExchangeRequests) {
    issues.push('Intercambios deshabilitados en configuraciones de privacidad')
  }

  // Verificar email válido
  if (
    !userProfile.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userProfile.email)
  ) {
    missingFields.push('Email válido')
  }

  return {
    canExchange: missingFields.length === 0 && issues.length === 0,
    missingFields,
    issues,
  }
}

/**
 * Prepara datos de perfil para guardar en Firestore
 * @param {Object} profileData - Datos del perfil
 * @returns {Object} Datos preparados para Firestore
 */
export function prepareProfileDataForFirestore(profileData) {
  const prepared = {
    uid: profileData.uid,
    name: profileData.name?.trim(),
    email: profileData.email?.trim().toLowerCase(),
    location: profileData.location?.trim() || '',
    profileImageUrl: profileData.profileImageUrl?.trim() || '',
    updatedAt: new Date().toISOString(),
  }

  // Normalizar y validar WhatsApp
  if (profileData.whatsappNumber) {
    const normalizedPhone = normalizeEcuadorianPhone(profileData.whatsappNumber)
    if (isValidEcuadorianPhone(normalizedPhone)) {
      prepared.whatsappNumber = normalizedPhone
    }
  }

  // Agregar configuraciones con valores por defecto
  prepared.settings = {
    privacy: {
      showPhoneNumber: profileData.settings?.privacy?.showPhoneNumber ?? false,
      showExactLocation:
        profileData.settings?.privacy?.showExactLocation ?? false,
      allowExchangeRequests:
        profileData.settings?.privacy?.allowExchangeRequests ?? true,
    },
    notifications: {
      newExchangeRequests:
        profileData.settings?.notifications?.newExchangeRequests ?? true,
      exchangeStatusUpdates:
        profileData.settings?.notifications?.exchangeStatusUpdates ?? true,
    },
  }

  // Agregar estadísticas iniciales si es usuario nuevo
  if (!profileData.stats) {
    prepared.stats = {
      seedsRegistered: 0,
      exchangesCompleted: 0,
      exchangesPending: 0,
      mostPopularSeed: {
        seedId: null,
        name: null,
        requestCount: 0,
      },
    }
  }

  // Agregar timestamp de creación si es usuario nuevo
  if (!profileData.createdAt) {
    prepared.createdAt = new Date().toISOString()
  }

  return prepared
}

/**
 * Obtiene campos faltantes para completar perfil
 * @param {Object} userProfile - Perfil actual del usuario
 * @returns {Array} Lista de campos faltantes
 */
export function getMissingProfileFields(userProfile) {
  const missing = []

  if (!userProfile.name || userProfile.name.trim().length < 2) {
    missing.push('Nombre completo')
  }

  if (!userProfile.location || userProfile.location.trim().length === 0) {
    missing.push('Ubicación')
  }

  if (
    !userProfile.whatsappNumber ||
    !isValidEcuadorianPhone(userProfile.whatsappNumber)
  ) {
    missing.push('Número de WhatsApp')
  }

  return missing
}

/**
 * Calcula el porcentaje de completitud del perfil
 * @param {Object} userProfile - Perfil del usuario
 * @returns {number} Porcentaje de completitud (0-100)
 */
export function calculateProfileCompleteness(userProfile) {
  const fields = [
    { key: 'name', weight: 25 },
    { key: 'email', weight: 20 },
    { key: 'location', weight: 20 },
    { key: 'whatsappNumber', weight: 30 },
    { key: 'profileImageUrl', weight: 5 },
  ]

  let totalWeight = 0
  let completedWeight = 0

  fields.forEach(field => {
    totalWeight += field.weight

    if (field.key === 'whatsappNumber') {
      if (
        userProfile.whatsappNumber &&
        isValidEcuadorianPhone(userProfile.whatsappNumber)
      ) {
        completedWeight += field.weight
      }
    } else if (
      userProfile[field.key] &&
      userProfile[field.key].toString().trim().length > 0
    ) {
      completedWeight += field.weight
    }
  })

  return Math.round((completedWeight / totalWeight) * 100)
}

export default {
  validateUserProfile,
  validateUserSettings,
  validateUserForExchanges,
  prepareProfileDataForFirestore,
  getMissingProfileFields,
  calculateProfileCompleteness,
}
