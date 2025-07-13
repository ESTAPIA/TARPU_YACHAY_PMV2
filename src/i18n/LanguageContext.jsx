// src/i18n/LanguageContext.jsx
// Contexto global de idiomas para Tarpu Yachay PMV2
// Gestión centralizada de cambio entre Español y Kichwa de Cotopaxi

import React, { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { LANGUAGES, DEFAULT_LANGUAGE } from './constants'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app_language')
    if (savedLanguage && Object.values(LANGUAGES).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = newLanguage => {
    setCurrentLanguage(newLanguage)
    localStorage.setItem('app_language', newLanguage)
  }

  const value = {
    currentLanguage,
    changeLanguage,
    isSpanish: currentLanguage === LANGUAGES.ES,
    isKichwa: currentLanguage === LANGUAGES.KI,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// PropTypes
LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
