/**
 * UserStatsCard - Componente reutilizable para mostrar tarjetas de estadísticas de usuario
 *
 * BLOQUE 8 - PASO 3.2: Componente modular para tarjetas de estadísticas del perfil
 *
 * @author Tarpu Yachay - PMV2
 * @version 1.0.0
 * @description Componente reutilizable que renderiza tarjetas de estadísticas con diferentes
 * estados (normal, loading, clickable), tamaños y estilos personalizables.
 *
 * CARACTERÍSTICAS:
 * - Estados: normal, loading, clickable con hover
 * - Tamaños: small, medium, large
 * - Props configurables: title, value, icon, color, clickable, onClick
 * - Soporte para skeleton loading
 * - Estilos responsivos y accesibles
 *
 * USO:
 * ```jsx
 * // Tarjeta básica (no clickeable)
 * <UserStatsCard
 *   title="Semillas registradas"
 *   value={25}
 *   icon="🌱"
 * />
 *
 * // Tarjeta clickeable con acción
 * <UserStatsCard
 *   title="Intercambios completados"
 *   value={12}
 *   icon="✅"
 *   clickable={true}
 *   onClick={() => navigate('/exchanges')}
 * />
 *
 * // Tarjeta en estado loading
 * <UserStatsCard
 *   title="Cargando..."
 *   value="---"
 *   icon="⏳"
 *   loading={true}
 * />
 *
 * // Tarjeta con tamaño personalizado
 * <UserStatsCard
 *   title="Total de semillas"
 *   value={150}
 *   icon="📦"
 *   size="large"
 *   color="primary"
 * />
 * ```
 */

import React from 'react'
import PropTypes from 'prop-types'

/**
 * Componente UserStatsCard
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título/etiqueta de la estadística
 * @param {string|number} props.value - Valor numérico o texto de la estadística
 * @param {string} props.icon - Emoji o icono a mostrar
 * @param {string} [props.color='default'] - Tema de color: 'default', 'primary', 'success', 'warning', 'danger'
 * @param {boolean} [props.clickable=false] - Si la tarjeta es clickeable
 * @param {Function} [props.onClick] - Función a ejecutar al hacer click (solo si clickable=true)
 * @param {string} [props.size='medium'] - Tamaño de la tarjeta: 'small', 'medium', 'large'
 * @param {boolean} [props.loading=false] - Si mostrar estado de carga
 * @param {string} [props.className=''] - Clases CSS adicionales
 * @param {string} [props.title] - Atributo title para tooltip
 */
const UserStatsCard = ({
  title,
  value,
  icon,
  color = 'default',
  clickable = false,
  onClick,
  size = 'medium',
  loading = false,
  className = '',
  ...otherProps
}) => {
  // Construir clases CSS dinámicamente
  const getCardClasses = () => {
    const baseClasses = ['stat-card']

    // Agregar modificadores
    if (clickable && !loading) {
      baseClasses.push('stat-card--clickable')
    }

    if (loading) {
      baseClasses.push('stat-card--loading')
    }

    if (size !== 'medium') {
      baseClasses.push(`stat-card--${size}`)
    }

    if (color !== 'default') {
      baseClasses.push(`stat-card--${color}`)
    }

    // Agregar clases adicionales
    if (className) {
      baseClasses.push(className)
    }

    return baseClasses.join(' ')
  }

  // Manejar click solo si es clickeable y no está cargando
  const handleClick = () => {
    if (clickable && !loading && onClick) {
      onClick()
    }
  }

  // Determinar el elemento a renderizar (div o button)
  const Element = clickable && !loading ? 'button' : 'div'

  return (
    <Element
      className={getCardClasses()}
      onClick={handleClick}
      disabled={loading}
      type={clickable && !loading ? 'button' : undefined}
      {...otherProps}
    >
      {/* Icono */}
      <div className="stat-icon">{loading ? '⏳' : icon}</div>

      {/* Información principal */}
      <div className="stat-info">
        <div className="stat-number">{loading ? '---' : value}</div>
        <div className="stat-label">{loading ? 'Cargando...' : title}</div>
      </div>

      {/* Flecha indicadora (solo para clickeable y no loading) */}
      {clickable && !loading && <div className="stat-arrow">→</div>}
    </Element>
  )
}

// Validación de props
UserStatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'warning',
    'danger',
  ]),
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  loading: PropTypes.bool,
  className: PropTypes.string,
}

// Valores por defecto
UserStatsCard.defaultProps = {
  color: 'default',
  clickable: false,
  onClick: undefined,
  size: 'medium',
  loading: false,
  className: '',
}

export default UserStatsCard
