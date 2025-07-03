// src/services/imageService.js
// BLOQUE 5 - PASO 5: Servicio para subida de imágenes a Firebase Storage
//
// Funcionalidades:
// - Subida de imágenes con progress indicator
// - Generación de nombres únicos (timestamp + uuid)
// - Manejo de errores con mensajes descriptivos
// - Compresión y optimización de imágenes

import { storage } from '../firebase-config'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

/**
 * Genera un nombre único para el archivo de imagen
 * @returns {string} Nombre único con timestamp y uuid
 */
const generateUniqueFileName = () => {
  const timestamp = Date.now()
  const uuid = crypto.randomUUID()
  return `seed_${timestamp}_${uuid.substring(0, 8)}.webp`
}

/**
 * Sube una imagen a Firebase Storage con progress tracking
 * @param {Blob} imageBlob - Blob de la imagen a subir
 * @param {function} onProgress - Callback para el progreso (0-100)
 * @param {function} onError - Callback para errores
 * @returns {Promise<string>} URL de descarga de la imagen subida
 */
export const uploadSeedImage = async (
  imageBlob,
  onProgress = null,
  onError = null
) => {
  try {
    // Validar que tenemos un blob válido
    if (!imageBlob || !(imageBlob instanceof Blob)) {
      throw new Error('Debe proporcionar una imagen válida')
    }

    // Validar tamaño máximo (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (imageBlob.size > maxSize) {
      throw new Error('La imagen es demasiado grande. Máximo 5MB permitido.')
    }

    // Generar nombre único para el archivo
    const fileName = generateUniqueFileName()

    // Crear referencia en Firebase Storage bajo la carpeta 'seeds'
    const storageRef = ref(storage, `seeds/${fileName}`)

    // Crear la tarea de subida con progress tracking
    const uploadTask = uploadBytesResumable(storageRef, imageBlob, {
      contentType: 'image/webp',
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        source: 'tarpu-yachay-app',
      },
    })

    // Promesa para manejar la subida
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          // Calcular progreso
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100

          if (onProgress) {
            onProgress(Math.round(progress))
          }

          // Log del progreso para debugging
          console.log(`Subida ${Math.round(progress)}% completada`)
        },
        error => {
          // Manejar errores específicos de Firebase Storage
          let errorMessage

          switch (error.code) {
            case 'storage/unauthorized':
              errorMessage =
                'No tienes permisos para subir imágenes. Inicia sesión e intenta de nuevo.'
              break
            case 'storage/canceled':
              errorMessage = 'La subida fue cancelada'
              break
            case 'storage/quota-exceeded':
              errorMessage = 'Se excedió el límite de almacenamiento'
              break
            case 'storage/invalid-format':
              errorMessage = 'Formato de imagen no válido'
              break
            case 'storage/retry-limit-exceeded':
              errorMessage =
                'Se agotaron los intentos de subida. Verifica tu conexión.'
              break
            default:
              errorMessage = `Error de subida: ${error.message}`
          }

          console.error('Error subiendo imagen:', error)

          if (onError) {
            onError(errorMessage)
          }

          reject(new Error(errorMessage))
        },
        async () => {
          try {
            // Subida exitosa - obtener URL de descarga
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

            console.log('Imagen subida exitosamente:', downloadURL)
            resolve(downloadURL)
          } catch (error) {
            const errorMessage = 'Error obteniendo la URL de la imagen subida'
            console.error(errorMessage, error)

            if (onError) {
              onError(errorMessage)
            }

            reject(new Error(errorMessage))
          }
        }
      )
    })
  } catch (error) {
    const errorMessage = error.message || 'Error preparando la subida de imagen'
    console.error('Error en uploadSeedImage:', error)

    if (onError) {
      onError(errorMessage)
    }

    throw new Error(errorMessage)
  }
}

/**
 * Elimina una imagen de Firebase Storage (para futuro uso)
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @returns {Promise<void>}
 */
export const deleteSeedImage = async imageUrl => {
  try {
    // Extraer la referencia del Storage desde la URL
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
    console.log('Imagen eliminada exitosamente')
  } catch (error) {
    console.error('Error eliminando imagen:', error)
    throw new Error('No se pudo eliminar la imagen')
  }
}

/**
 * Valida si una URL es una imagen válida de Firebase Storage
 * @param {string} url - URL a validar
 * @returns {boolean}
 */
export const isValidFirebaseImageUrl = url => {
  if (!url || typeof url !== 'string') return false

  // Verificar que sea una URL de Firebase Storage
  const firebaseStoragePattern =
    /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/.*\/o\/seeds%2F.*\?alt=media/
  return firebaseStoragePattern.test(url)
}

/**
 * Obtiene información de una imagen desde su URL
 * @param {string} imageUrl - URL de la imagen
 * @returns {Object} Información de la imagen
 */
export const getImageInfo = imageUrl => {
  if (!isValidFirebaseImageUrl(imageUrl)) {
    return null
  }

  try {
    // Extraer el nombre del archivo de la URL
    const urlParts = imageUrl.split('/')
    const encodedFileName = urlParts[urlParts.length - 1].split('?')[0]
    const fileName = decodeURIComponent(encodedFileName)

    return {
      fileName,
      url: imageUrl,
      isFirebaseImage: true,
    }
  } catch (error) {
    console.error('Error obteniendo información de imagen:', error)
    return null
  }
}

export default {
  uploadSeedImage,
  deleteSeedImage,
  isValidFirebaseImageUrl,
  getImageInfo,
}
