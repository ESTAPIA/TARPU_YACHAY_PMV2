// src/utils/whatsappUtils.js
// BLOQUE 7 - PASO 5: Utilidades para manejo de WhatsApp
//
// Funciones auxiliares para validación y normalización de números
// ecuatorianos y generación de enlaces de WhatsApp

/**
 * Valida si un número de teléfono tiene formato ecuatoriano válido
 * @param {string} phoneNumber - Número a validar
 * @returns {boolean} true si el formato es válido
 */
export function isValidEcuadorianPhone(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false
  }

  // Limpiar el número de espacios y caracteres especiales
  const cleanNumber = phoneNumber.replace(/[\s\-()]/g, '')

  // Patrones válidos para Ecuador:
  // +593XXXXXXXXX (9 dígitos después de +593)
  // 593XXXXXXXXX (sin +)
  // 0XXXXXXXXX (formato local ecuatoriano)
  const patterns = [
    /^\+593\d{9}$/, // +593 + 9 dígitos
    /^593\d{9}$/, // 593 + 9 dígitos
    /^0\d{9}$/, // 0 + 9 dígitos (formato local)
  ]

  return patterns.some(pattern => pattern.test(cleanNumber))
}

/**
 * Normaliza un número ecuatoriano al formato internacional +593
 * @param {string} phoneNumber - Número a normalizar
 * @returns {string} Número en formato +593XXXXXXXXX
 */
export function normalizeEcuadorianPhone(phoneNumber) {
  if (!phoneNumber) return ''

  const cleanNumber = phoneNumber.replace(/[\s\-()]/g, '')

  // Si ya tiene +593, devolverlo tal como está
  if (cleanNumber.startsWith('+593')) {
    return cleanNumber
  }

  // Si tiene 593, agregar el +
  if (cleanNumber.startsWith('593')) {
    return `+${cleanNumber}`
  }

  // Si empieza con 0 (formato local), reemplazar por +593
  if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
    return `+593${cleanNumber.substring(1)}`
  }

  // Si no tiene prefijo pero tiene 9 dígitos, asumir que es local sin el 0
  if (cleanNumber.length === 9 && /^\d{9}$/.test(cleanNumber)) {
    return `+593${cleanNumber}`
  }

  return cleanNumber
}

/**
 * Crea el enlace de WhatsApp con mensaje personalizado
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} seedName - Nombre de la semilla
 * @param {string} userName - Nombre del usuario que contacta
 * @returns {string|null} URL de WhatsApp o null si hay error
 */
export function createWhatsAppLink(phoneNumber, seedName, userName) {
  // Validar parámetros
  if (!phoneNumber || !seedName || !userName) {
    console.error('Faltan parámetros para crear enlace de WhatsApp')
    return null
  }

  // Validar y normalizar número
  if (!isValidEcuadorianPhone(phoneNumber)) {
    console.error('Número de teléfono no válido:', phoneNumber)
    return null
  }

  const normalizedPhone = normalizeEcuadorianPhone(phoneNumber)

  // Crear mensaje personalizado
  const message = `Hola! Te contacto por la semilla '${seedName}' que ofreciste en Tarpu Yachay. Soy ${userName} y me interesa intercambiar. ¿Podemos coordinar?`

  // Codificar mensaje para URL
  const encodedMessage = encodeURIComponent(message)

  // Crear URL de WhatsApp
  // Usar wa.me para máxima compatibilidad
  const whatsappUrl = `https://wa.me/${normalizedPhone.replace('+', '')}?text=${encodedMessage}`

  return whatsappUrl
}

/**
 * Valida si el formato del número de teléfono corresponde a Ecuador
 * Esta función es más estricta y verifica códigos de área específicos
 * @param {string} phoneNumber - Número a validar
 * @returns {boolean} true si es un número ecuatoriano válido
 */
export function isValidEcuadorianPhoneStrict(phoneNumber) {
  if (!isValidEcuadorianPhone(phoneNumber)) {
    return false
  }

  const normalized = normalizeEcuadorianPhone(phoneNumber)

  // Extraer los primeros dígitos después de +593
  const localNumber = normalized.replace('+593', '')

  // Códigos de área válidos para Ecuador
  // 2: Quito y provincia de Pichincha
  // 3: Cuenca y provincia del Azuay
  // 4: Machala y provincia de El Oro
  // 5: Ambato y provincia de Tungurahua
  // 6: Riobamba y provincia de Chimborazo
  // 7: Loja y provincia de Loja
  // 9: Celulares (móviles)
  const validAreaCodes = ['2', '3', '4', '5', '6', '7', '9']

  return validAreaCodes.includes(localNumber.charAt(0))
}
