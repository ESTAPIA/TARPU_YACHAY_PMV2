// src/pages/HomePage.jsx
// Página principal - Dashboard del usuario
// Actualizado para Paso 9: Transiciones y feedback visual

import { useAuth } from '../contexts/AuthContext'
import Header from '../components/ui/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

function HomePage() {
  const { user } = useAuth()

  return (
    <div style={styles.container} className="page-transition gpu-accelerated">
      {/* Header de la página */}
      <Header
        title="Dashboard Principal"
        subtitle={`Bienvenido de nuevo, ${user?.email?.split('@')[0] || 'Usuario'}`}
        icon="🏠"
        variant="primary"
      />

      {/* Estadísticas rápidas */}
      <div style={styles.statsGrid}>
        <Card variant="success" padding="medium" hover>
          <div style={styles.statContent}>
            <div style={styles.statIcon}>🌱</div>
            <div style={styles.statNumber}>0</div>
            <div style={styles.statLabel}>Semillas Registradas</div>
          </div>
        </Card>

        <Card variant="info" padding="medium" hover>
          <div style={styles.statContent}>
            <div style={styles.statIcon}>🔄</div>
            <div style={styles.statNumber}>0</div>
            <div style={styles.statLabel}>Intercambios Activos</div>
          </div>
        </Card>

        <Card variant="primary" padding="medium" hover>
          <div style={styles.statContent}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statNumber}>0</div>
            <div style={styles.statLabel}>Conexiones</div>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>🚀 Acciones Rápidas</h2>
        <div style={styles.actionGrid}>
          <Card clickable padding="medium" hover>
            <div style={styles.actionContent}>
              <div style={styles.actionIcon}>➕</div>
              <h3 style={styles.actionTitle}>Registrar Semilla</h3>
              <p style={styles.actionText}>
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

          <Card clickable padding="medium" hover>
            <div style={styles.actionContent}>
              <div style={styles.actionIcon}>🔍</div>
              <h3 style={styles.actionTitle}>Explorar Catálogo</h3>
              <p style={styles.actionText}>
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
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={styles.recentActivity}>
        <h2 style={styles.sectionTitle}>📝 Actividad Reciente</h2>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <p style={styles.emptyText}>No hay actividad reciente</p>
          <p style={styles.emptySubtext}>
            Tu actividad aparecerá aquí cuando comiences a usar la app
          </p>
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
    minHeight: 'calc(100vh - 140px)', // Altura mínima considerando header y nav
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1976d2',
    margin: '0 0 4px 0',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: '500',
  },
  quickActions: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#333',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    paddingLeft: '10px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '15px',
  },
  actionCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
  actionTitle: {
    color: '#1976d2',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  actionText: {
    color: '#666',
    fontSize: '0.9rem',
    margin: '0',
    lineHeight: 1.4,
  },
  recentActivity: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    opacity: 0.5,
  },
  emptyText: {
    color: '#666',
    fontSize: '1.1rem',
    fontWeight: '500',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    color: '#999',
    fontSize: '0.9rem',
    margin: '0',
  },
}

export default HomePage
