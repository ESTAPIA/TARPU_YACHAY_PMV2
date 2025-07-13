/**
 * Exportador centralizado de traducciones para Tarpu Yachay PMV2
 *
 * Este archivo centraliza todas las traducciones disponibles en la aplicación
 * para facilitar su importación y uso en el hook useTranslation.
 *
 * Idiomas soportados:
 * - 'es': Español (idioma por defecto)
 * - 'ki': Kichwa Cotopaxi (idioma ancestral)
 *
 * Uso:
 * - Se importa automáticamente en useTranslation.js
 * - Permite acceso dinámico a traducciones: translations[language][key]
 * - Soporta parámetros dinámicos y estructuras anidadas
 *
 * Estructura:
 * {
 *   es: { ...traducionesEspañol },
 *   ki: { ...traducionesKichwa }
 * }
 */

import es from './es.json'
import ki from './ki.json'

export default {
  es,
  ki,
}
