// src/hooks/formValidator.js
// Hook personalizado para validación de formularios en tiempo real
//
// BLOQUE 5 - PASO 2: Implementación de validación en tiempo real
// BLOQUE 5 - PASO 3: Integración con categorías predefinidas
//
// FUNCIONALIDADES:
// ✅ Validación de campos obligatorios
// ✅ Validación de formatos específicos
// ✅ Mensajes de error claros y útiles
// ✅ Indicadores visuales de estado
// ✅ Validación en tiempo real
// ✅ Validación de categorías con archivo predefinido

import { useState, useCallback, useMemo } from 'react'
import { isValidCategoryId } from '../data/seedCategories'

/**
 * Hook personalizado para validación de formularios
 * @param {Object} formData - Datos del formulario a validar
 * @param {Object} validationRules - Reglas de validación personalizadas
 * @returns {Object} - Estado de validación, errores y funciones helper
 */
function useFormValidator(formData, validationRules = {}) {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isValid, setIsValid] = useState(false)

  // Reglas de validación por defecto para semillas
  const defaultRules = useMemo(
    () => ({
      name: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: {
          required: 'El nombre de la semilla es obligatorio',
          minLength: 'El nombre debe tener al menos 3 caracteres',
          maxLength: 'El nombre no puede exceder 50 caracteres',
          pattern: 'El nombre solo puede contener letras y espacios',
        },
      },
      variety: {
        required: false,
        maxLength: 30,
        message: {
          maxLength: 'La variedad no puede exceder 30 caracteres',
        },
      },
      category: {
        required: true,
        customValidator: value => {
          if (!value) return null
          return isValidCategoryId(value) ? null : 'Categoría no válida'
        },
        message: {
          required: 'Debes seleccionar una categoría',
        },
      },
      description: {
        required: true,
        minLength: 10,
        maxLength: 500,
        message: {
          required: 'La descripción es obligatoria',
          minLength: 'La descripción debe tener al menos 10 caracteres',
          maxLength: 'La descripción no puede exceder 500 caracteres',
        },
      },
      location: {
        required: false,
        maxLength: 100,
        message: {
          maxLength: 'La ubicación no puede exceder 100 caracteres',
        },
      },
      ownerPhone: {
        required: false,
        pattern: /^(\+593|0)\d{9,10}$/,
        message: {
          pattern: 'Ingresa un número válido (ej: +593987654321 o 0987654321)',
        },
      },
      exchangeNotes: {
        required: false,
        maxLength: 300,
        message: {
          maxLength: 'Las notas no pueden exceder 300 caracteres',
        },
      },
    }),
    []
  )

  // Combinar reglas por defecto con reglas personalizadas
  const rules = useMemo(() => {
    return { ...defaultRules, ...validationRules }
  }, [defaultRules, validationRules])

  /**
   * Valida un campo específico
   * @param {string} fieldName - Nombre del campo
   * @param {any} value - Valor del campo
   * @returns {string|null} - Mensaje de error o null si es válido
   */
  const validateField = useCallback(
    (fieldName, value) => {
      const rule = rules[fieldName]
      if (!rule) return null

      const trimmedValue = typeof value === 'string' ? value.trim() : value

      // Validación de campo requerido
      if (rule.required && (!trimmedValue || trimmedValue === '')) {
        return rule.message.required
      }

      // Si el campo no es requerido y está vacío, no validar más
      if (!rule.required && (!trimmedValue || trimmedValue === '')) {
        return null
      }

      // Validación de longitud mínima
      if (rule.minLength && trimmedValue.length < rule.minLength) {
        return rule.message.minLength
      }

      // Validación de longitud máxima
      if (rule.maxLength && trimmedValue.length > rule.maxLength) {
        return rule.message.maxLength
      }

      // Validación de patrón
      if (rule.pattern && !rule.pattern.test(trimmedValue)) {
        return rule.message.pattern
      }

      // Validación personalizada
      if (rule.customValidator) {
        const customError = rule.customValidator(trimmedValue)
        if (customError) {
          return customError
        }
      }

      return null
    },
    [rules]
  )

  /**
   * Valida todos los campos del formulario
   * @returns {Object} - Objeto con errores por campo
   */
  const validateAllFields = useCallback(() => {
    const newErrors = {}

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })

    return newErrors
  }, [formData, validateField, rules])

  /**
   * Marca un campo como "tocado" y lo valida
   * @param {string} fieldName - Nombre del campo
   */
  const markFieldAsTouched = useCallback(
    fieldName => {
      setTouched(prev => ({ ...prev, [fieldName]: true }))

      // Validar solo este campo cuando se marca como tocado
      const error = validateField(fieldName, formData[fieldName])
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || undefined,
      }))

      // Actualizar estado general del formulario después del siguiente render
      setTimeout(() => {
        const allErrors = validateAllFields()
        const formIsValid =
          Object.keys(allErrors).filter(key => allErrors[key]).length === 0
        setIsValid(formIsValid)
      }, 0)
    },
    [validateField, formData, validateAllFields]
  )

  /**
   * Obtiene el estado de validación de un campo específico
   * @param {string} fieldName - Nombre del campo
   * @returns {Object} - Estado del campo (hasError, message, isValid, isTouched)
   */
  const getFieldState = useCallback(
    fieldName => {
      const error = errors[fieldName]
      const isTouched = touched[fieldName]
      const hasError = Boolean(error)
      const isValid = !hasError && isTouched

      return {
        hasError,
        isValid,
        isTouched,
        message: error || null,
      }
    },
    [errors, touched]
  )

  /**
   * Obtiene las clases CSS para un campo según su estado
   * @param {string} fieldName - Nombre del campo
   * @returns {string} - Clases CSS
   */
  const getFieldClasses = useCallback(
    fieldName => {
      const { hasError, isValid, isTouched } = getFieldState(fieldName)

      if (!isTouched) return ''
      if (hasError) return 'field-error'
      if (isValid) return 'field-valid'

      return ''
    },
    [getFieldState]
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
   * Obtiene un resumen del estado de validación
   * @returns {Object} - Resumen de validación
   */
  const getValidationSummary = useCallback(() => {
    const totalFields = Object.keys(rules).length
    const touchedFields = Object.keys(touched).length
    const errorFields = Object.keys(errors).length
    const validFields = touchedFields - errorFields

    return {
      totalFields,
      touchedFields,
      errorFields,
      validFields,
      isFormTouched: touchedFields > 0,
      isFormValid: isValid,
      completionPercentage: Math.round((validFields / totalFields) * 100),
    }
  }, [rules, touched, errors, isValid])

  /**
   * Valida todos los campos y actualiza el estado
   * Útil para validar antes de enviar el formulario
   */
  const validateAll = useCallback(() => {
    const newErrors = validateAllFields()
    setErrors(newErrors)

    // Marcar todos los campos como tocados
    const allFields = Object.keys(rules)
    const newTouched = {}
    allFields.forEach(field => {
      newTouched[field] = true
    })
    setTouched(newTouched)

    const formIsValid =
      Object.keys(newErrors).filter(key => newErrors[key]).length === 0
    setIsValid(formIsValid)
    return formIsValid
  }, [validateAllFields, rules])

  return {
    // Estado de validación
    errors,
    touched,
    isValid,

    // Funciones de validación
    validateField,
    validateAllFields,
    validateAll,
    markFieldAsTouched,
    resetValidation,

    // Helpers para UI
    getFieldState,
    getFieldClasses,
    getValidationSummary,

    // Estado derivado
    hasErrors: Object.keys(errors).length > 0,
    canSubmit: isValid && Object.keys(touched).length > 0,
  }
}

export default useFormValidator
