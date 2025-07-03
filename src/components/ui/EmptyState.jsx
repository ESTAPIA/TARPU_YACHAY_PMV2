// src/components/ui/EmptyState.jsx
// Componente para mostrar estados vacíos con feedback visual

import PropTypes from 'prop-types'

function EmptyState({
  icon = '📭',
  title = 'No hay elementos',
  message = 'No se encontraron elementos para mostrar.',
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`empty-state fade-in ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{message}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-primary btn-feedback"
          style={{ marginTop: 'var(--spacing-md)' }}
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
}

export default EmptyState
