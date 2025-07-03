// src/components/catalog/SeedCard.jsx
// BLOQUE 6 - PASO 3: Componente para mostrar tarjetas de semillas en el catálogo
//
// Características:
// - Muestra información esencial de cada semilla (imagen, nombre, categoría, ubicación, disponibilidad)
// - Diseño responsive optimizado para móviles y desktop
// - Indicadores visuales claros del estado de disponibilidad
// - Acción onClick para ver detalles de la semilla
// - Manejo de errores en carga de imágenes
// - Accesibilidad con ARIA labels y navegación por teclado

import { useState } from 'react'
import PropTypes from 'prop-types'
import { getCategoryDisplayName } from '../../data/seedCategories'
import './SeedCard.css'

/**
 * @typedef {Object} SeedData
 * @property {string} id - ID único de la semilla
 * @property {string} name - Nombre de la semilla
 * @property {string} variety - Variedad específica
 * @property {string} category - Categoría de la semilla
 * @property {string} location - Ubicación del propietario
 * @property {string} imageUrl - URL de la imagen
 * @property {string} ownerName - Nombre del propietario
 * @property {boolean} isAvailableForExchange - Disponibilidad para intercambio
 * @property {Date} createdAt - Fecha de creación
 */

/**
 * @typedef {Object} SeedCardProps
 * @property {SeedData} seed - Datos de la semilla
 * @property {function} onClick - Callback cuando se hace clic en la tarjeta
 * @property {boolean} loading - Estado de carga para efectos visuales
 */

function SeedCard({ seed, onClick, loading = false }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Manejar error en carga de imagen
  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  // Manejar carga exitosa de imagen
  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Manejar click en la tarjeta
  const handleCardClick = () => {
    if (!loading) {
      onClick?.(seed)
    }
  }

  // Manejar navegación por teclado
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }

  // Obtener nombre de categoría legible
  const categoryDisplayName = getCategoryDisplayName(seed.category)

  // Formato de fecha
  const formatDate = date => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(date))
    } catch {
      return 'Fecha no disponible'
    }
  }

  return (
    <button
      className={`seed-card ${loading ? 'seed-card--loading' : ''} ${
        !seed.isAvailableForExchange ? 'seed-card--unavailable' : ''
      }`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Ver detalles de ${seed.name}, ${categoryDisplayName}`}
      disabled={loading}
    >
      {/* Imagen de la semilla */}
      <div className="seed-card__image-container">
        {!imageError ? (
          <img
            src={seed.imageUrl || null}
            alt={`Imagen de ${seed.name}`}
            className={`seed-card__image ${
              imageLoading ? 'seed-card__image--loading' : ''
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <div className="seed-card__image-fallback">
            <span className="seed-card__image-icon">🌱</span>
            <span className="seed-card__image-text">Imagen no disponible</span>
          </div>
        )}

        {/* Badge de disponibilidad */}
        <div
          className={`seed-card__availability-badge ${
            seed.isAvailableForExchange
              ? 'seed-card__availability-badge--available'
              : 'seed-card__availability-badge--unavailable'
          }`}
        >
          {seed.isAvailableForExchange ? '✓ Disponible' : '✗ No disponible'}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="seed-card__content">
        {/* Título y variedad */}
        <div className="seed-card__header">
          <h3 className="seed-card__title">{seed.name}</h3>
          {seed.variety && (
            <span className="seed-card__variety">({seed.variety})</span>
          )}
        </div>

        {/* Categoría */}
        <div className="seed-card__category">
          <span className="seed-card__category-label">📂</span>
          <span className="seed-card__category-name">
            {categoryDisplayName}
          </span>
        </div>

        {/* Ubicación y propietario */}
        <div className="seed-card__location">
          <span className="seed-card__location-icon">📍</span>
          <span className="seed-card__location-text">
            {seed.location || 'Ubicación no especificada'}
          </span>
        </div>

        {/* Información del propietario */}
        <div className="seed-card__owner">
          <span className="seed-card__owner-icon">👤</span>
          <span className="seed-card__owner-name">{seed.ownerName}</span>
        </div>

        {/* Fecha de publicación */}
        <div className="seed-card__date">
          <span className="seed-card__date-icon">📅</span>
          <span className="seed-card__date-text">
            {formatDate(seed.createdAt)}
          </span>
        </div>
      </div>

      {/* Indicador de clic */}
      <div className="seed-card__click-indicator">
        <span>👁️ Ver detalles</span>
      </div>
    </button>
  )
}

SeedCard.propTypes = {
  seed: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    variety: PropTypes.string,
    category: PropTypes.string.isRequired,
    location: PropTypes.string,
    imageUrl: PropTypes.string,
    ownerName: PropTypes.string.isRequired,
    isAvailableForExchange: PropTypes.bool.isRequired,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,
  }).isRequired,
  onClick: PropTypes.func,
  loading: PropTypes.bool,
}

export default SeedCard
