// src/pages/CatalogPage.jsx
// Página del catálogo de semillas disponibles
// BLOQUE 6 - PASO 5: Integración completa con componentes y datos reales

import { useState, useEffect } from 'react'
import { SearchBar, SeedCard, SeedDetailModal } from '../components/catalog'
import { getPublicSeeds } from '../services/seedCatalogService'

function CatalogPage() {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  // Estados para datos y UI
  const [seeds, setSeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Estados para modal
  const [selectedSeed, setSelectedSeed] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Estado para paginación
  const [lastDocId, setLastDocId] = useState(null)

  // Cargar semillas al montar el componente
  useEffect(() => {
    loadSeeds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recargar semillas cuando cambien los filtros
  useEffect(() => {
    if (searchTerm !== '' || selectedCategory !== '' || showOnlyAvailable) {
      handleFilterChange()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, showOnlyAvailable])

  // Función para cargar semillas iniciales
  const loadSeeds = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        category: selectedCategory || 'all',
        showOnlyAvailable: showOnlyAvailable,
      }

      const result = await getPublicSeeds({
        filters,
        page: 1,
        pageSize: 12,
      })

      setSeeds(result.seeds || [])
      setHasMore(result.hasMore || false)
      setLastDocId(result.lastDocId || null)
    } catch (err) {
      console.error('Error cargando semillas:', err)
      setError('Error al cargar las semillas. Intenta nuevamente.')
      setSeeds([])
    } finally {
      setLoading(false)
    }
  }

  // Función para cargar más semillas (paginación)
  const loadMoreSeeds = async () => {
    if (!hasMore || loadingMore) return

    try {
      setLoadingMore(true)

      const filters = {
        category: selectedCategory || 'all',
        showOnlyAvailable: showOnlyAvailable,
      }

      const result = await getPublicSeeds({
        filters,
        page: 2,
        pageSize: 12,
        lastDocId,
      })

      setSeeds(prevSeeds => [...prevSeeds, ...(result.seeds || [])])
      setHasMore(result.hasMore || false)
      setLastDocId(result.lastDocId || null)
    } catch (err) {
      console.error('Error cargando más semillas:', err)
      setError('Error al cargar más semillas.')
    } finally {
      setLoadingMore(false)
    }
  }

  // Manejar cambios en filtros
  const handleFilterChange = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        category: selectedCategory || 'all',
        showOnlyAvailable: showOnlyAvailable,
      }

      // Si hay término de búsqueda, incluirlo en el filtro
      if (searchTerm.trim()) {
        filters.searchTerm = searchTerm.trim()
      }

      const result = await getPublicSeeds({
        filters,
        page: 1,
        pageSize: 12,
      })

      setSeeds(result.seeds || [])
      setHasMore(result.hasMore || false)
      setLastDocId(result.lastDocId || null)
    } catch (err) {
      console.error('Error aplicando filtros:', err)
      setError('Error al aplicar filtros.')
      setSeeds([])
    } finally {
      setLoading(false)
    }
  }

  // Manejar búsqueda
  const handleSearch = term => {
    setSearchTerm(term)
  }

  // Manejar filtro de categoría
  const handleCategoryFilter = category => {
    setSelectedCategory(category)
  }

  // Manejar filtro de disponibilidad
  const handleAvailabilityFilter = availableOnly => {
    setShowOnlyAvailable(availableOnly)
  }

  // Manejar click en tarjeta de semilla
  const handleSeedClick = seed => {
    setSelectedSeed(seed)
    setIsModalOpen(true)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSeed(null)
  }

  // Manejar solicitud de intercambio
  const handleRequestExchange = seed => {
    // Por ahora solo mostramos un mensaje (lógica de intercambio para pasos futuros)
    alert(
      `Solicitud de intercambio para ${seed.name} (funcionalidad en desarrollo)`
    )
  }

  // Agregar animación CSS para el spinner
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
  }

  return (
    <div style={styles.container} className="page-transition gpu-accelerated">
      {/* Header de la página */}
      <div style={styles.header}>
        <h1 style={styles.title}>🌱 Catálogo de Semillas</h1>
        <p style={styles.subtitle}>
          Explora las semillas disponibles para intercambio
        </p>
      </div>

      {/* Componente de búsqueda y filtros */}
      <SearchBar
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        onAvailabilityFilter={handleAvailabilityFilter}
        initialSearchTerm={searchTerm}
        initialCategory={selectedCategory}
        initialAvailableOnly={showOnlyAvailable}
        loading={loading}
      />

      {/* Lista de semillas */}
      <div style={styles.seedsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Semillas Disponibles</h2>
          <span style={styles.resultsCount}>
            {loading
              ? '...'
              : `${seeds.length} resultado${seeds.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Estados de carga y error */}
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p style={styles.loadingText}>Cargando semillas...</p>
          </div>
        )}

        {error && (
          <div style={styles.errorState}>
            <div style={styles.errorIcon}>⚠️</div>
            <h3 style={styles.errorTitle}>Error de conexión</h3>
            <p style={styles.errorText}>{error}</p>
            <button onClick={loadSeeds} style={styles.retryButton}>
              🔄 Intentar nuevamente
            </button>
          </div>
        )}

        {/* Grid de semillas */}
        {!loading && !error && seeds.length > 0 && (
          <div style={styles.seedsGrid}>
            {seeds.map(seed => (
              <SeedCard
                key={seed.id}
                seed={seed}
                onClick={handleSeedClick}
                loading={false}
              />
            ))}
          </div>
        )}

        {/* Botón cargar más */}
        {!loading && !error && seeds.length > 0 && hasMore && (
          <div style={styles.loadMoreSection}>
            <button
              onClick={loadMoreSeeds}
              disabled={loadingMore}
              style={{
                ...styles.loadMoreButton,
                ...(loadingMore ? styles.loadMoreButtonDisabled : {}),
              }}
            >
              {loadingMore ? '⏳ Cargando...' : '📄 Cargar más semillas'}
            </button>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && seeds.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🌱</div>
            <h3 style={styles.emptyTitle}>
              {searchTerm || selectedCategory || showOnlyAvailable
                ? 'No se encontraron semillas'
                : 'No hay semillas registradas'}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm || selectedCategory || showOnlyAvailable
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'Cuando otros usuarios registren sus semillas, aparecerán aquí'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <SeedDetailModal
        seed={selectedSeed}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRequestExchange={
          selectedSeed ? () => handleRequestExchange(selectedSeed) : undefined
        }
      />

      {/* Información adicional */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>💡 ¿Cómo funciona?</h3>
          <ul style={styles.infoList}>
            <li>Explora semillas disponibles de otros agricultores</li>
            <li>Usa los filtros para encontrar lo que necesitas</li>
            <li>Haz clic en las tarjetas para ver más detalles</li>
            <li>Contacta directamente para proponer intercambios</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Estilos mobile-first
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    minHeight: 'calc(100vh - 140px)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    color: '#1976d2',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem',
    margin: '0',
  },
  searchSection: {
    marginBottom: '20px',
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '400px',
    margin: '0 auto',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  clearButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#999',
    cursor: 'pointer',
    padding: '4px',
  },
  filtersSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  filtersTitle: {
    color: '#333',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    backgroundColor: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  seedsSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    color: '#333',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: '0',
  },
  resultsCount: {
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    opacity: 0.5,
  },
  emptyTitle: {
    color: '#333',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  emptyText: {
    color: '#666',
    fontSize: '1rem',
    margin: '0 0 25px 0',
    lineHeight: 1.5,
  },
  emptyActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  infoSection: {
    marginBottom: '20px',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #bbdefb',
  },
  infoTitle: {
    color: '#1976d2',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  infoList: {
    color: '#1565c0',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    margin: '0',
    paddingLeft: '20px',
  },
  // Grid de semillas
  seedsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  // Estados de carga
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  loadingSpinner: {
    fontSize: '48px',
    marginBottom: '16px',
    animation: 'spin 2s linear infinite',
  },
  loadingText: {
    color: '#666',
    fontSize: '1.1rem',
    margin: '0',
  },
  // Estados de error
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    border: '2px solid #ffebee',
    borderRadius: '8px',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorTitle: {
    color: '#d32f2f',
    fontSize: '1.3rem',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  errorText: {
    color: '#666',
    fontSize: '1rem',
    margin: '0 0 20px 0',
  },
  retryButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  // Botón cargar más
  loadMoreSection: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '30px',
    marginBottom: '30px',
  },
  loadMoreButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 28px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
  },
  loadMoreButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
}

export default CatalogPage
