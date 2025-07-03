// src/pages/ExchangesPage.jsx
// Página de gestión de intercambios de semillas

import { useState } from 'react'

function ExchangesPage() {
  const [activeTab, setActiveTab] = useState('received')

  return (
    <div style={styles.container} className="page-transition gpu-accelerated">
      {/* Header de la página */}
      <div style={styles.header}>
        <h1 style={styles.title}>🔄 Intercambios</h1>
        <p style={styles.subtitle}>
          Gestiona tus solicitudes de intercambio de semillas
        </p>
      </div>

      {/* Navegación por pestañas */}
      <div style={styles.tabNavigation}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            ...styles.tab,
            ...(activeTab === 'received' ? styles.tabActive : {}),
          }}
        >
          📥 Recibidas (0)
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          style={{
            ...styles.tab,
            ...(activeTab === 'sent' ? styles.tabActive : {}),
          }}
        >
          📤 Enviadas (0)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            ...styles.tab,
            ...(activeTab === 'history' ? styles.tabActive : {}),
          }}
        >
          📚 Historial (0)
        </button>
      </div>

      {/* Contenido de pestañas */}
      <div style={styles.tabContent}>
        {activeTab === 'received' && (
          <div style={styles.tabPanel}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Solicitudes Recibidas</h2>
              <span style={styles.statusBadge}>0 pendientes</span>
            </div>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📥</div>
              <h3 style={styles.emptyTitle}>No tienes solicitudes</h3>
              <p style={styles.emptyText}>
                Cuando otros usuarios quieran intercambiar contigo, las
                solicitudes aparecerán aquí
              </p>
            </div>
          </div>
        )}

        {activeTab === 'sent' && (
          <div style={styles.tabPanel}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Solicitudes Enviadas</h2>
              <span style={styles.statusBadge}>0 activas</span>
            </div>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📤</div>
              <h3 style={styles.emptyTitle}>No has enviado solicitudes</h3>
              <p style={styles.emptyText}>
                Explora el catálogo de semillas y propón intercambios con otros
                agricultores
              </p>
              <div style={styles.emptyActions}>
                <button style={styles.primaryButton}>
                  🌱 Explorar Catálogo
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={styles.tabPanel}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Historial de Intercambios</h2>
              <span style={styles.statusBadge}>0 completados</span>
            </div>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📚</div>
              <h3 style={styles.emptyTitle}>Sin intercambios realizados</h3>
              <p style={styles.emptyText}>
                Tus intercambios completados se mostrarán aquí con detalles y
                calificaciones
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div style={styles.statsSection}>
        <h2 style={styles.sectionTitle}>📊 Mis Estadísticas</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>0</div>
            <div style={styles.statLabel}>Intercambios Exitosos</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>0</div>
            <div style={styles.statLabel}>Calificación Promedio</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>0</div>
            <div style={styles.statLabel}>Conexiones Activas</div>
          </div>
        </div>
      </div>

      {/* Información sobre intercambios */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>🤝 ¿Cómo funciona el intercambio?</h3>
          <div style={styles.stepsList}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepText}>
                Encuentra semillas que te interesen en el catálogo
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepText}>
                Envía una solicitud proponiendo qué semillas ofrecer a cambio
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepText}>
                Negocia los detalles del intercambio a través del chat
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>4</div>
              <div style={styles.stepText}>
                Confirma el intercambio y coordina la entrega
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Estilos mobile-first
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
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
  tabNavigation: {
    display: 'flex',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '4px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'auto',
  },
  tab: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    minWidth: 'fit-content',
  },
  tabActive: {
    backgroundColor: '#1976d2',
    color: 'white',
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '300px',
  },
  tabPanel: {
    width: '100%',
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
  statusBadge: {
    backgroundColor: '#f5f5f5',
    color: '#666',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
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
  statsSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  statCard: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: '20px',
  },
  infoCard: {
    backgroundColor: '#fff3e0',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #ffcc02',
  },
  infoTitle: {
    color: '#f57c00',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  },
  stepNumber: {
    backgroundColor: '#f57c00',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
    marginTop: '2px',
  },
  stepText: {
    color: '#e65100',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    flex: 1,
  },
}

export default ExchangesPage
