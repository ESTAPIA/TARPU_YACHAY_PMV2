// src/components/ui/ImageCapture.jsx
// BLOQUE 5 - PASO 4: Implementación de captura de imagen
//
// Componente para captura de imagen con cámara del dispositivo
// - Acceso a cámara con navigator.mediaDevices
// - Preview de imagen antes de confirmar
// - Opción de rehacer foto
// - Optimización de imagen (redimensionar y comprimir)

import { useState, useRef, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { uploadSeedImage } from '../../services/imageService'

/**
 * @typedef {Object} ImageCaptureProps
 * @property {function} onImageCapture - Callback cuando se sube una imagen (recibe URL de Firebase)
 * @property {function} onClose - Callback cuando se cierra el modal
 * @property {boolean} isOpen - Si el modal está abierto
 * @property {Object} style - Estilos adicionales
 */

function ImageCapture({ onImageCapture, onClose, isOpen = false, style = {} }) {
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState(null)
  const [cameraStarted, setCameraStarted] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  // Estados para subida a Firebase
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Verificar soporte de cámara
  const isCameraSupported = useCallback(() => {
    return (
      'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    )
  }, [])

  // Iniciar cámara
  const startCamera = useCallback(async () => {
    if (!isCameraSupported()) {
      setError('Cámara no soportada en este dispositivo')
      return
    }

    try {
      setError(null)
      setIsCapturing(true)
      setVideoReady(false)

      let constraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'environment', // intenta primero cámara trasera
        },
      }

      let mediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (e) {
        console.warn('Cámara trasera sin señal, probando frontal:', e)
        constraints.video.facingMode = 'user'
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      }

      setStream(mediaStream)

      setCameraStarted(true)
      setIsCapturing(false)
    } catch (error) {
      console.error('Error accediendo a cámara:', error)

      let errorMessage = 'No se pudo acceder a la cámara. '

      switch (error.name) {
        case 'NotAllowedError':
          errorMessage +=
            'Permisos denegados. Permite el acceso a la cámara en la configuración del navegador.'
          break
        case 'NotFoundError':
          errorMessage += 'No se encontró cámara en el dispositivo.'
          break
        case 'NotReadableError':
          errorMessage += 'La cámara está siendo usada por otra aplicación.'
          break
        case 'SecurityError':
          errorMessage +=
            'Acceso denegado por seguridad. Asegúrate de usar HTTPS.'
          break
        default:
          errorMessage += `Error: ${error.message}`
      }

      setError(errorMessage)
      setIsCapturing(false)
    }
  }, [isCameraSupported])

  // Detener cámara
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setVideoReady(false)
    setCameraStarted(false)
    setCapturedImage(null)
    setError(null)
  }, [stream])

  // Optimizar imagen (redimensionar y comprimir)
  const optimizeImage = useCallback(canvas => {
    const maxWidth = 1200 // Ancho máximo para optimización
    const maxHeight = 800 // Alto máximo para optimización
    const quality = 0.8 // Calidad de compresión

    let { width, height } = canvas

    // Calcular nuevas dimensiones manteniendo aspecto
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width = Math.floor(width * ratio)
      height = Math.floor(height * ratio)
    }

    // Crear canvas temporal para redimensionar
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = width
    tempCanvas.height = height

    // Redimensionar con mejor calidad
    tempCtx.drawImage(canvas, 0, 0, width, height)

    return new Promise(resolve => {
      tempCanvas.toBlob(resolve, 'image/webp', quality)
    })
  }, [])

  // Capturar foto
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setError(
        'La cámara sigue inicializándose. Intenta de nuevo en un instante.'
      )
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // Verificar que el video tenga dimensiones válidas
      if (!video.videoWidth || !video.videoHeight) {
        setError(
          'El video aún no está listo. Espera un momento e intenta de nuevo.'
        )
        return
      }

      // Configurar canvas con dimensiones del video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Capturar frame actual
      ctx.drawImage(video, 0, 0)

      // Optimizar imagen (redimensionar y comprimir)
      const optimizedBlob = await optimizeImage(canvas)

      if (optimizedBlob) {
        setCapturedImage(optimizedBlob)

        // Vibración de confirmación si está disponible
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100])
        }
      }
    } catch (error) {
      console.error('Error capturando foto:', error)
      setError('No se pudo capturar la foto')
    }
  }, [optimizeImage])

  // Confirmar imagen capturada y subirla a Firebase
  const confirmImage = useCallback(async () => {
    if (!capturedImage || !onImageCapture) return

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setError(null)

      // Subir imagen a Firebase Storage
      const imageUrl = await uploadSeedImage(
        capturedImage,
        // Callback para el progreso
        progress => {
          setUploadProgress(progress)
        },
        // Callback para errores
        errorMessage => {
          setError(errorMessage)
        }
      )

      // Éxito - devolver la URL de la imagen
      onImageCapture(imageUrl)
      stopCamera()
      onClose()
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      setError(error.message || 'Error subiendo la imagen')
    } finally {
      setIsUploading(false)
    }
  }, [capturedImage, onImageCapture, stopCamera, onClose])

  // Rehacer foto
  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
  }, [])

  // Cerrar modal
  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  // Efecto para iniciar cámara automáticamente cuando el modal se abre
  useEffect(() => {
    if (isOpen && !cameraStarted && !stream) {
      startCamera()
    }
  }, [isOpen, cameraStarted, stream, startCamera])

  // 🆕 Conecta el stream al <video> en cuanto ambos están listos
  useEffect(() => {
    if (cameraStarted && stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current
        .play()
        .then(() => console.log('▶️  Vídeo reproduciéndose'))
        .catch(err => console.warn('Autoplay bloqueado:', err))
    }
  }, [cameraStarted, stream])

  if (!isOpen) return null

  return (
    <div style={{ ...styles.overlay, ...style }}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>📷 Capturar Imagen de Semilla</h3>
          <button
            style={styles.closeButton}
            onClick={handleClose}
            type="button"
            aria-label="Cerrar"
          >
            ❌
          </button>
        </div>

        {/* Contenido */}
        <div style={styles.content}>
          {/* Error */}
          {error && (
            <div style={styles.errorContainer}>
              <p style={styles.errorMessage}>⚠️ {error}</p>
              <button
                style={styles.retryButton}
                onClick={startCamera}
                type="button"
              >
                🔄 Intentar de nuevo
              </button>
            </div>
          )}

          {/* Loading */}
          {isCapturing && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Iniciando cámara...</p>
            </div>
          )}

          {/* Preview de imagen capturada */}
          {capturedImage && (
            <div style={styles.previewContainer}>
              <img
                src={URL.createObjectURL(capturedImage)}
                alt="Imagen capturada"
                style={styles.previewImage}
              />

              {/* Progress indicator durante subida */}
              {isUploading && (
                <div style={styles.uploadContainer}>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${uploadProgress}%`,
                      }}
                    />
                  </div>
                  <p style={styles.uploadText}>
                    📤 Subiendo imagen... {uploadProgress}%
                  </p>
                </div>
              )}

              <div style={styles.previewActions}>
                <button
                  style={{
                    ...styles.secondaryButton,
                    ...(isUploading ? styles.disabledButton : {}),
                  }}
                  onClick={retakePhoto}
                  type="button"
                  disabled={isUploading}
                >
                  🔄 Rehacer
                </button>
                <button
                  style={{
                    ...styles.primaryButton,
                    ...(isUploading ? styles.disabledButton : {}),
                  }}
                  onClick={confirmImage}
                  type="button"
                  disabled={isUploading}
                >
                  {isUploading ? '📤 Subiendo...' : '✅ Confirmar'}
                </button>
              </div>
            </div>
          )}

          {/* Cámara activa */}
          {cameraStarted && !capturedImage && !error && (
            <div style={styles.cameraContainer}>
              <video
                ref={videoRef}
                style={styles.video}
                autoPlay
                playsInline
                muted
                onCanPlay={() => setVideoReady(true)}
              />
              <canvas ref={canvasRef} style={styles.hiddenCanvas} />

              {/* Controles de cámara */}
              <div style={styles.cameraControls}>
                <button
                  style={styles.secondaryButton}
                  onClick={handleClose}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  style={{
                    ...styles.captureButton,
                    opacity: videoReady ? 1 : 0.5,
                    cursor: videoReady ? 'pointer' : 'not-allowed',
                  }}
                  onClick={capturePhoto}
                  type="button"
                  disabled={!videoReady} // ✅ evita disparos prematuros
                  title={videoReady ? 'Capturar' : 'Esperando cámara…'}
                >
                  <span style={styles.captureIcon}>📷</span>
                </button>
                <div style={styles.spacer}></div>
              </div>
            </div>
          )}

          {/* Estado inicial */}
          {!cameraStarted && !error && !isCapturing && (
            <div style={styles.initialContainer}>
              <div style={styles.cameraIcon}>📷</div>
              <p style={styles.instructionText}>
                Presiona el botón para acceder a la cámara
              </p>
              <button
                style={styles.primaryButton}
                onClick={startCamera}
                type="button"
              >
                🚀 Iniciar Cámara
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },

  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa',
  },

  title: {
    margin: 0,
    color: '#333',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: '20px',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorContainer: {
    textAlign: 'center',
    color: '#d32f2f',
    width: '100%',
  },

  errorMessage: {
    margin: '0 0 15px 0',
    fontSize: '0.9rem',
    lineHeight: 1.4,
  },

  retryButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },

  loadingContainer: {
    textAlign: 'center',
    color: '#666',
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1976d2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px',
  },

  loadingText: {
    margin: 0,
    fontSize: '0.9rem',
  },

  cameraContainer: {
    width: '100%',
    position: 'relative',
  },

  video: {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
    borderRadius: '8px',
  },

  hiddenCanvas: {
    display: 'none',
  },

  cameraControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
  },

  captureButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    cursor: 'pointer',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
  },

  captureIcon: {
    fontSize: '1.8rem',
  },

  spacer: {
    width: '80px', // Para centrar el botón de captura
  },

  previewContainer: {
    width: '100%',
    textAlign: 'center',
  },

  previewImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '8px',
  },

  previewActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginTop: '15px',
  },

  initialContainer: {
    textAlign: 'center',
    color: '#666',
  },

  cameraIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    opacity: 0.7,
  },

  instructionText: {
    margin: '0 0 20px 0',
    fontSize: '1rem',
    lineHeight: 1.4,
  },

  primaryButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },

  secondaryButton: {
    backgroundColor: 'white',
    color: '#1976d2',
    border: '2px solid #1976d2',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },

  // Estilos para progress indicator
  uploadContainer: {
    margin: '15px 0',
    textAlign: 'center',
  },

  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '10px',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#1976d2',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },

  uploadText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },

  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
}

// PropTypes para validación de props
ImageCapture.propTypes = {
  onImageCapture: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  style: PropTypes.object,
}

// CSS para animación del spinner (se inyecta una vez)
if (typeof window !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}

export default ImageCapture
