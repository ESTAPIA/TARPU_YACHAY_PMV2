// src/components/catalog/SeedDetailModal.jsx
// BLOQUE 6 - PASO 4: Modal de vista detallada de semilla
//
// Componente modal que muestra información completa de una semilla:
// - Imagen principal con zoom básico
// - Información completa: nombre, variedad, descripción, categoría, ubicación
// - Datos del propietario (nombre, ubicación general, sin teléfono/email)
// - Botón para solicitar intercambio (si está disponible)
// - Diseño responsive y accesible

import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { getCategoryById } from '../../data/seedCategories'

/**
 * @typedef {Object} SeedDetailModalProps
 * @property {Object} seed - Datos completos de la semilla
 * @property {boolean} isOpen - Estado de apertura del modal
 * @property {function} onClose - Callback para cerrar el modal
 * @property {function} onRequestExchange - Callback para solicitar intercambio
 */

function SeedDetailModal({ seed, isOpen, onClose, onRequestExchange }) {
  const [imageZoomed, setImageZoomed] = useState(false)
  const [imageError, setImageError] = useState(false)
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Función para cerrar el modal
  const handleClose = useCallback(() => {
    setImageZoomed(false)
    setImageError(false)
    onClose()
  }, [onClose])

  // Manejo de teclado y focus
  useEffect(() => {
    if (isOpen) {
      // Guardar el elemento que tenía focus
      previousFocusRef.current = document.activeElement

      // Mover focus al modal
      if (modalRef.current) {
        modalRef.current.focus()
      }

      // Manejar tecla Escape
      const handleKeyDown = e => {
        if (e.key === 'Escape') {
          handleClose()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'

        // Restaurar focus al elemento anterior
        if (previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [isOpen, handleClose])

  // Reset estados cuando cambia la semilla
  useEffect(() => {
    setImageZoomed(false)
    setImageError(false)
  }, [seed?.id])

  // No renderizar si el modal está cerrado o no hay semilla
  if (!isOpen || !seed) {
    return null
  }

  // Manejar click en overlay para cerrar
  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Manejar zoom de imagen
  const handleImageClick = () => {
    if (!imageError && seed.imageUrl) {
      setImageZoomed(!imageZoomed)
    }
  }

  // Manejar error de imagen
  const handleImageError = () => {
    setImageError(true)
  }

  // Obtener información de categoría
  const category = getCategoryById(seed.category)
  const categoryName = category ? category.name : seed.category

  // Formatear fecha
  const formatDate = date => {
    try {
      if (!date) return 'Fecha no disponible'
      const dateObj = date instanceof Date ? date : new Date(date)
      return dateObj.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Fecha no disponible'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={handleOverlayClick}
      onKeyDown={e => e.key === 'Enter' && handleOverlayClick(e)}
      tabIndex="-1"
      aria-label="Cerrar modal"
      role="button"
    >
      <dialog
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: 'none',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          margin: '0',
          padding: '0',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        }}
        aria-labelledby="modal-title"
        aria-modal="true"
        open={isOpen}
      >
        {/* Botón de cerrar */}
        <button
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
          onClick={handleClose}
          aria-label="Cerrar vista detallada"
        >
          ✕
        </button>

        {/* Imagen principal */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: imageZoomed ? '70vh' : '250px',
            backgroundColor: '#f5f5f5',
            overflow: 'hidden',
            cursor: seed.imageUrl && !imageError ? 'zoom-in' : 'default',
            transition: 'height 0.3s ease',
          }}
          onClick={handleImageClick}
        >
          {!imageError && seed.imageUrl ? (
            <img
              src={seed.imageUrl}
              alt={`Imagen de ${seed.name}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: imageZoomed ? 'contain' : 'cover',
                transition: 'object-fit 0.3s ease',
              }}
              onError={handleImageError}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666',
              }}
            >
              <span style={{ fontSize: '48px', marginBottom: '8px' }}>🌱</span>
              <span>Imagen no disponible</span>
            </div>
          )}

          {/* Indicador de zoom */}
          {seed.imageUrl && !imageError && (
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              {imageZoomed ? '🔍 Click para reducir' : '🔍 Click para ampliar'}
            </div>
          )}
        </div>

        {/* Contenido del modal */}
        <div style={{ padding: '24px' }}>
          {/* Título y variedad */}
          <div style={{ marginBottom: '16px' }}>
            <h2
              id="modal-title"
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2e7d32',
                margin: '0 0 4px 0',
              }}
            >
              {seed.name}
            </h2>
            {seed.variety && (
              <p
                style={{
                  fontSize: '16px',
                  color: '#666',
                  fontStyle: 'italic',
                  margin: '0',
                }}
              >
                Variedad: {seed.variety}
              </p>
            )}
          </div>

          {/* Descripción */}
          {seed.description && (
            <div style={{ marginBottom: '20px' }}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#333',
                  margin: '0 0 8px 0',
                }}
              >
                Descripción
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#555',
                  margin: '0',
                }}
              >
                {seed.description}
              </p>
            </div>
          )}

          {/* Información básica */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Categoría */}
            <div>
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  margin: '0 0 4px 0',
                }}
              >
                📂 Categoría
              </h4>
              <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>
                {categoryName}
              </p>
            </div>

            {/* Ubicación */}
            <div>
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  margin: '0 0 4px 0',
                }}
              >
                📍 Ubicación
              </h4>
              <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>
                {seed.location || 'No especificada'}
              </p>
            </div>

            {/* Fecha */}
            <div>
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  margin: '0 0 4px 0',
                }}
              >
                📅 Registrado
              </h4>
              <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>
                {formatDate(seed.createdAt)}
              </p>
            </div>
          </div>

          {/* Información del propietario */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                margin: '0 0 8px 0',
              }}
            >
              👤 Propietario
            </h3>
            <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>
              <strong>Nombre:</strong> {seed.ownerName}
            </p>
            <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0 0' }}>
              <strong>Ubicación:</strong> {seed.location || 'No especificada'}
            </p>
          </div>

          {/* Disponibilidad e intercambio */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: seed.isAvailableForExchange
                    ? '#4caf50'
                    : '#f44336',
                }}
              >
                {seed.isAvailableForExchange
                  ? '✓ Disponible para intercambio'
                  : '✗ No disponible'}
              </span>
            </div>

            {seed.exchangeNotes && (
              <div>
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                    margin: '0 0 4px 0',
                  }}
                >
                  📝 Notas de intercambio
                </h4>
                <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>
                  {seed.exchangeNotes}
                </p>
              </div>
            )}
          </div>

          {/* Botón de solicitar intercambio */}
          {seed.isAvailableForExchange && onRequestExchange && (
            <div style={{ textAlign: 'center' }}>
              <button
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => onRequestExchange(seed)}
                onMouseOver={e => {
                  e.target.style.backgroundColor = '#45a049'
                }}
                onMouseOut={e => {
                  e.target.style.backgroundColor = '#4caf50'
                }}
              >
                💬 Solicitar intercambio
              </button>
            </div>
          )}
        </div>
      </dialog>
    </div>
  )
}

SeedDetailModal.propTypes = {
  seed: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    variety: PropTypes.string,
    category: PropTypes.string.isRequired,
    description: PropTypes.string,
    location: PropTypes.string,
    imageUrl: PropTypes.string,
    ownerName: PropTypes.string.isRequired,
    isAvailableForExchange: PropTypes.bool.isRequired,
    exchangeNotes: PropTypes.string,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRequestExchange: PropTypes.func,
}

export default SeedDetailModal
