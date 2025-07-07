// src/hooks/useProfileValidator.js
// BLOQUE 8 - PASO 2.2: Hook específico para validación de perfil de usuario
//
// Adaptación del useFormValidator existente para validaciones específicas del perfil
// Integración con whatsappUtils.js para validación de números ecuatorianos

import { useState, useMemo, useCallback } from 'react'
import { isValidEcuadorianPhone } from '../utils/whatsappUtils'

/**
 * Hook personalizado para validación de perfil de usuario
 * @param {Object} profileData - Datos del perfil a validar
 * @returns {Object} - Estado de validación, errores y funciones helper
 */
function useProfileValidator(profileData) {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isValid, setIsValid] = useState(false)

  // Reglas de validación específicas para perfil de usuario
  const validationRules = useMemo(
    () => ({
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: {
          required: 'El nombre es obligatorio',
          minLength: 'El nombre debe tener al menos 2 caracteres',
          maxLength: 'El nombre no puede exceder 50 caracteres',
          pattern: 'El nombre solo puede contener letras y espacios',
        },
      },
      location: {
        required: false,
        maxLength: 100,
        message: {
          maxLength: 'La ubicación no puede exceder 100 caracteres',
        },
      },
      whatsapp: {
        required: false,
        customValidator: value => {
          if (!value || value.trim() === '') return null
          return isValidEcuadorianPhone(value) ? null : 'invalid'
        },
        message: {
          invalid:
            'Formato de WhatsApp inválido. Ej: +593987654321 o 0987654321',
        },
      },
    }),
    []
  )

  /**
   * Valida un campo específico
   * @param {string} fieldName - Nombre del campo
   * @param {any} value - Valor del campo
   * @returns {string|null} - Mensaje de error o null si es válido
   */
  const validateField = useCallback(
    (fieldName, value) => {
      const rule = validationRules[fieldName]
      if (!rule) return null

      const trimmedValue = typeof value === 'string' ? value.trim() : value

      // Validar campo requerido
      if (rule.required && (!trimmedValue || trimmedValue === '')) {
        return rule.message.required
      }

      // Si el campo está vacío y no es requerido, es válido
      if (!trimmedValue || trimmedValue === '') {
        return null
      }

      // Validar longitud mínima
      if (rule.minLength && trimmedValue.length < rule.minLength) {
        return rule.message.minLength
      }

      // Validar longitud máxima
      if (rule.maxLength && trimmedValue.length > rule.maxLength) {
        return rule.message.maxLength
      }

      // Validar patrón regex
      if (rule.pattern && !rule.pattern.test(trimmedValue)) {
        return rule.message.pattern
      }

      // Validar función personalizada
      if (rule.customValidator) {
        const customResult = rule.customValidator(trimmedValue)
        if (customResult) {
          return rule.message[customResult] || rule.message.invalid
        }
      }

      return null
    },
    [validationRules]
  )

  /**
   * Valida todos los campos del perfil
   * @returns {Object} - Objeto con errores por campo
   */
  const validateAllFields = useCallback(() => {
    const newErrors = {}
    const fieldsToValidate = ['name', 'location', 'whatsapp']

    fieldsToValidate.forEach(fieldName => {
      const error = validateField(fieldName, profileData[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })

    return newErrors
  }, [profileData, validateField])

  /**
   * Marca un campo como "tocado" y lo valida
   * @param {string} fieldName - Nombre del campo
   */
  const markFieldAsTouched = useCallback(
    fieldName => {
      setTouched(prev => ({ ...prev, [fieldName]: true }))

      // Validar el campo específico
      const fieldError = validateField(fieldName, profileData[fieldName])
      setErrors(prev => {
        const newErrors = { ...prev }
        if (fieldError) {
          newErrors[fieldName] = fieldError
        } else {
          delete newErrors[fieldName]
        }
        return newErrors
      })

      // Recalcular validez general
      const allErrors = validateAllFields()
      setIsValid(Object.keys(allErrors).length === 0)
    },
    [validateField, profileData, validateAllFields]
  )

  /**
   * Obtiene el estado de validación de un campo específico
   * @param {string} fieldName - Nombre del campo
   * @returns {Object} - Estado del campo
   */
  const getFieldState = useCallback(
    fieldName => {
      const hasError = !!errors[fieldName]
      const isTouched = !!touched[fieldName]
      const message = errors[fieldName]
      const isFieldValid = !hasError && isTouched

      return {
        hasError,
        message,
        isValid: isFieldValid,
        isTouched,
        className: hasError
          ? 'input-field--error'
          : isFieldValid
            ? 'input-field--valid'
            : '',
      }
    },
    [errors, touched]
  )

  /**
   * Resetea el estado de validación
   */
  const resetValidation = useCallback(() => {
    setErrors({})
    setTouched({})
    setIsValid(false)
  }, [])

  /**
   * Valida todo el formulario y actualiza estados
   */
  const validateForm = useCallback(() => {
    const allErrors = validateAllFields()
    setErrors(allErrors)

    // Marcar todos los campos como tocados
    const fieldsToValidate = ['name', 'location', 'whatsapp']
    const allTouched = {}
    fieldsToValidate.forEach(field => {
      allTouched[field] = true
    })
    setTouched(allTouched)

    const isFormValid = Object.keys(allErrors).length === 0
    setIsValid(isFormValid)

    return isFormValid
  }, [validateAllFields])

  return {
    errors,
    touched,
    isValid,
    validateField,
    markFieldAsTouched,
    getFieldState,
    resetValidation,
    validateForm,
    hasErrors: Object.keys(errors).length > 0,
  }
}

export default useProfileValidator
