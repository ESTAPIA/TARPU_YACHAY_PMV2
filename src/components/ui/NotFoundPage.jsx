// src/components/ui/NotFoundPage.jsx
// Componente para página 404 con soporte para usuarios autenticados y no autenticados

import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

function NotFoundPage({ isAuthenticated = false }) {
  const navigate = useNavigate()

  if (isAuthenticated) {
    return (
      <div className="not-found-container">
        <h2 className="not-found-title">404 - Página no encontrada</h2>
        <p className="not-found-text">
          La página que buscas no existe en Tarpu Yachay.
        </p>
        <div className="not-found-actions">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            ← Volver
          </button>
          <button onClick={() => navigate('/home')} className="btn-primary">
            🏠 Ir al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="not-found-container-guest">
      <h2>404 - Página no encontrada</h2>
      <p>La página que buscas no existe.</p>
      <button onClick={() => navigate('/login')} className="btn-primary">
        Ir al login
      </button>
    </div>
  )
}

NotFoundPage.propTypes = {
  isAuthenticated: PropTypes.bool,
}

export default NotFoundPage
