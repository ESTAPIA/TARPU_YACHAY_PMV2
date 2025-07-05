// src/pages/CatalogPage.jsx
// Página del catálogo de semillas disponibles
// BLOQUE 6 - PASO 5: Integración completa con componentes y datos reales
// Mobile-first responsive design con CSS dedicado

import { useState, useEffect } from 'react'
import { SearchBar, SeedCard, SeedDetailModal } from '../components/catalog'
import { getPublicSeeds } from '../services/seedCatalogService'
import './CatalogPage.css'

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

  // Formatear contador de resultados
  const getResultsText = () => {
    if (loading) return '...'
    const count = seeds.length
    const suffix = count !== 1 ? 'resultados' : 'resultado'
    return `${count} ${suffix}`
  }

  return (
    <div className="catalog-page catalog-page-transition catalog-gpu-accelerated">
      {/* Header de la página */}
      <div className="catalog-header">
        <h1 className="catalog-title">🌱 Catálogo de Semillas</h1>
        <p className="catalog-subtitle">
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
      <div className="catalog-seeds-section">
        <div className="catalog-section-header">
          <h2 className="catalog-section-title">Semillas Disponibles</h2>
          <span className="catalog-results-count">{getResultsText()}</span>
        </div>

        {/* Estados de carga y error */}
        {loading && (
          <div className="catalog-loading-state">
            <div className="catalog-loading-spinner">⏳</div>
            <p className="catalog-loading-text">Cargando semillas...</p>
          </div>
        )}

        {error && (
          <div className="catalog-error-state">
            <div className="catalog-error-icon">⚠️</div>
            <h3 className="catalog-error-title">Error de conexión</h3>
            <p className="catalog-error-text">{error}</p>
            <button onClick={loadSeeds} className="catalog-retry-button">
              🔄 Intentar nuevamente
            </button>
          </div>
        )}

        {/* Grid de semillas */}
        {!loading && !error && seeds.length > 0 && (
          <div className="catalog-seeds-grid">
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
          <div className="catalog-load-more-section">
            <button
              onClick={loadMoreSeeds}
              disabled={loadingMore}
              className={`catalog-load-more-button ${loadingMore ? 'disabled' : ''}`}
            >
              {loadingMore ? '⏳ Cargando...' : '📄 Cargar más semillas'}
            </button>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && seeds.length === 0 && (
          <div className="catalog-empty-state">
            <div className="catalog-empty-icon">🌱</div>
            <h3 className="catalog-empty-title">
              {searchTerm || selectedCategory || showOnlyAvailable
                ? 'No se encontraron semillas'
                : 'No hay semillas registradas'}
            </h3>
            <p className="catalog-empty-text">
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
      <div className="catalog-info-section">
        <div className="catalog-info-card">
          <h3 className="catalog-info-title">💡 ¿Cómo funciona?</h3>
          <ul className="catalog-info-list">
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

export default CatalogPage
