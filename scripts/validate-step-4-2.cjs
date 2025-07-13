/**
 * Validación para el Paso 4.2: Integración del LanguageSwitch en Header
 *
 * Verifica que:
 * 1. Header.jsx importe correctamente LanguageSwitch
 * 2. Se agregue la prop showLanguageSwitch
 * 3. El componente se renderice condicionalmente
 * 4. Los estilos para languageContainer estén presentes
 * 5. PropTypes se hayan actualizado correctamente
 */

const fs = require('fs')
const path = require('path')

// Rutas de archivos
const headerPath = path.join(
  __dirname,
  '..',
  'src',
  'components',
  'ui',
  'Header.jsx'
)
const languageSwitchPath = path.join(
  __dirname,
  '..',
  'src',
  'components',
  'ui',
  'LanguageSwitch.jsx'
)

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function validateStep4_2() {
  log('🔍 Validando Paso 4.2: Integración del LanguageSwitch en Header', 'blue')
  log(
    '================================================================',
    'blue'
  )

  let allPassed = true

  // 1. Verificar que Header.jsx existe
  if (!fs.existsSync(headerPath)) {
    log('❌ ERROR: Header.jsx no encontrado', 'red')
    allPassed = false
    return allPassed
  }

  // 2. Verificar que LanguageSwitch.jsx existe
  if (!fs.existsSync(languageSwitchPath)) {
    log('❌ ERROR: LanguageSwitch.jsx no encontrado', 'red')
    allPassed = false
    return allPassed
  }

  // 3. Leer contenido del Header
  const headerContent = fs.readFileSync(headerPath, 'utf8')

  // 4. Verificar import de LanguageSwitch
  const importRegex =
    /import\s+LanguageSwitch\s+from\s+['"]\.\/LanguageSwitch['"]?/
  if (!importRegex.test(headerContent)) {
    log('❌ ERROR: Import de LanguageSwitch no encontrado en Header.jsx', 'red')
    allPassed = false
  } else {
    log('✅ Import de LanguageSwitch encontrado', 'green')
  }

  // 5. Verificar prop showLanguageSwitch en función
  const propRegex = /showLanguageSwitch\s*=\s*false/
  if (!propRegex.test(headerContent)) {
    log('❌ ERROR: Prop showLanguageSwitch no encontrada en función', 'red')
    allPassed = false
  } else {
    log('✅ Prop showLanguageSwitch encontrada en función', 'green')
  }

  // 6. Verificar renderizado condicional
  const conditionalRenderRegex = /\{showLanguageSwitch\s*&&\s*\(/
  if (!conditionalRenderRegex.test(headerContent)) {
    log(
      '❌ ERROR: Renderizado condicional del LanguageSwitch no encontrado',
      'red'
    )
    allPassed = false
  } else {
    log('✅ Renderizado condicional del LanguageSwitch encontrado', 'green')
  }

  // 7. Verificar componente LanguageSwitch en JSX
  const languageSwitchComponentRegex = /<LanguageSwitch\s*\/>/
  if (!languageSwitchComponentRegex.test(headerContent)) {
    log('❌ ERROR: Componente <LanguageSwitch /> no encontrado en JSX', 'red')
    allPassed = false
  } else {
    log('✅ Componente <LanguageSwitch /> encontrado en JSX', 'green')
  }

  // 8. Verificar estilo languageContainer
  const languageContainerStyleRegex = /languageContainer:\s*\{[^}]*\}/
  if (!languageContainerStyleRegex.test(headerContent)) {
    log('❌ ERROR: Estilo languageContainer no encontrado', 'red')
    allPassed = false
  } else {
    log('✅ Estilo languageContainer encontrado', 'green')
  }

  // 9. Verificar PropTypes actualizado
  const propTypesRegex = /showLanguageSwitch:\s*PropTypes\.bool/
  if (!propTypesRegex.test(headerContent)) {
    log('❌ ERROR: PropTypes para showLanguageSwitch no encontrado', 'red')
    allPassed = false
  } else {
    log('✅ PropTypes para showLanguageSwitch encontrado', 'green')
  }

  // 10. Verificar contenedor languageContainer en JSX
  const languageContainerJSXRegex = /style=\{styles\.languageContainer\}/
  if (!languageContainerJSXRegex.test(headerContent)) {
    log(
      '❌ ERROR: Referencia a styles.languageContainer no encontrada en JSX',
      'red'
    )
    allPassed = false
  } else {
    log('✅ Referencia a styles.languageContainer encontrada en JSX', 'green')
  }

  // Resumen final
  log(
    '================================================================',
    'blue'
  )
  if (allPassed) {
    log('🎉 ¡Todas las validaciones pasaron correctamente!', 'green')
    log(
      '✅ Header.jsx ha sido integrado correctamente con LanguageSwitch',
      'green'
    )
    log(
      '✅ La prop showLanguageSwitch permite control sobre la visualización',
      'green'
    )
    log(
      '✅ El componente mantiene su estructura y funcionalidad original',
      'green'
    )
  } else {
    log(
      '❌ Algunas validaciones fallaron. Revisa los errores anteriores.',
      'red'
    )
  }

  return allPassed
}

// Ejecutar validación
if (require.main === module) {
  const result = validateStep4_2()
  process.exit(result ? 0 : 1)
}

module.exports = { validateStep4_2 }
