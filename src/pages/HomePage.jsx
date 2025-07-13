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
import { useTranslation } from '../i18n/useTranslation'
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa'

function HomePage() {
  const { user } = useAuth()
  const { t } = useTranslation()

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
        title={t('home.title')}
        subtitle={t('home.subtitle', {
          name: user?.email?.split('@')[0] || t('home.user'),
        })}
        icon="🏠"
        variant="primary"
        showLanguageSwitch={true}
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
            <div className="stat-label">{t('home.stats.seedsRegistered')}</div>
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
            <div className="stat-label">{t('home.stats.exchangesPending')}</div>
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
            <div className="stat-label">
              {t('home.stats.exchangesCompleted')}
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <Button onClick={handleRetryStats} size="small" variant="secondary">
            {t('home.retry')}
          </Button>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2 className="section-title">🚀 {t('home.quickActions.title')}</h2>
        <div className="action-grid">
          <Link to="/add-seed" style={{ textDecoration: 'none' }}>
            <Card clickable padding="medium" hover>
              <div className="action-content">
                <div className="action-icon">➕</div>
                <h3 className="action-title">
                  {t('home.quickActions.addSeed.title')}
                </h3>
                <p className="action-text">
                  {t('home.quickActions.addSeed.text')}
                </p>
                <Button
                  variant="primary"
                  size="small"
                  icon="→"
                  iconPosition="right"
                >
                  {t('home.quickActions.addSeed.button')}
                </Button>
              </div>
            </Card>
          </Link>

          <Link to="/catalog" style={{ textDecoration: 'none' }}>
            <Card clickable padding="medium" hover>
              <div className="action-content">
                <div className="action-icon">🔍</div>
                <h3 className="action-title">
                  {t('home.quickActions.catalog.title')}
                </h3>
                <p className="action-text">
                  {t('home.quickActions.catalog.text')}
                </p>
                <Button
                  variant="secondary"
                  size="small"
                  icon="🔍"
                  iconPosition="left"
                >
                  {t('home.quickActions.catalog.button')}
                </Button>
              </div>
            </Card>
          </Link>
        </div>
      </div>
      {/* Actividad reciente */}
      <div className="recent-activity">
        <h2 className="section-title">📝 {t('home.recentActivity.title')}</h2>
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p className="empty-text">{t('home.recentActivity.empty')}</p>
          <p className="empty-subtext">{t('home.recentActivity.subtext')}</p>
        </div>
      </div>

      {/* Sección Acerca de Nosotros */}
      <div className="about-section">
        <Card variant="secondary" padding="medium">
          <h2 className="about-title">📍 {t('home.about.title')}</h2>

          <p className="about-description">
            <strong>Tarpu Yachay</strong> {t('home.about.description')}
          </p>

          <div
            className={`collapsible-content ${aboutExpanded ? 'expanded' : ''}`}
          >
            <p>{t('home.about.collapsible.project')}</p>

            <h3>🎯 {t('home.about.collapsible.purposeTitle')}</h3>
            <p>{t('home.about.collapsible.purpose')}</p>

            <h3>🙏 {t('home.about.collapsible.thanksTitle')}</h3>
            <p>{t('home.about.collapsible.thanks')}</p>
            <p>{t('home.about.collapsible.gad')}</p>

            <h3>👥 {t('home.about.collapsible.teamTitle')}</h3>
            <div className="team-grid">
              <div className="team-member">
                <strong>Raul Amaguaña</strong>
                <span>{t('home.about.collapsible.team.raul')}</span>
              </div>
              <div className="team-member">
                <strong>Danny Balseca</strong>
                <span>{t('home.about.collapsible.team.danny')}</span>
              </div>
              <div className="team-member">
                <strong>Carlos Saavedra</strong>
                <span>{t('home.about.collapsible.team.carlos')}</span>
              </div>
              <div className="team-member">
                <strong>Anthony Sosa</strong>
                <span>{t('home.about.collapsible.team.anthony')}</span>
              </div>
              <div className="team-member">
                <strong>Saul Tapia</strong>
                <span>{t('home.about.collapsible.team.saul')}</span>
              </div>
            </div>

            <div className="professor">
              <strong>{t('home.about.collapsible.professorLabel')}</strong> Ing.
              Francisco Rodríguez Clavijo
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
                <small>{t('home.about.collapsible.puce')}</small>
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
                <strong>{t('home.about.collapsible.innovation')}</strong>
                <small>{t('home.about.collapsible.aps')}</small>
              </div>
            </div>
          </div>

          <button className="read-more-btn" onClick={toggleAboutSection}>
            {aboutExpanded
              ? t('home.about.readLess')
              : t('home.about.readMore')}
          </button>
        </Card>
      </div>

      {/* Sección Nuestras redes sociales */}
      <div className="social-media-section">
        <Card variant="primary" padding="medium">
          <h2 className="social-media-title">
            📱 {t('home.socialMedia.title')}
          </h2>

          <p className="social-media-description">
            {t('home.socialMedia.subtitle')}
          </p>

          <div className="social-media-links">
            <a
              href="https://www.instagram.com/tarpu_yachay/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-media-link instagram-link"
            >
              <div className="social-icon">
                <FaInstagram size={24} />
              </div>
              <div className="social-content">
                <h3 className="social-platform">Instagram</h3>
                <p className="social-text">{t('home.socialMedia.instagram')}</p>
              </div>
              <Button
                variant="secondary"
                size="small"
                icon="→"
                iconPosition="right"
              >
                {t('home.socialMedia.follow')}
              </Button>
            </a>

            <a
              href="https://www.tiktok.com/@tarpuyachay"
              target="_blank"
              rel="noopener noreferrer"
              className="social-media-link tiktok-link"
            >
              <div className="social-icon">
                <FaTiktok size={24} />
              </div>
              <div className="social-content">
                <h3 className="social-platform">TikTok</h3>
                <p className="social-text">{t('home.socialMedia.tiktok')}</p>
              </div>
              <Button
                variant="secondary"
                size="small"
                icon="→"
                iconPosition="right"
              >
                {t('home.socialMedia.follow')}
              </Button>
            </a>

            <a
              href="https://www.facebook.com/people/Tarpu-Yachay/pfbid0qTZKjkrqTUG1JKMnq8nwfqQEcfdPYpDbNHgFRV8c5kY5jMUVFmMxUFkKoRQ7rBaql/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-media-link facebook-link"
            >
              <div className="social-icon">
                <FaFacebook size={24} />
              </div>
              <div className="social-content">
                <h3 className="social-platform">Facebook</h3>
                <p className="social-text">{t('home.socialMedia.facebook')}</p>
              </div>
              <Button
                variant="secondary"
                size="small"
                icon="→"
                iconPosition="right"
              >
                {t('home.socialMedia.follow')}
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
export default HomePage
