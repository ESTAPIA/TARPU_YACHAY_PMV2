// src/components/catalog/SearchBarExample.jsx
// BLOQUE 6 - PASO 2: Ejemplo de integración del componente SearchBar
//
// Este archivo demuestra cómo usar el componente SearchBar
// y puede ser usado para testing manual antes de integrar
// en la página principal del catálogo

import { useState } from 'react'
import SearchBar from './SearchBar'

function SearchBarExample() {
  // Estados para manejar los filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Simular búsqueda con loading
  const simulateSearch = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  // Handlers para los callbacks del SearchBar
  const handleSearch = term => {
    console.log('🔍 Búsqueda:', term)
    setSearchTerm(term)
    if (term.length > 0) {
      simulateSearch()
    }
  }

  const handleCategoryFilter = category => {
    console.log('📂 Categoría:', category)
    setSelectedCategory(category)
    if (category) {
      simulateSearch()
    }
  }

  const handleAvailabilityFilter = availableOnly => {
    console.log('🔄 Solo disponibles:', availableOnly)
    setShowOnlyAvailable(availableOnly)
    if (availableOnly) {
      simulateSearch()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🧪 Prueba del SearchBar</h1>
        <p style={styles.subtitle}>
          Componente de búsqueda y filtros para el catálogo de semillas
        </p>
      </div>

      {/* Componente SearchBar */}
      <SearchBar
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        onAvailabilityFilter={handleAvailabilityFilter}
        loading={isLoading}
      />

      {/* Información de estado actual */}
      <div style={styles.debugPanel}>
        <h3 style={styles.debugTitle}>📊 Estado Actual</h3>
        <div style={styles.debugContent}>
          <div style={styles.debugItem}>
            <strong>Término de búsqueda:</strong>
            <span style={styles.debugValue}>{searchTerm || '(vacío)'}</span>
          </div>
          <div style={styles.debugItem}>
            <strong>Categoría seleccionada:</strong>
            <span style={styles.debugValue}>
              {selectedCategory || '(ninguna)'}
            </span>
          </div>
          <div style={styles.debugItem}>
            <strong>Solo disponibles:</strong>
            <span style={styles.debugValue}>
              {showOnlyAvailable ? 'Sí' : 'No'}
            </span>
          </div>
          <div style={styles.debugItem}>
            <strong>Estado de carga:</strong>
            <span style={styles.debugValue}>
              {isLoading ? 'Cargando...' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Resultados simulados */}
      <div style={styles.resultsPanel}>
        <h3 style={styles.resultsTitle}>📋 Resultados Simulados</h3>
        {isLoading ? (
          <div style={styles.loadingMessage}>
            <span style={styles.spinner}>⏳</span>
            Buscando semillas...
          </div>
        ) : (
          <div style={styles.resultsContent}>
            {searchTerm || selectedCategory || showOnlyAvailable ? (
              <div style={styles.mockResults}>
                <div style={styles.mockSeed}>
                  🌽 Maíz Criollo Amarillo
                  <span style={styles.mockCategory}>(Cereales)</span>
                </div>
                <div style={styles.mockSeed}>
                  🍅 Tomate Cherry
                  <span style={styles.mockCategory}>(Hortalizas)</span>
                </div>
                <div style={styles.mockSeed}>
                  🫘 Fréjol Negro
                  <span style={styles.mockCategory}>(Legumbres)</span>
                </div>
              </div>
            ) : (
              <div style={styles.emptyMessage}>
                💡 Usa los filtros arriba para buscar semillas
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instrucciones de uso */}
      <div style={styles.instructionsPanel}>
        <h3 style={styles.instructionsTitle}>📖 Instrucciones</h3>
        <ul style={styles.instructionsList}>
          <li>Escribe en el campo de búsqueda para buscar por nombre</li>
          <li>Selecciona una categoría del dropdown</li>
          <li>Activa el toggle para mostrar solo disponibles</li>
          <li>Observa el estado en tiempo real en el panel de debug</li>
          <li>Los cambios se reflejan automáticamente con debounce</li>
        </ul>
      </div>
    </div>
  )
}

// Estilos para el ejemplo
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },

  title: {
    fontSize: '28px',
    color: '#2c5530',
    marginBottom: '8px',
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },

  debugPanel: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },

  debugTitle: {
    fontSize: '18px',
    color: '#495057',
    marginBottom: '12px',
    marginTop: 0,
  },

  debugContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  debugItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
  },

  debugValue: {
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '14px',
  },

  resultsPanel: {
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px',
  },

  resultsTitle: {
    fontSize: '18px',
    color: '#495057',
    marginBottom: '12px',
    marginTop: 0,
  },

  resultsContent: {
    minHeight: '100px',
  },

  loadingMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#6c757d',
    fontSize: '16px',
    padding: '20px',
  },

  spinner: {
    fontSize: '18px',
    animation: 'spin 1s linear infinite',
  },

  mockResults: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  mockSeed: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  },

  mockCategory: {
    fontSize: '12px',
    color: '#6c757d',
    fontStyle: 'italic',
  },

  emptyMessage: {
    textAlign: 'center',
    color: '#6c757d',
    padding: '40px 20px',
    fontSize: '16px',
  },

  instructionsPanel: {
    backgroundColor: '#e7f3ff',
    border: '1px solid #b3d9ff',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px',
  },

  instructionsTitle: {
    fontSize: '18px',
    color: '#0066cc',
    marginBottom: '12px',
    marginTop: 0,
  },

  instructionsList: {
    color: '#0066cc',
    paddingLeft: '20px',
    margin: 0,
  },
}

export default SearchBarExample
