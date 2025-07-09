// src/pages/HomePage.jsx
// Página principal - Dashboard del usuario
// Responsive Mobile-First Design

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import Header from '../components/ui/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { calculateUserStats } from '../services/userProfileService'
import './HomePage.css'
import logoPuce from '../assets/logos/logo_puce.png'
import logoAPS from '../assets/logos/APS.png'

function HomePage() {
  const { user } = useAuth()

  // Estado para estadísticas dinámicas
  const [stats, setStats] = useState({
    seedsRegistered: 0,
    exchangesPending: 0,
    exchangesCompleted: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aboutExpanded, setAboutExpanded] = useState(false)

  // Cargar estadísticas cuando el componente se monta
  useEffect(() => {
    async function loadUserStats() {
      if (!user?.uid) return

      try {
        setLoading(true)
        setError(null)
        const result = await calculateUserStats(user.uid)

        if (result.success) {
          setStats(result.data)
        } else {
          console.error('Error cargando estadísticas:', result.message)
          setError(result.message)
        }
      } catch (err) {
        console.error('Error inesperado:', err)
        setError('No se pudieron cargar las estadísticas')
      } finally {
        setLoading(false)
      }
    }

    loadUserStats()
  }, [user?.uid])

  const handleRetryStats = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      setError(null)
      const result = await calculateUserStats(user.uid, true) // Force refresh

      if (result.success) {
        setStats(result.data)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Error inesperado:', error)
      setError('No se pudieron cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const toggleAboutSection = () => {
    setAboutExpanded(!aboutExpanded)
  }

  return (
    <div className="home-container page-transition gpu-accelerated">
      {/* Header de la página */}
      <Header
        title="Dashboard Principal"
        subtitle={`Bienvenido de nuevo, ${user?.email?.split('@')[0] || 'Usuario'}`}
        icon="🏠"
        variant="primary"
      />

      {/* Estadísticas rápidas */}
      <div className="stats-grid">
        <Card variant="success" padding="medium" hover>
          <div className="stat-content">
            <div className="stat-icon">🌱</div>
            {loading ? (
              <div className="loading-spinner">⏳</div>
            ) : (
              <div className="stat-number">{stats.seedsRegistered}</div>
            )}
            <div className="stat-label">Semillas Registradas</div>
          </div>
        </Card>

        <Card variant="info" padding="medium" hover>
          <div className="stat-content">
            <div className="stat-icon">🔄</div>
            {loading ? (
              <div className="loading-spinner">⏳</div>
            ) : (
              <div className="stat-number">{stats.exchangesPending}</div>
            )}
            <div className="stat-label">Intercambios Activos</div>
          </div>
        </Card>

        <Card variant="primary" padding="medium" hover>
          <div className="stat-content">
            <div className="stat-icon">👥</div>
            {loading ? (
              <div className="loading-spinner">⏳</div>
            ) : (
              <div className="stat-number">{stats.exchangesCompleted}</div>
            )}
            <div className="stat-label">Conexiones</div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <Button onClick={handleRetryStats} size="small" variant="secondary">
            Reintentar
          </Button>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2 className="section-title">🚀 Acciones Rápidas</h2>
        <div className="action-grid">
          <Link to="/add-seed" style={{ textDecoration: 'none' }}>
            <Card clickable padding="medium" hover>
              <div className="action-content">
                <div className="action-icon">➕</div>
                <h3 className="action-title">Registrar Semilla</h3>
                <p className="action-text">
                  Añade una nueva semilla a tu colección
                </p>
                <Button
                  variant="primary"
                  size="small"
                  icon="→"
                  iconPosition="right"
                >
                  Comenzar
                </Button>
              </div>
            </Card>
          </Link>

          <Link to="/catalog" style={{ textDecoration: 'none' }}>
            <Card clickable padding="medium" hover>
              <div className="action-content">
                <div className="action-icon">🔍</div>
                <h3 className="action-title">Explorar Catálogo</h3>
                <p className="action-text">
                  Busca semillas disponibles para intercambio
                </p>
                <Button
                  variant="secondary"
                  size="small"
                  icon="🔍"
                  iconPosition="left"
                >
                  Explorar
                </Button>
              </div>
            </Card>
          </Link>
        </div>
      </div>
      {/* Actividad reciente */}
      <div className="recent-activity">
        <h2 className="section-title">📝 Actividad Reciente</h2>
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p className="empty-text">No hay actividad reciente</p>
          <p className="empty-subtext">
            Tu actividad aparecerá aquí cuando comiences a usar la app
          </p>
        </div>
      </div>

      {/* Sección Acerca de Nosotros */}
      <div className="about-section">
        <Card variant="secondary" padding="medium">
          <h2 className="about-title">📍 Acerca de Tarpu Yachay</h2>

          <p className="about-description">
            <strong>Tarpu Yachay</strong> es una aplicación web progresiva (PWA)
            desarrollada por estudiantes de la carrera de Ingeniería en Sistemas
            de Información de la{' '}
            <strong>Pontificia Universidad Católica del Ecuador (PUCE)</strong>,
            sede Quito.
          </p>

          <div
            className={`collapsible-content ${aboutExpanded ? 'expanded' : ''}`}
          >
            <p>
              Este proyecto se enmarca en la asignatura{' '}
              <em>Emprendimiento Tecnológico con Enfoque Social</em>, guiado por
              el docente <strong>Ing. Francisco Rodríguez Clavijo</strong>. Fue
              desarrollado bajo la metodología de <em>Aprendizaje Servicio</em>,
              con el objetivo de aplicar la tecnología para responder a
              necesidades reales de comunidades rurales del Ecuador.
            </p>

            <h3>🎯 Propósito del Proyecto</h3>
            <p>
              Fortalecer el intercambio de semillas nativas en la comunidad de{' '}
              <strong>Chugchilán</strong>, promoviendo la soberanía alimentaria
              y la conservación de saberes ancestrales mediante el uso de una
              herramienta digital accesible, diseñada específicamente para
              contextos rurales.
            </p>

            <h3>🙏 Agradecimientos Especiales</h3>
            <p>
              Agradecemos profundamente a la comunidad de{' '}
              <strong>Chugchilán</strong> por su colaboración y participación
              activa en el proceso de validación y pruebas de la aplicación.
              retroalimentación ha sido invaluable para mejorar la funcionalidad
              funcionalidad y usabilidad de Tarpu Yachay.
            </p>
            <p>
              También agradecemos al{' '}
              <strong>GAD Parroquial de Chugchilán</strong> por su apertura y
              colaboración en territorio.
            </p>

            <h3>👥 Nuestro Equipo</h3>
            <div className="team-grid">
              <div className="team-member">
                <strong>Raul Amaguaña</strong>
                <span>Coordinación comunitaria y validación territorial</span>
              </div>
              <div className="team-member">
                <strong>Danny Balseca</strong>
                <span>Desarrollo frontend y soporte técnico</span>
              </div>
              <div className="team-member">
                <strong>Carlos Saavedra</strong>
                <span>Diseño visual, encuestas y documentación</span>
              </div>
              <div className="team-member">
                <strong>Anthony Sosa</strong>
                <span>Desarrollo funcional de la app y pruebas técnicas</span>
              </div>
              <div className="team-member">
                <strong>Saul Tapia</strong>
                <span>
                  Coordinación técnica general y despliegue de la aplicación
                </span>
              </div>
            </div>

            <div className="professor">
              <strong>Profesor guía:</strong> Ing. Francisco Rodríguez Clavijo
            </div>
          </div>

          <div className="logos-section">
            <div className="logo-block">
              <img
                src={logoPuce}
                alt="Logo PUCE"
                className="institution-logo"
                loading="lazy"
                onError={e => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="logo-text">
                <strong>PUCE</strong>
                <small>Pontificia Universidad Católica del Ecuador</small>
              </div>
            </div>
            <div className="logo-block">
              <img
                src={logoAPS}
                alt="Logo Innovación Social APS"
                className="institution-logo"
                loading="lazy"
                onError={e => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="logo-text">
                <strong>Innovación Social</strong>
                <small>Aprendizaje Servicio</small>
              </div>
            </div>
          </div>

          <button className="read-more-btn" onClick={toggleAboutSection}>
            {aboutExpanded ? 'Leer menos' : 'Leer más'}
          </button>
        </Card>
      </div>
    </div>
  )
}
export default HomePage
