// src/components/exchanges/ExchangeFilters.jsx
// BLOQUE 7 - PASO 6: Componente ExchangeFilters
//
// Funcionalidades implementadas:
// - Filtros por estado de intercambio (all, pending, accepted, completed, rejected)
// - Contadores dinámicos por cada filtro basados en props.exchanges
// - Diseño tipo tabs horizontal responsive para mobile-first
// - Callback onFilterChange para comunicar cambio al componente padre
// - Estado interno para manejar filtro activo
// - Diseño consistente con el sistema de la aplicación

import { useState } from 'react'
import PropTypes from 'prop-types'
import './ExchangeFilters.css'

/**
 * Definición de filtros disponibles con sus labels y códigos
 */
const FILTER_TYPES = {
  all: {
    code: 'all',
    label: 'Todos',
    icon: '📋',
  },
  pending: {
    code: 'pending',
    label: 'Pendientes',
    icon: '⏳',
  },
  accepted: {
    code: 'accepted',
    label: 'Aceptados',
    icon: '✅',
  },
  completed: {
    code: 'completed',
    label: 'Completados',
    icon: '🎉',
  },
  rejected: {
    code: 'rejected',
    label: 'Rechazados',
    icon: '❌',
  },
}

/**
 * Componente de filtros para intercambios de semillas
 * Muestra tabs horizontales con contadores dinámicos por estado
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.exchanges - Array de intercambios para calcular contadores
 * @param {Function} props.onFilterChange - Callback que se ejecuta al cambiar filtro
 * @param {string} props.activeFilter - Filtro activo actual (opcional)
 * @returns {JSX.Element} Componente de filtros
 */
function ExchangeFilters({
  exchanges = [],
  onFilterChange,
  activeFilter = 'all',
}) {
  const [currentFilter, setCurrentFilter] = useState(activeFilter)

  /**
   * Calcula el contador de elementos para un tipo de filtro específico
   * @param {string} filterType - Tipo de filtro ('all', 'pending', etc.)
   * @returns {number} Cantidad de elementos que coinciden con el filtro
   */
  const getCountForFilter = filterType => {
    // Verificar que exchanges sea un array
    if (!Array.isArray(exchanges)) {
      return 0
    }

    if (filterType === 'all') {
      return exchanges.length
    }
    return exchanges.filter(exchange => exchange.status === filterType).length
  }

  /**
   * Maneja el cambio de filtro
   * Actualiza estado interno y notifica al componente padre
   * @param {string} filterType - Nuevo tipo de filtro seleccionado
   */
  const handleFilterChange = filterType => {
    setCurrentFilter(filterType)
    if (onFilterChange) {
      onFilterChange(filterType)
    }
  }

  return (
    <div className="exchange-filters">
      <div className="exchange-filters__container">
        {Object.values(FILTER_TYPES).map(filter => {
          const count = getCountForFilter(filter.code)
          const isActive = currentFilter === filter.code

          return (
            <button
              key={filter.code}
              className={`exchange-filters__tab ${
                isActive ? 'exchange-filters__tab--active' : ''
              }`}
              onClick={() => handleFilterChange(filter.code)}
              type="button"
              aria-pressed={isActive}
              aria-label={`Filtrar por ${filter.label}, ${count} intercambios`}
            >
              <span className="exchange-filters__icon" aria-hidden="true">
                {filter.icon}
              </span>
              <span className="exchange-filters__label">{filter.label}</span>
              <span
                className="exchange-filters__count"
                aria-label={`${count} intercambios`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

ExchangeFilters.propTypes = {
  exchanges: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['pending', 'accepted', 'rejected', 'completed'])
        .isRequired,
    })
  ).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  activeFilter: PropTypes.oneOf([
    'all',
    'pending',
    'accepted',
    'rejected',
    'completed',
  ]),
}

export default ExchangeFilters
