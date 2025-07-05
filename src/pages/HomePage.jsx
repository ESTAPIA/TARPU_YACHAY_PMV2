// src/pages/HomePage.jsx
// Página principal - Dashboard del usuario
// Responsive Mobile-First Design

import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import Header from '../components/ui/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import './HomePage.css'

function HomePage() {
  const { user } = useAuth()

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
            <div className="stat-number">0</div>
            <div className="stat-label">Semillas Registradas</div>
          </div>
        </Card>

        <Card variant="info" padding="medium" hover>
          <div className="stat-content">
            <div className="stat-icon">🔄</div>
            <div className="stat-number">0</div>
            <div className="stat-label">Intercambios Activos</div>
          </div>
        </Card>

        <Card variant="primary" padding="medium" hover>
          <div className="stat-content">
            <div className="stat-icon">👥</div>
            <div className="stat-number">0</div>
            <div className="stat-label">Conexiones</div>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2 className="section-title">🚀 Acciones Rápidas</h2>
        <div className="action-grid">
          <Link to="/seeds/add" style={{ textDecoration: 'none' }}>
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
    </div>
  )
}
export default HomePage
