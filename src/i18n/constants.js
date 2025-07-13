// src/i18n/constants.js
// Constantes para el sistema de idiomas Español-Kichwa

/**
 * Códigos de idiomas soportados por la aplicación
 */
export const LANGUAGES = {
  ES: 'es',
  KI: 'ki',
}

/**
 * Nombres legibles de los idiomas para mostrar en la interfaz
 */
export const LANGUAGE_NAMES = {
  [LANGUAGES.ES]: 'Español',
  [LANGUAGES.KI]: 'Kichwa',
}

/**
 * Idioma por defecto del sistema
 * Se usa cuando no hay preferencia guardada del usuario
 */
export const DEFAULT_LANGUAGE = LANGUAGES.ES
