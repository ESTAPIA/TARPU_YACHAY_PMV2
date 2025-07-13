// src/i18n/useTranslation.js
// Hook personalizado para traducciones dinámicas
// Gestiona la función t() para traducir textos según el idioma actual

import { useLanguage } from './LanguageContext'
import translations from './translations'

export const useTranslation = () => {
  const { currentLanguage } = useLanguage()

  const t = (key, params = {}) => {
    const keys = key.split('.')
    let translation = translations[currentLanguage]

    for (const k of keys) {
      translation = translation?.[k]
    }

    if (!translation) {
      console.warn(
        `Translation missing for key: ${key} in language: ${currentLanguage}`
      )
      return key
    }

    // Reemplazar parámetros si existen
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match
      })
    }

    return translation
  }

  return { t }
}
