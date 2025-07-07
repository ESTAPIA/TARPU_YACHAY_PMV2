// src/components/exchanges/WhatsAppContactButton.jsx
// BLOQUE 7 - PASO 5: Componente para contactar por WhatsApp
//
// Funcionalidades:
// - Botón para abrir conversación de WhatsApp con mensaje personalizado
// - Validación de formato ecuatoriano (+593)
// - Manejo de casos sin número disponible
// - Mensaje template personalizado en español
// - Apertura en nueva ventana/pestaña

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  isValidEcuadorianPhone,
  createWhatsAppLink,
} from '../../utils/whatsappUtils'
import './WhatsAppContactButton.css'

/**
 * Componente WhatsAppContactButton
 * @param {Object} props - Props del componente
 * @param {string} props.phoneNumber - Número de teléfono del contacto
 * @param {string} props.seedName - Nombre de la semilla
 * @param {string} props.userName - Nombre del usuario que inicia contacto
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {string} props.size - Tamaño del botón ('small', 'medium', 'large')
 * @param {function} props.onError - Callback para manejar errores
 * @param {function} props.onClick - Callback adicional al hacer click
 */
function WhatsAppContactButton({
  phoneNumber,
  seedName,
  userName,
  disabled = false,
  size = 'medium',
  onError = null,
  onClick = null,
}) {
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si el número está disponible y es válido
  const isPhoneValid = phoneNumber && isValidEcuadorianPhone(phoneNumber)

  const handleClick = () => {
    if (disabled || isLoading || !isPhoneValid) {
      return
    }

    // Ejecutar callback adicional si se proporciona
    if (onClick) {
      onClick()
    }

    setIsLoading(true)

    try {
      // Crear enlace de WhatsApp
      const whatsappUrl = createWhatsAppLink(phoneNumber, seedName, userName)

      if (!whatsappUrl) {
        throw new Error('No se pudo generar el enlace de WhatsApp')
      }

      // Abrir en nueva ventana/pestaña
      const newWindow = window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      )

      // Verificar si se pudo abrir la ventana
      if (!newWindow) {
        throw new Error(
          'No se pudo abrir WhatsApp. Verifica que no esté bloqueado por el navegador.'
        )
      }

      console.log('✅ Enlace de WhatsApp abierto correctamente')
    } catch (error) {
      console.error('❌ Error al abrir WhatsApp:', error)

      if (onError) {
        onError(error.message)
      } else {
        alert(`Error: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Si no hay número disponible, mostrar botón deshabilitado con mensaje
  if (!phoneNumber) {
    return (
      <button
        className={`whatsapp-button whatsapp-button-${size} whatsapp-button-disabled`}
        disabled={true}
        title="Número de WhatsApp no disponible"
      >
        <span className="whatsapp-icon">💬</span>
        <span className="whatsapp-text">Sin número disponible</span>
      </button>
    )
  }

  // Si el número no es válido
  if (!isPhoneValid) {
    return (
      <button
        className={`whatsapp-button whatsapp-button-${size} whatsapp-button-disabled`}
        disabled={true}
        title="Número de WhatsApp no válido"
      >
        <span className="whatsapp-icon">⚠️</span>
        <span className="whatsapp-text">Número no válido</span>
      </button>
    )
  }

  // Botón normal funcionando
  return (
    <button
      className={`whatsapp-button whatsapp-button-${size} ${
        disabled || isLoading ? 'whatsapp-button-disabled' : ''
      }`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      title={`Contactar por WhatsApp sobre ${seedName}`}
    >
      <span className="whatsapp-icon">{isLoading ? '⏳' : '📱'}</span>
      <span className="whatsapp-text">
        {isLoading ? 'Abriendo...' : 'Contactar por WhatsApp'}
      </span>
    </button>
  )
}

// Validación de props
WhatsAppContactButton.propTypes = {
  phoneNumber: PropTypes.string.isRequired,
  seedName: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onError: PropTypes.func,
  onClick: PropTypes.func,
}

WhatsAppContactButton.defaultProps = {
  disabled: false,
  size: 'medium',
  onError: null,
  onClick: null,
}

export default WhatsAppContactButton
