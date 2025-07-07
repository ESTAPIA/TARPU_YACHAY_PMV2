// src/components/profile/DeleteSeedModal.jsx
// BLOQUE 8 - PASO 4.2: Modal de confirmación para eliminar semillas
// Componente para mostrar advertencias y confirmar eliminación de semillas

import React from 'react'
import PropTypes from 'prop-types'
import './DeleteSeedModal.css'

/**
 * Modal de confirmación para eliminar semillas con validaciones
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar eliminación
 * @param {Object} props.seed - Datos de la semilla a eliminar
 * @param {boolean} props.loading - Si está procesando la eliminación
 * @param {Object} props.validationError - Error de validación (intercambios activos)
 */
const DeleteSeedModal = ({
  isOpen,
  onClose,
  onConfirm,
  seed,
  loading = false,
  validationError = null,
}) => {
  if (!isOpen || !seed) return null

  const hasValidationError =
    validationError && validationError.error === 'ACTIVE_EXCHANGES'

  const handleConfirm = () => {
    if (!hasValidationError && !loading) {
      onConfirm()
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <div className="delete-seed-modal-overlay" onClick={handleClose}>
      <div className="delete-seed-modal" onClick={e => e.stopPropagation()}>
        <div className="delete-seed-modal-header">
          <h3>
            {hasValidationError
              ? '⚠️ No se puede eliminar'
              : '🗑️ Confirmar eliminación'}
          </h3>
          <button
            className="delete-seed-modal-close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="delete-seed-modal-content">
          <div className="seed-info">
            <div className="seed-image">
              {seed.imageUrl ? (
                <img src={seed.imageUrl} alt={seed.name} />
              ) : (
                <div className="seed-placeholder">🌱</div>
              )}
            </div>
            <div className="seed-details">
              <h4>{seed.name}</h4>
              {seed.variety && <p className="seed-variety">{seed.variety}</p>}
              <p className="seed-category">{seed.category}</p>
            </div>
          </div>

          {hasValidationError ? (
            <div className="validation-error">
              <div className="error-message">
                <p>{validationError.userMessage}</p>
              </div>

              {validationError.data?.counts && (
                <div className="exchange-details">
                  <h5>Intercambios activos:</h5>
                  <ul>
                    {validationError.data.counts.pending > 0 && (
                      <li>
                        {validationError.data.counts.pending} solicitud
                        {validationError.data.counts.pending > 1
                          ? 'es'
                          : ''}{' '}
                        pendiente
                        {validationError.data.counts.pending > 1 ? 's' : ''}
                      </li>
                    )}
                    {validationError.data.counts.accepted > 0 && (
                      <li>
                        {validationError.data.counts.accepted} intercambio
                        {validationError.data.counts.accepted > 1
                          ? 's'
                          : ''}{' '}
                        aceptado
                        {validationError.data.counts.accepted > 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="info-box">
                <p>
                  💡 <strong>¿Qué puedes hacer?</strong>
                </p>
                <ul>
                  <li>
                    Ve a la sección "Mis Intercambios" para gestionar las
                    solicitudes pendientes
                  </li>
                  <li>Completa o cancela los intercambios aceptados</li>
                  <li>Una vez finalizados, podrás eliminar la semilla</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="confirmation-message">
              <p>
                ¿Estás seguro de que quieres eliminar la semilla{' '}
                <strong>"{seed.name}"</strong>?
              </p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
          )}
        </div>

        <div className="delete-seed-modal-actions">
          {hasValidationError ? (
            <>
              <button
                className="btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Entendido
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  // Aquí se podría navegar a la sección de intercambios
                  // Por ahora solo cerramos el modal
                  handleClose()
                }}
                disabled={loading}
              >
                Ir a Intercambios
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar semilla'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

DeleteSeedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  seed: PropTypes.object,
  loading: PropTypes.bool,
  validationError: PropTypes.object,
}

export default DeleteSeedModal
