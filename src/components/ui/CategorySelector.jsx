// src/components/ui/CategorySelector.jsx
// BLOQUE 5 - PASO 3: Selector de categorías con búsqueda y filtro
//
// Componente que permite seleccionar una categoría de semilla con:
// - Dropdown con todas las categorías predefinidas
// - Campo de búsqueda/filtro por nombre, ejemplos y keywords
// - Vista de categorías con iconos y descripciones
// - Integración con sistema de validación del formulario

import { useState, useEffect, useRef } from 'react'
import {
  seedCategories,
  filterCategories,
  getCategoryById,
} from '../../data/seedCategories'

/**
 * @typedef {Object} CategorySelectorProps
 * @property {string} value - Valor seleccionado (ID de categoría)
 * @property {function} onChange - Callback cuando cambia la selección
 * @property {function} onBlur - Callback cuando pierde el foco
 * @property {Object} style - Estilos adicionales para el contenedor
 * @property {string} className - Clase CSS adicional
 * @property {boolean} required - Si el campo es obligatorio
 * @property {string} placeholder - Texto placeholder
 */

function CategorySelector({
  value = '',
  onChange,
  onBlur,
  style = {},
  className = '',
  required = false,
  placeholder = 'Buscar y seleccionar categoría...',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filteredCategories, setFilteredCategories] = useState(seedCategories)
  const [displayText, setDisplayText] = useState('')

  const containerRef = useRef(null)
  const searchRef = useRef(null)

  // Actualizar texto mostrado cuando cambia el valor
  useEffect(() => {
    if (value) {
      const category = getCategoryById(value)
      setDisplayText(category ? `${category.icon} ${category.name}` : '')
    } else {
      setDisplayText('')
    }
  }, [value])

  // Filtrar categorías cuando cambia el texto de búsqueda
  useEffect(() => {
    const filtered = filterCategories(searchText)
    setFilteredCategories(filtered)
  }, [searchText])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    setSearchText('')
    setFilteredCategories(seedCategories)
    // Enfocar el campo de búsqueda después de un tick
    setTimeout(() => {
      if (searchRef.current) {
        searchRef.current.focus()
      }
    }, 10)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSearchText('')
    if (onBlur) {
      onBlur()
    }
  }

  const handleCategorySelect = categoryId => {
    onChange(categoryId)
    handleClose()
  }

  const handleSearchChange = e => {
    setSearchText(e.target.value)
  }

  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      handleClose()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Seleccionar la primera categoría filtrada si hay solo una
      if (filteredCategories.length === 1) {
        handleCategorySelect(filteredCategories[0].id)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, ...style }}
      className={className}
    >
      {/* Campo de selección principal */}
      <div
        style={styles.selector}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleOpen()}
      >
        <input
          type="text"
          value={displayText}
          placeholder={placeholder}
          readOnly
          style={styles.input}
          required={required}
        />
        <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown con búsqueda */}
      {isOpen && (
        <div style={styles.dropdown}>
          {/* Campo de búsqueda */}
          <div style={styles.searchContainer}>
            <input
              ref={searchRef}
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Buscar categoría..."
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>

          {/* Lista de categorías */}
          <div style={styles.categoryList}>
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <div
                  key={category.id}
                  style={{
                    ...styles.categoryItem,
                    ...(value === category.id
                      ? styles.categoryItemSelected
                      : {}),
                  }}
                  onClick={() => handleCategorySelect(category.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e =>
                    e.key === 'Enter' && handleCategorySelect(category.id)
                  }
                >
                  <div style={styles.categoryHeader}>
                    <span style={styles.categoryIcon}>{category.icon}</span>
                    <span style={styles.categoryName}>{category.name}</span>
                  </div>
                  <div style={styles.categoryDescription}>
                    {category.description}
                  </div>
                  <div style={styles.categoryExamples}>
                    {category.examples.slice(0, 3).join(', ')}
                    {category.examples.length > 3 && '...'}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noResults}>
                <span>❌ No se encontraron categorías</span>
                <small>Intenta con otros términos de búsqueda</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
  },

  selector: {
    position: 'relative',
    cursor: 'pointer',
  },

  input: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },

  arrow: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '12px',
    color: '#666',
    pointerEvents: 'none',
  },

  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '2px solid #ddd',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 1000,
    maxHeight: '400px',
    overflow: 'hidden',
  },

  searchContainer: {
    position: 'relative',
    padding: '8px',
    borderBottom: '1px solid #eee',
  },

  searchInput: {
    width: '100%',
    padding: '8px 32px 8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },

  searchIcon: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    color: '#666',
    pointerEvents: 'none',
  },

  categoryList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },

  categoryItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
  },

  categoryItemSelected: {
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #1976d2',
  },

  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
  },

  categoryIcon: {
    fontSize: '18px',
    marginRight: '8px',
  },

  categoryName: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#333',
  },

  categoryDescription: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '4px',
  },

  categoryExamples: {
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic',
  },

  noResults: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
}

// Agregar hover efectos programáticamente ya que :hover no funciona en objetos de estilo
const addHoverEffects = () => {
  const style = document.createElement('style')
  style.textContent = `
    .category-item:hover {
      background-color: #f8f9fa !important;
    }
    .category-item-selected:hover {
      background-color: #e3f2fd !important;
    }
  `
  document.head.appendChild(style)
}

// Ejecutar una vez al cargar el componente
if (typeof window !== 'undefined') {
  addHoverEffects()
}

export default CategorySelector
