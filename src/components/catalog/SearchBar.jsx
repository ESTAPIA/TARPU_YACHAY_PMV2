// src/components/catalog/SearchBar.jsx
// BLOQUE 6 - PASO 2: Componente de búsqueda y filtros para catálogo de semillas
//
// Proporciona interfaz de búsqueda con:
// - Input de búsqueda con debounce para optimizar rendimiento
// - Filtro por categorías usando seedCategories.js existente
// - Toggle para mostrar solo semillas disponibles para intercambio
// - Estados visuales claros para filtros activos
// - Función para limpiar todos los filtros

import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { getCategoriesForSelect } from '../../data/seedCategories'

/**
 * @typedef {Object} SearchFilters
 * @property {string} searchTerm - Término de búsqueda
 * @property {string} category - ID de categoría seleccionada
 * @property {boolean} availableOnly - Mostrar solo semillas disponibles
 */

/**
 * @typedef {Object} SearchBarProps
 * @property {function} onSearch - Callback cuando cambia el término de búsqueda
 * @property {function} onCategoryFilter - Callback cuando cambia el filtro de categoría
 * @property {function} onAvailabilityFilter - Callback cuando cambia el filtro de disponibilidad
 * @property {string} initialSearchTerm - Término de búsqueda inicial
 * @property {string} initialCategory - Categoría inicial seleccionada
 * @property {boolean} initialAvailableOnly - Estado inicial del filtro de disponibilidad
 * @property {boolean} loading - Estado de carga para deshabilitar controles
 */

function SearchBar({
  onSearch,
  onCategoryFilter,
  onAvailabilityFilter,
  initialSearchTerm = '',
  initialCategory = '',
  initialAvailableOnly = false,
  loading = false,
}) {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [showOnlyAvailable, setShowOnlyAvailable] =
    useState(initialAvailableOnly)

  // Referencia para el debounce
  const debounceRef = useRef(null)

  // Obtener categorías para el selector
  const categories = getCategoriesForSelect()

  // Debounce para la búsqueda de texto
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      onSearch?.(searchTerm)
    }, 300) // 300ms de debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm, onSearch])

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
  }

  // Manejar cambio en el selector de categoría
  const handleCategoryChange = e => {
    const category = e.target.value
    setSelectedCategory(category)
    onCategoryFilter?.(category)
  }

  // Manejar cambio en el toggle de disponibilidad
  const handleAvailabilityToggle = e => {
    const availableOnly = e.target.checked
    setShowOnlyAvailable(availableOnly)
    onAvailabilityFilter?.(availableOnly)
  }

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setShowOnlyAvailable(false)

    // Llamar callbacks inmediatamente para limpiar
    onSearch?.('')
    onCategoryFilter?.('')
    onAvailabilityFilter?.(false)
  }

  // Verificar si hay filtros activos
  const hasActiveFilters =
    searchTerm.length > 0 || selectedCategory !== '' || showOnlyAvailable

  return (
    <div style={styles.container}>
      {/* Input de búsqueda */}
      <div style={styles.searchContainer}>
        <div style={styles.searchInputWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre, variedad o descripción..."
            disabled={loading}
            style={{
              ...styles.searchInput,
              ...(loading ? styles.disabled : {}),
            }}
          />
          {searchTerm && !loading && (
            <button
              onClick={() => {
                setSearchTerm('')
                onSearch?.('')
              }}
              style={styles.clearSearchButton}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtersContainer}>
        {/* Selector de categoría */}
        <div style={styles.filterGroup}>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={loading}
            style={{
              ...styles.categorySelect,
              ...(loading ? styles.disabled : {}),
              ...(selectedCategory ? styles.filterActive : {}),
            }}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle de disponibilidad */}
        <div style={styles.filterGroup}>
          <label style={styles.availabilityLabel}>
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={handleAvailabilityToggle}
              disabled={loading}
              style={styles.checkbox}
            />
            <span
              style={{
                ...styles.checkboxLabel,
                ...(showOnlyAvailable ? styles.filterActive : {}),
                ...(loading ? styles.disabled : {}),
              }}
            >
              🔄 Solo disponibles para intercambio
            </span>
          </label>
        </div>
      </div>

      {/* Indicador de filtros activos y botón para limpiar */}
      {hasActiveFilters && (
        <div style={styles.activeFiltersContainer}>
          <div style={styles.activeFiltersInfo}>
            <span style={styles.activeFiltersIcon}>⚡</span>
            <span style={styles.activeFiltersText}>
              Filtros activos
              {searchTerm && ` • Búsqueda: "${searchTerm}"`}
              {selectedCategory &&
                ` • Categoría: ${categories.find(c => c.value === selectedCategory)?.label}`}
              {showOnlyAvailable && ` • Solo disponibles`}
            </span>
          </div>
          <button
            onClick={handleClearFilters}
            disabled={loading}
            style={{
              ...styles.clearAllButton,
              ...(loading ? styles.disabled : {}),
            }}
            aria-label="Limpiar todos los filtros"
          >
            🗑️ Limpiar filtros
          </button>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div style={styles.loadingIndicator}>
          <span style={styles.loadingSpinner}>⏳</span>
          <span style={styles.loadingText}>Buscando...</span>
        </div>
      )}
    </div>
  )
}

// Estilos del componente
const styles = {
  container: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },

  searchContainer: {
    marginBottom: '16px',
  },

  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '16px',
    color: '#666',
    zIndex: 1,
  },

  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 40px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  },

  clearSearchButton: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#999',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.2s ease',
  },

  filtersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  filterGroup: {
    display: 'flex',
    alignItems: 'center',
  },

  categorySelect: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  },

  availabilityLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '8px',
  },

  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },

  checkboxLabel: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },

  activeFiltersContainer: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f0f8ff',
    border: '1px solid #b3d9ff',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },

  activeFiltersInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
  },

  activeFiltersIcon: {
    fontSize: '16px',
  },

  activeFiltersText: {
    fontSize: '13px',
    color: '#0066cc',
    fontWeight: '500',
  },

  clearAllButton: {
    background: '#ff6b6b',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  },

  loadingIndicator: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },

  loadingSpinner: {
    fontSize: '14px',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic',
  },

  filterActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fff0',
    color: '#2e7d32',
    fontWeight: '600',
  },

  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: '#f5f5f5',
  },
}

// Responsive styles para dispositivos móviles
const mediaQueries = `
  @media (max-width: 768px) {
    .search-bar-container {
      padding: 12px;
    }
    
    .filters-container {
      gap: 8px;
    }
    
    .active-filters-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .clear-all-button {
      align-self: flex-end;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

// Inyectar estilos CSS para animaciones y responsive
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('search-bar-styles')
  if (!styleElement) {
    const style = document.createElement('style')
    style.id = 'search-bar-styles'
    style.textContent = mediaQueries
    document.head.appendChild(style)
  }
}

// PropTypes para validación de props
SearchBar.propTypes = {
  onSearch: PropTypes.func,
  onCategoryFilter: PropTypes.func,
  onAvailabilityFilter: PropTypes.func,
  initialSearchTerm: PropTypes.string,
  initialCategory: PropTypes.string,
  initialAvailableOnly: PropTypes.bool,
  loading: PropTypes.bool,
}

export default SearchBar
