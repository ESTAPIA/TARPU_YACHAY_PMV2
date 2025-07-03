// src/pages/AddSeedPage.jsx
// Página para registro de nuevas semillas
//
// BLOQUE 5 - PASO 1: Análisis y mejora del formulario existente
// BLOQUE 5 - PASO 2: Implementación de validación en tiempo real
//
// CAMBIOS REALIZADOS:
// ✅ Agregado campo 'ownerPhone' (número WhatsApp opcional)
// ✅ Agregado campo 'isAvailableForExchange' (boolean, default true)
// ✅ Agregado campo 'exchangeNotes' (notas para intercambio)
// ✅ Reorganizado formulario en secciones lógicas
// ✅ Mejorada organización visual y espaciado
// ✅ Agregados estilos para checkbox, toggle y field help
// ✅ Implementada validación en tiempo real con hook personalizado
// ✅ Agregados mensajes de error y indicadores visuales
// ✅ Validación de formatos específicos y campos obligatorios
//
// ESTRUCTURA ACTUAL DEL MODELO:
// - name: string (obligatorio, mín 3 caracteres)
// - variety: string (opcional, máx 30 caracteres)
// - category: string (obligatorio)
// - description: string (obligatorio, mín 10 caracteres)
// - location: string (opcional, máx 100 caracteres)
// - ownerPhone: string (opcional, formato válido)
// - isAvailableForExchange: boolean (default true)
// - exchangeNotes: string (opcional, máx 300 caracteres)

import { useState, useEffect } from 'react'
import useFormValidator from '../hooks/formValidator'
import CategorySelector from '../components/ui/CategorySelector'
import ImageCapture from '../components/ui/ImageCapture'
import { useAuth } from '../contexts/AuthContext'
import { saveSeed } from '../services/seedService'
import { uploadSeedImage } from '../services/imageService'

function AddSeedPage() {
  // Hook de autenticación
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    category: '',
    description: '',
    location: '',
    ownerPhone: '',
    isAvailableForExchange: true,
    exchangeNotes: '',
  })

  // Estado para captura de imagen
  const [capturedImage, setCapturedImage] = useState(null)
  const [showImageCapture, setShowImageCapture] = useState(false)

  // Estados para el guardado
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  // Hook de validación en tiempo real
  const {
    errors,
    canSubmit,
    getFieldClasses,
    markFieldAsTouched,
    validateAll,
  } = useFormValidator(formData)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Manejar captura de imagen
  const handleImageCapture = imageUrl => {
    setCapturedImage(imageUrl)
    console.log('Imagen subida a Firebase:', imageUrl)
  }

  const handleOpenImageCapture = () => {
    setShowImageCapture(true)
  }

  const handleCloseImageCapture = () => {
    setShowImageCapture(false)
  }

  const handleRemoveImage = () => {
    setCapturedImage(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    setSubmitMessage(null)
    setSubmitError(null)

    const isFormValid = validateAll()
    if (!isFormValid) {
      setSubmitError('Por favor corrige los errores en el formulario')
      console.log('Formulario inválido:', errors)
      return
    }
    if (!user) {
      setSubmitError('Debes iniciar sesión para registrar una semilla')
      return
    }
    setIsSubmitting(true)
    try {
      let imageUrl = ''
      // Si hay imagen capturada
      if (capturedImage) {
        if (typeof capturedImage === 'string') {
          // Ya es una URL de Firebase
          imageUrl = capturedImage
        } else if (capturedImage instanceof Blob) {
          // Es un Blob, subir a Firebase
          const uploadResult = await uploadSeedImage(capturedImage)
          imageUrl = uploadResult // uploadSeedImage retorna la URL
        }
      }
      const seedDataToSave = {
        ...formData,
        imageUrl,
      }
      console.log('🌱 Guardando semilla en Firestore...', seedDataToSave)
      const result = await saveSeed(seedDataToSave, user)
      if (result.success) {
        setSubmitMessage('¡Semilla registrada exitosamente! 🎉')
        setFormData({
          name: '',
          variety: '',
          category: '',
          description: '',
          location: '',
          ownerPhone: '',
          isAvailableForExchange: true,
          exchangeNotes: '',
        })
        setCapturedImage(null)
        setTimeout(() => {
          setSubmitMessage(null)
        }, 5000)
      } else {
        setSubmitError(result.userMessage || 'Error al guardar la semilla')
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      setSubmitError('Error inesperado. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Estado de conexión
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div style={styles.container} className="page-transition gpu-accelerated">
      {/* Feedback visual de éxito/error y spinner de carga */}
      {(submitMessage || submitError || isSubmitting) && (
        <div style={{ marginBottom: '18px', textAlign: 'center' }}>
          {isSubmitting && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #1976d2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 8px',
                }}
              />
              <span style={{ color: '#1976d2', fontWeight: 500 }}>
                Procesando...
              </span>
            </div>
          )}
          {submitMessage && (
            <div
              style={{
                background: '#e8f5e9',
                color: '#388e3c',
                border: '1px solid #c8e6c9',
                borderRadius: 8,
                padding: '10px 16px',
                marginBottom: 4,
                fontWeight: 500,
                fontSize: '1rem',
                display: 'inline-block',
              }}
            >
              ✅ {submitMessage}
            </div>
          )}
          {submitError && (
            <div
              style={{
                background: '#ffebee',
                color: '#c62828',
                border: '1px solid #ffcdd2',
                borderRadius: 8,
                padding: '10px 16px',
                marginBottom: 4,
                fontWeight: 500,
                fontSize: '1rem',
                display: 'inline-block',
              }}
            >
              ❌ {submitError}
            </div>
          )}
        </div>
      )}

      {/* Header de la página */}
      <div style={styles.header}>
        <h1 style={styles.title}>➕ Registrar Nueva Semilla</h1>
        <p style={styles.subtitle}>
          Añade una semilla a tu colección para intercambiar
        </p>
      </div>

      {/* Formulario de registro */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Información básica */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📝 Información Básica</h2>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="seedName">
              Nombre de la semilla *
            </label>
            <input
              id="seedName"
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              onBlur={() => markFieldAsTouched('name')}
              placeholder="Ej: Maíz amarillo"
              style={{
                ...styles.input,
                ...(getFieldClasses('name') === 'field-error'
                  ? styles.inputError
                  : {}),
                ...(getFieldClasses('name') === 'field-valid'
                  ? styles.inputValid
                  : {}),
              }}
              required
            />
            {errors.name && (
              <div style={styles.errorMessage}>⚠️ {errors.name}</div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="seedVariety">
              Variedad
            </label>
            <input
              id="seedVariety"
              type="text"
              value={formData.variety}
              onChange={e => handleInputChange('variety', e.target.value)}
              onBlur={() => markFieldAsTouched('variety')}
              placeholder="Ej: Morocho, Chulpi"
              style={{
                ...styles.input,
                ...(getFieldClasses('variety') === 'field-error'
                  ? styles.inputError
                  : {}),
                ...(getFieldClasses('variety') === 'field-valid'
                  ? styles.inputValid
                  : {}),
              }}
            />
            {errors.variety && (
              <div style={styles.errorMessage}>⚠️ {errors.variety}</div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="seedCategory">
              Categoría *
            </label>
            <CategorySelector
              value={formData.category}
              onChange={value => handleInputChange('category', value)}
              onBlur={() => markFieldAsTouched('category')}
              style={{
                ...(getFieldClasses('category') === 'field-error'
                  ? { border: '2px solid #e74c3c' }
                  : {}),
                ...(getFieldClasses('category') === 'field-valid'
                  ? { border: '2px solid #27ae60' }
                  : {}),
              }}
              required
              placeholder="Buscar y seleccionar categoría..."
            />
            {errors.category && (
              <div style={styles.errorMessage}>⚠️ {errors.category}</div>
            )}
          </div>
        </div>

        {/* Descripción y Ubicación */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Descripción y Ubicación</h2>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="seedDescription">
              Describe tu semilla *
            </label>
            <textarea
              id="seedDescription"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              onBlur={() => markFieldAsTouched('description')}
              placeholder="Describe las características, usos, tiempo de cosecha, etc."
              style={{
                ...styles.textarea,
                ...(getFieldClasses('description') === 'field-error'
                  ? styles.inputError
                  : {}),
                ...(getFieldClasses('description') === 'field-valid'
                  ? styles.inputValid
                  : {}),
              }}
              rows={4}
              required
            />
            {errors.description && (
              <div style={styles.errorMessage}>⚠️ {errors.description}</div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="seedLocation">
              Lugar de origen/cultivo
            </label>
            <input
              id="seedLocation"
              type="text"
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              onBlur={() => markFieldAsTouched('location')}
              placeholder="Ej: Chugchilán, Cotopaxi"
              style={{
                ...styles.input,
                ...(getFieldClasses('location') === 'field-error'
                  ? styles.inputError
                  : {}),
                ...(getFieldClasses('location') === 'field-valid'
                  ? styles.inputValid
                  : {}),
              }}
            />
            {errors.location && (
              <div style={styles.errorMessage}>⚠️ {errors.location}</div>
            )}
          </div>
        </div>

        {/* Información de Intercambio */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🔄 Información de Intercambio</h2>

          <div style={styles.fieldGroup}>
            <div style={styles.toggleContainer}>
              <input
                id="availableForExchange"
                type="checkbox"
                checked={formData.isAvailableForExchange}
                onChange={e =>
                  handleInputChange('isAvailableForExchange', e.target.checked)
                }
                style={styles.checkbox}
              />
              <label style={styles.toggleLabel} htmlFor="availableForExchange">
                ✅ Disponible para intercambio
              </label>
            </div>
            <p style={styles.fieldHelp}>
              Marca esta opción si quieres intercambiar esta semilla con otros
              usuarios
            </p>
          </div>

          {formData.isAvailableForExchange && (
            <>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="exchangeNotes">
                  Notas para el intercambio
                </label>
                <textarea
                  id="exchangeNotes"
                  value={formData.exchangeNotes}
                  onChange={e =>
                    handleInputChange('exchangeNotes', e.target.value)
                  }
                  onBlur={() => markFieldAsTouched('exchangeNotes')}
                  placeholder="Ej: Busco semillas de hortalizas, prefiero intercambios locales..."
                  style={{
                    ...styles.textarea,
                    ...(getFieldClasses('exchangeNotes') === 'field-error'
                      ? styles.inputError
                      : {}),
                    ...(getFieldClasses('exchangeNotes') === 'field-valid'
                      ? styles.inputValid
                      : {}),
                  }}
                  rows={3}
                />
                {errors.exchangeNotes && (
                  <div style={styles.errorMessage}>
                    ⚠️ {errors.exchangeNotes}
                  </div>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="ownerPhone">
                  Número de WhatsApp (opcional)
                </label>
                <input
                  id="ownerPhone"
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={e =>
                    handleInputChange('ownerPhone', e.target.value)
                  }
                  onBlur={() => markFieldAsTouched('ownerPhone')}
                  placeholder="Ej: +593987654321"
                  style={{
                    ...styles.input,
                    ...(getFieldClasses('ownerPhone') === 'field-error'
                      ? styles.inputError
                      : {}),
                    ...(getFieldClasses('ownerPhone') === 'field-valid'
                      ? styles.inputValid
                      : {}),
                  }}
                />
                {errors.ownerPhone && (
                  <div style={styles.errorMessage}>⚠️ {errors.ownerPhone}</div>
                )}
                <p style={styles.fieldHelp}>
                  Para que otros usuarios puedan contactarte directamente
                </p>
              </div>
            </>
          )}
        </div>

        {/* Captura de Imagen */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📸 Imagen de la Semilla</h2>

          {capturedImage ? (
            <div style={styles.imageContainer}>
              <img
                src={capturedImage}
                alt="Imagen de la semilla"
                style={styles.capturedImage}
              />
              <div style={styles.imageActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={handleRemoveImage}
                >
                  🗑️ Eliminar
                </button>
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={handleOpenImageCapture}
                >
                  � Cambiar Foto
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.mediaPlaceholder}>
              <div style={styles.mediaIcon}>📷</div>
              <p style={styles.mediaText}>Captura una foto de tu semilla</p>
              <p style={styles.mediaSubtext}>
                Una buena imagen ayuda a otros usuarios a conocer tu semilla
              </p>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={handleOpenImageCapture}
              >
                📷 Tomar Foto
              </button>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div style={styles.actions}>
          <button type="button" style={styles.secondaryButton}>
            📝 Guardar como Borrador
          </button>
          <button
            type="submit"
            style={{
              ...styles.primaryButton,
              ...(canSubmit ? {} : styles.disabledButton),
            }}
            disabled={!canSubmit}
          >
            ✅ Publicar Semilla
          </button>
        </div>

        {/* Indicador de estado de validación */}
        {Object.keys(errors).length > 0 && (
          <div style={styles.validationSummary}>
            <p style={styles.validationTitle}>
              ⚠️ Revisa los siguientes campos:
            </p>
            <ul style={styles.validationList}>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field} style={styles.validationItem}>
                  {message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Información adicional */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>💡 Consejos para un buen registro</h3>
          <ul style={styles.infoList}>
            <li>Usa nombres descriptivos y específicos</li>
            <li>Incluye la variedad local si la conoces</li>
            <li>Describe características únicas de tu semilla</li>
            <li>Menciona la época de siembra y cosecha</li>
          </ul>
        </div>
      </div>

      {/* Modal de captura de imagen */}
      <ImageCapture
        isOpen={showImageCapture}
        onImageCapture={handleImageCapture}
        onClose={handleCloseImageCapture}
      />
    </div>
  )
}

// Estilos mobile-first
const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
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
  form: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#333',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
  },
  mediaPlaceholder: {
    textAlign: 'center',
    padding: '40px 20px',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  mediaIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    opacity: 0.5,
  },
  mediaText: {
    color: '#666',
    fontSize: '1rem',
    fontWeight: '500',
    margin: '0 0 5px 0',
  },
  mediaSubtext: {
    color: '#999',
    fontSize: '0.9rem',
    margin: '0',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '30px',
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
    minWidth: '150px',
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#1976d2',
    border: '2px solid #1976d2',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '150px',
  },
  infoSection: {
    marginBottom: '20px',
  },
  infoCard: {
    backgroundColor: '#e8f5e8',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #c8e6c9',
  },
  infoTitle: {
    color: '#2e7d32',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  infoList: {
    color: '#2e7d32',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    margin: '0',
    paddingLeft: '20px',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#1976d2',
  },
  toggleLabel: {
    color: '#333',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    margin: '0',
  },
  fieldHelp: {
    color: '#666',
    fontSize: '0.85rem',
    margin: '5px 0 0 0',
    fontStyle: 'italic',
  },
  // Estilos para indicadores visuales de validación
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#fff5f5',
  },
  inputValid: {
    borderColor: '#4caf50',
    backgroundColor: '#f1f8e9',
  },
  errorMessage: {
    color: '#f44336',
    fontSize: '0.85rem',
    margin: '5px 0 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  validMessage: {
    color: '#4caf50',
    fontSize: '0.85rem',
    margin: '5px 0 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
}

export default AddSeedPage
