// src/components/exchanges/ExchangeRequestForm.jsx
// BLOQUE 7 - PASO 3.1: Formulario de solicitud de intercambio
//
// Funcionalidades implementadas:
// - Información de semilla solicitada (solo lectura)
// - Dropdown para seleccionar semilla propia a ofrecer
// - Campo de mensaje opcional (máximo 200 caracteres)
// - Validaciones de campos obligatorios y restricciones
// - Estados del formulario: inicial, validando, enviando, éxito, error
// - Botones "Enviar Solicitud" y "Cancelar"

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import useFormValidator from '../../hooks/formValidator'
import { createExchangeRequest } from '../../services/exchangeService'
import './ExchangeRequestForm.css'

function ExchangeRequestForm({ requestedSeed, onSuccess, onCancel, onError }) {
  const { user } = useAuth()

  // Estado del formulario
  const [formData, setFormData] = useState({
    offeredSeedId: '',
    message: '',
  })

  // Estados del componente
  const [userSeeds, setUserSeeds] = useState([])
  const [filteredSeeds, setFilteredSeeds] = useState([])
  const [seedSearchTerm, setSeedSearchTerm] = useState('')
  const [selectedSeedPreview, setSelectedSeedPreview] = useState(null)
  const [isLoadingSeeds, setIsLoadingSeeds] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [formStatus, setFormStatus] = useState('initial') // initial, validating, submitting, success, error

  // Reglas de validación específicas para el formulario de intercambio
  const exchangeValidationRules = useMemo(
    () => ({
      offeredSeedId: {
        required: true,
        customValidator: value => {
          if (!value) return null
          if (value === requestedSeed?.id) {
            return 'No puedes ofrecer la misma semilla que solicitas'
          }
          return null
        },
        message: {
          required: 'Debes seleccionar una semilla para ofrecer',
        },
      },
      message: {
        required: false,
        maxLength: 200,
        message: {
          maxLength: 'El mensaje no puede exceder 200 caracteres',
        },
      },
    }),
    [requestedSeed?.id]
  )

  // Hook de validación
  const {
    errors,
    canSubmit,
    getFieldClasses,
    markFieldAsTouched,
    validateAll,
    getValidationSummary,
    touched,
  } = useFormValidator(formData, exchangeValidationRules)

  // Debug: Verificar reglas de validación
  useEffect(() => {
    console.log('🔧 Reglas de validación del formulario de intercambio:', {
      exchangeValidationRules,
      camposEsperados: Object.keys(exchangeValidationRules),
    })
  }, [exchangeValidationRules])

  // Debug: Log de estado del formulario
  useEffect(() => {
    console.log('🔍 Estado del formulario ExchangeRequestForm:')
    console.log('- formData:', formData)
    console.log('- errors:', errors)
    console.log('- canSubmit:', canSubmit)
    console.log('- userSeeds.length:', userSeeds.length)
    console.log('- isSubmitting:', isSubmitting)
    console.log(
      '- Botón habilitado:',
      canSubmit && !isSubmitting && userSeeds.length > 0
    )

    // Debug adicional del hook de validación
    const validationSummary = getValidationSummary()
    console.log('🔍 Resumen de validación:', validationSummary)
    console.log('- touched fields:', touched)
    console.log('- errors details:', errors)
  }, [
    formData,
    errors,
    canSubmit,
    userSeeds.length,
    isSubmitting,
    getValidationSummary,
    touched,
  ])

  // Cargar semillas del usuario al montar el componente
  useEffect(() => {
    const loadUserSeeds = async () => {
      if (!user) return

      setIsLoadingSeeds(true)
      try {
        // Importar dinámicamente para evitar dependencias circulares
        const { getUserSeeds } = await import('../../services/seedService')
        const result = await getUserSeeds(user.uid)

        console.log('🔍 Resultado de getUserSeeds:', result)

        if (result.success && result.data) {
          // Filtrar semillas disponibles para intercambio
          const availableSeeds = result.data.filter(
            seed =>
              seed.isAvailableForExchange &&
              seed.isActive &&
              seed.id !== requestedSeed?.id
          )
          console.log(
            '✅ Semillas disponibles encontradas:',
            availableSeeds.length
          )
          setUserSeeds(availableSeeds)
        } else {
          console.error(
            'Error cargando semillas del usuario:',
            result.error || 'Datos no válidos'
          )
          setUserSeeds([])
        }
      } catch (error) {
        console.error('Error inesperado cargando semillas:', error)
        setUserSeeds([])
      } finally {
        setIsLoadingSeeds(false)
      }
    }

    loadUserSeeds()
  }, [user, requestedSeed?.id])

  // Filtrar semillas basado en el término de búsqueda
  useEffect(() => {
    if (!seedSearchTerm.trim()) {
      setFilteredSeeds(userSeeds)
    } else {
      const filtered = userSeeds.filter(
        seed =>
          seed.name.toLowerCase().includes(seedSearchTerm.toLowerCase()) ||
          (seed.variety &&
            seed.variety.toLowerCase().includes(seedSearchTerm.toLowerCase()))
      )
      setFilteredSeeds(filtered)
    }
  }, [userSeeds, seedSearchTerm])

  // Actualizar preview de semilla seleccionada
  useEffect(() => {
    if (formData.offeredSeedId) {
      const selectedSeed = userSeeds.find(
        seed => seed.id === formData.offeredSeedId
      )
      setSelectedSeedPreview(selectedSeed || null)
    } else {
      setSelectedSeedPreview(null)
    }
  }, [formData.offeredSeedId, userSeeds])

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    // Marcar el campo como tocado para activar validaciones
    markFieldAsTouched(field)
    setSubmitError(null)
  }

  // Manejar envío del formulario
  const handleSubmit = async e => {
    e.preventDefault()

    setSubmitError(null)
    setFormStatus('validating')

    // Validar formulario
    const isFormValid = validateAll()
    if (!isFormValid) {
      setSubmitError('Por favor corrige los errores en el formulario')
      setFormStatus('error')
      return
    }

    // Verificar que hay usuario autenticado
    if (!user) {
      setSubmitError('Debes iniciar sesión para enviar solicitudes')
      setFormStatus('error')
      return
    }

    // Verificar que hay semilla solicitada
    if (!requestedSeed) {
      setSubmitError('Error: no se encontró la semilla solicitada')
      setFormStatus('error')
      return
    }

    setIsSubmitting(true)
    setFormStatus('submitting')

    try {
      console.log('🔄 Enviando solicitud de intercambio...', {
        requesterId: user.uid,
        seedRequestedId: requestedSeed.id,
        seedOfferedId: formData.offeredSeedId,
        message: formData.message,
      })

      const result = await createExchangeRequest(
        user.uid,
        requestedSeed.id,
        formData.offeredSeedId,
        formData.message.trim()
      )

      if (result.success) {
        console.log('✅ Solicitud enviada exitosamente')
        setFormStatus('success')

        // Notificar éxito al componente padre
        if (onSuccess) {
          onSuccess(result)
        }
      } else {
        console.error('❌ Error enviando solicitud:', result.error)
        setSubmitError(result.userMessage || 'Error al enviar la solicitud')
        setFormStatus('error')

        // Notificar error al componente padre
        if (onError) {
          onError(result)
        }
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      setSubmitError('Error inesperado. Intenta nuevamente.')
      setFormStatus('error')

      if (onError) {
        onError({ error: error.message })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar cancelación
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  // Validación de props
  if (!requestedSeed) {
    return (
      <div className="exchange-form-error">
        <p>❌ Error: No se encontró información de la semilla solicitada</p>
      </div>
    )
  }

  return (
    <div className="exchange-request-form-container">
      <div className="exchange-request-form">
        <div className="exchange-form-header">
          <h2 className="exchange-form-title">🔄 Solicitar Intercambio</h2>
          <p className="exchange-form-subtitle">
            Envía una solicitud para intercambiar semillas
          </p>
        </div>

        {/* Información de la semilla solicitada (solo lectura) */}
        <div className="exchange-section">
          <h3 className="exchange-section-title">🌱 Semilla que solicitas</h3>

          <div className="requested-seed-info">
            {requestedSeed.imageUrl && (
              <div className="requested-seed-image">
                <img
                  src={requestedSeed.imageUrl}
                  alt={requestedSeed.name}
                  onError={e => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}

            <div className="requested-seed-details">
              <h4 className="requested-seed-name">
                {requestedSeed.name}
                {requestedSeed.variety && (
                  <span className="requested-seed-variety">
                    ({requestedSeed.variety})
                  </span>
                )}
              </h4>

              <p className="requested-seed-owner">
                👤 Propietario: {requestedSeed.ownerName || 'Usuario'}
              </p>

              {requestedSeed.location && (
                <p className="requested-seed-location">
                  📍 {requestedSeed.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Formulario de solicitud */}
        <form onSubmit={handleSubmit} className="exchange-form">
          {/* Selección de semilla propia a ofrecer */}
          <div className="exchange-section">
            <h3 className="exchange-section-title">🎁 Semilla que ofreces</h3>

            <div className="form-field">
              <label htmlFor="offeredSeed" className="form-label">
                Selecciona una semilla de tu colección *
              </label>

              {isLoadingSeeds ? (
                <div className="loading-seeds">
                  <p>Cargando tus semillas...</p>
                </div>
              ) : userSeeds.length === 0 ? (
                <div className="no-seeds-message">
                  <p>❌ No tienes semillas disponibles para intercambio</p>
                  <p className="no-seeds-help">
                    Registra semillas marcadas como &quot;disponibles para
                    intercambio&quot;
                  </p>
                </div>
              ) : (
                <>
                  {/* Campo de búsqueda para filtrar semillas */}
                  <div className="seed-search-field">
                    <label htmlFor="seedSearch" className="form-label-small">
                      Buscar en tus semillas:
                    </label>
                    <input
                      type="text"
                      id="seedSearch"
                      value={seedSearchTerm}
                      onChange={e => setSeedSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre o variedad..."
                      className="form-input-search"
                      disabled={isSubmitting}
                    />
                  </div>

                  <select
                    id="offeredSeed"
                    value={formData.offeredSeedId}
                    onChange={e =>
                      handleInputChange('offeredSeedId', e.target.value)
                    }
                    onBlur={() => markFieldAsTouched('offeredSeedId')}
                    className={`form-select ${getFieldClasses('offeredSeedId')}`}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">
                      {filteredSeeds.length === 0
                        ? 'No hay semillas que coincidan con la búsqueda'
                        : 'Selecciona una semilla...'}
                    </option>
                    {filteredSeeds.map(seed => (
                      <option key={seed.id} value={seed.id}>
                        {seed.name}
                        {seed.variety && ` (${seed.variety})`}
                        {seed.location && ` - ${seed.location}`}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {errors.offeredSeedId && (
                <div className="form-error">⚠️ {errors.offeredSeedId}</div>
              )}
            </div>

            {/* Preview de la semilla seleccionada */}
            {selectedSeedPreview && (
              <div className="selected-seed-preview">
                <h4 className="preview-title">
                  📋 Vista previa de tu semilla:
                </h4>
                <div className="preview-content">
                  {selectedSeedPreview.imageUrl && (
                    <div className="preview-image">
                      <img
                        src={selectedSeedPreview.imageUrl}
                        alt={selectedSeedPreview.name}
                        onError={e => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="preview-details">
                    <p className="preview-name">
                      <strong>{selectedSeedPreview.name}</strong>
                      {selectedSeedPreview.variety && (
                        <span className="preview-variety">
                          ({selectedSeedPreview.variety})
                        </span>
                      )}
                    </p>
                    {selectedSeedPreview.location && (
                      <p className="preview-location">
                        📍 {selectedSeedPreview.location}
                      </p>
                    )}
                    {selectedSeedPreview.description && (
                      <p className="preview-description">
                        {selectedSeedPreview.description.length > 100
                          ? `${selectedSeedPreview.description.substring(0, 100)}...`
                          : selectedSeedPreview.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo de mensaje opcional */}
          <div className="exchange-section">
            <h3 className="exchange-section-title">💬 Mensaje (opcional)</h3>

            <div className="form-field">
              <label htmlFor="exchangeMessage" className="form-label">
                Mensaje para el propietario
              </label>

              <textarea
                id="exchangeMessage"
                value={formData.message}
                onChange={e => handleInputChange('message', e.target.value)}
                onBlur={() => markFieldAsTouched('message')}
                placeholder="Ej: Me interesa mucho tu semilla porque..."
                className={`form-textarea ${getFieldClasses('message')}`}
                rows={4}
                maxLength={200}
                disabled={isSubmitting}
              />

              <div className="form-help">
                {formData.message.length}/200 caracteres
              </div>

              {errors.message && (
                <div className="form-error">⚠️ {errors.message}</div>
              )}
            </div>
          </div>

          {/* Mensaje de error general */}
          {submitError && (
            <div className="form-submit-error">❌ {submitError}</div>
          )}

          {/* Botones de acción */}
          <div className="exchange-form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="exchange-btn exchange-btn-secondary"
              disabled={isSubmitting}
            >
              ❌ Cancelar
            </button>

            <button
              type="submit"
              className={`exchange-btn exchange-btn-primary ${
                canSubmit && !isSubmitting && userSeeds.length > 0
                  ? ''
                  : 'exchange-btn-disabled'
              }`}
              disabled={!canSubmit || isSubmitting || userSeeds.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Enviando...
                </>
              ) : (
                '📨 Enviar Solicitud'
              )}
            </button>
          </div>

          {/* Indicador de estado */}
          <div className="form-status">
            {formStatus === 'validating' && (
              <p className="status-validating">🔍 Validando información...</p>
            )}
            {formStatus === 'submitting' && (
              <p className="status-submitting">📤 Enviando solicitud...</p>
            )}
            {formStatus === 'success' && (
              <p className="status-success">
                ✅ ¡Solicitud enviada exitosamente!
              </p>
            )}
            {formStatus === 'error' && (
              <p className="status-error">❌ Error al procesar la solicitud</p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExchangeRequestForm
