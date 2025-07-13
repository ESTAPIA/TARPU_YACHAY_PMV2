/**
 * LanguageSwitch Component
 *
 * Componente para cambiar idioma entre Español y Kichwa Cotopaxi
 *
 * Características:
 * - Botón toggle simple y accesible
 * - Indica el idioma actual
 * - Persiste la preferencia automáticamente
 * - Accesible via teclado
 * - Textos completamente traducidos
 *
 * Uso:
 * <LanguageSwitch />
 */

import React from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useTranslation } from '../../i18n/useTranslation'
import { LANGUAGES } from '../../i18n/constants'

const LanguageSwitch = () => {
  const { currentLanguage, changeLanguage } = useLanguage()
  const { t } = useTranslation()

  const toggleLanguage = () => {
    const newLanguage =
      currentLanguage === LANGUAGES.ES ? LANGUAGES.KI : LANGUAGES.ES
    changeLanguage(newLanguage)
  }

  const isSpanish = currentLanguage === LANGUAGES.ES
  const currentLangCode = isSpanish ? 'ES' : 'KI'
  const nextLangCode = isSpanish ? 'KI' : 'ES'

  const ariaLabel = isSpanish
    ? t('languageSwitch.switch_to_kichwa')
    : t('languageSwitch.switch_to_spanish')

  return (
    <button
      onClick={toggleLanguage}
      style={styles.button}
      aria-label={ariaLabel}
      title={t('languageSwitch.toggle_language')}
      onMouseEnter={e => {
        Object.assign(e.target.style, styles.buttonHover)
      }}
      onMouseLeave={e => {
        Object.assign(e.target.style, styles.button)
      }}
      onMouseDown={e => {
        e.target.style.transform = 'scale(0.95)'
      }}
      onMouseUp={e => {
        e.target.style.transform = styles.button.transform
      }}
    >
      {/* Idioma actual */}
      <span style={styles.currentLang}>{currentLangCode}</span>

      {/* Separador animado */}
      <div style={styles.separator}>
        <svg
          style={styles.arrowIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      </div>

      {/* Idioma siguiente */}
      <span style={styles.nextLang}>{nextLangCode}</span>
    </button>
  )
}

// Estilos modernos y compactos
const styles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    padding: '6px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#374151',
    border: '1px solid rgba(209, 213, 219, 0.7)',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transform: 'scale(1)',
    outline: 'none',
    minWidth: '65px',
    height: '30px',
    position: 'relative',

    // Responsive
    '@media (max-width: 768px)': {
      padding: '4px 8px',
      fontSize: '10px',
      minWidth: '60px',
      height: '28px',
      gap: '1px',
    },

    // Focus state
    ':focus': {
      borderColor: '#10b981',
      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
    },
  },

  buttonHover: {
    backgroundColor: 'rgba(249, 250, 251, 1)',
    transform: 'scale(1.05)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    borderColor: '#10b981',
  },

  currentLang: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: '11px',
    letterSpacing: '0.5px',
  },

  separator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 2px',
  },

  arrowIcon: {
    width: '10px',
    height: '10px',
    color: '#6b7280',
    opacity: 0.7,
    transform: 'rotate(90deg)',
  },

  nextLang: {
    color: '#9ca3af',
    fontWeight: '500',
    fontSize: '10px',
    letterSpacing: '0.5px',
    opacity: 0.7,
  },
}

export default LanguageSwitch
