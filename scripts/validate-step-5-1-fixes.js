#!/usr/bin/env node

/**
 * Validador para el Paso 5.1: Corrección de errores en HomePage
 *
 * Valida que:
 * 1. LanguageSwitch use correctamente 'changeLanguage' en lugar de 'setLanguage'
 * 2. Todas las claves de traducción 'home.*' estén presentes
 * 3. Los archivos de traducción tengan estructura consistente
 * 4. No haya errores sintácticos en los archivos JSON
 */

const fs = require('fs')
const path = require('path')

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function validateStep5_1() {
  log(
    '\n🔍 Validando Paso 5.1: Corrección de errores en HomePage\n',
    colors.blue
  )

  let errors = []
  let warnings = []

  // 1. Validar LanguageSwitch.jsx
  log('1. Validando LanguageSwitch.jsx...', colors.yellow)

  const languageSwitchPath = path.join(
    __dirname,
    '../src/components/ui/LanguageSwitch.jsx'
  )

  if (!fs.existsSync(languageSwitchPath)) {
    errors.push('LanguageSwitch.jsx no encontrado')
  } else {
    const languageSwitchContent = fs.readFileSync(languageSwitchPath, 'utf-8')

    // Verificar que use 'changeLanguage' en lugar de 'setLanguage'
    if (languageSwitchContent.includes('setLanguage')) {
      errors.push(
        'LanguageSwitch.jsx aún usa "setLanguage" en lugar de "changeLanguage"'
      )
    }

    if (languageSwitchContent.includes('changeLanguage')) {
      log('  ✅ Usa correctamente "changeLanguage"', colors.green)
    } else {
      errors.push('LanguageSwitch.jsx no usa "changeLanguage"')
    }

    // Verificar que use 'currentLanguage' en lugar de 'language'
    if (
      languageSwitchContent.includes(
        'const { currentLanguage, changeLanguage }'
      )
    ) {
      log('  ✅ Usa correctamente "currentLanguage"', colors.green)
    } else {
      errors.push('LanguageSwitch.jsx no usa "currentLanguage"')
    }
  }

  // 2. Validar traducciones en español
  log('\n2. Validando traducciones en español...', colors.yellow)

  const esTranslationsPath = path.join(
    __dirname,
    '../src/i18n/translations/es.json'
  )

  if (!fs.existsSync(esTranslationsPath)) {
    errors.push('Archivo de traducciones es.json no encontrado')
  } else {
    try {
      const esTranslations = JSON.parse(
        fs.readFileSync(esTranslationsPath, 'utf-8')
      )

      // Verificar claves requeridas
      const requiredKeys = [
        'home.stats.seedsRegistered',
        'home.stats.exchangesPending',
        'home.stats.exchangesCompleted',
        'home.quickActions.title',
        'home.quickActions.addSeed.title',
        'home.quickActions.addSeed.text',
        'home.quickActions.addSeed.button',
        'home.quickActions.catalog.title',
        'home.quickActions.catalog.text',
        'home.quickActions.catalog.button',
        'home.recentActivity.title',
        'home.recentActivity.empty',
        'home.recentActivity.subtext',
        'home.about.title',
        'home.about.description',
        'home.about.readMore',
        'home.about.readLess',
        'home.about.collapsible.project',
        'home.about.collapsible.purposeTitle',
        'home.about.collapsible.purpose',
        'home.about.collapsible.thanksTitle',
        'home.about.collapsible.thanks',
        'home.about.collapsible.gad',
        'home.about.collapsible.teamTitle',
        'home.about.collapsible.team.raul',
        'home.about.collapsible.team.danny',
        'home.about.collapsible.team.carlos',
        'home.about.collapsible.team.anthony',
        'home.about.collapsible.team.saul',
        'home.about.collapsible.professorLabel',
        'home.about.collapsible.puce',
        'home.about.collapsible.innovation',
        'home.about.collapsible.aps',
        'home.retry',
      ]

      const missingKeys = requiredKeys.filter(key => {
        const keys = key.split('.')
        let current = esTranslations

        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k]
          } else {
            return true // Missing key
          }
        }

        return false
      })

      if (missingKeys.length === 0) {
        log('  ✅ Todas las claves requeridas están presentes', colors.green)
      } else {
        errors.push(`Claves faltantes en es.json: ${missingKeys.join(', ')}`)
      }

      // Verificar que existe sección home
      if (esTranslations.home) {
        log('  ✅ Sección "home" encontrada', colors.green)
      } else {
        errors.push('Sección "home" no encontrada en es.json')
      }
    } catch (error) {
      errors.push(`Error al parsear es.json: ${error.message}`)
    }
  }

  // 3. Validar traducciones en Kichwa
  log('\n3. Validando traducciones en Kichwa...', colors.yellow)

  const kiTranslationsPath = path.join(
    __dirname,
    '../src/i18n/translations/ki.json'
  )

  if (!fs.existsSync(kiTranslationsPath)) {
    errors.push('Archivo de traducciones ki.json no encontrado')
  } else {
    try {
      const kiTranslations = JSON.parse(
        fs.readFileSync(kiTranslationsPath, 'utf-8')
      )

      // Verificar claves requeridas (mismas que en español)
      const requiredKeys = [
        'home.stats.seedsRegistered',
        'home.stats.exchangesPending',
        'home.stats.exchangesCompleted',
        'home.quickActions.title',
        'home.quickActions.addSeed.title',
        'home.quickActions.addSeed.text',
        'home.quickActions.addSeed.button',
        'home.quickActions.catalog.title',
        'home.quickActions.catalog.text',
        'home.quickActions.catalog.button',
        'home.recentActivity.title',
        'home.recentActivity.empty',
        'home.recentActivity.subtext',
        'home.about.title',
        'home.about.description',
        'home.about.readMore',
        'home.about.readLess',
        'home.about.collapsible.project',
        'home.about.collapsible.purposeTitle',
        'home.about.collapsible.purpose',
        'home.about.collapsible.thanksTitle',
        'home.about.collapsible.thanks',
        'home.about.collapsible.gad',
        'home.about.collapsible.teamTitle',
        'home.about.collapsible.team.raul',
        'home.about.collapsible.team.danny',
        'home.about.collapsible.team.carlos',
        'home.about.collapsible.team.anthony',
        'home.about.collapsible.team.saul',
        'home.about.collapsible.professorLabel',
        'home.about.collapsible.puce',
        'home.about.collapsible.innovation',
        'home.about.collapsible.aps',
        'home.retry',
      ]

      const missingKeys = requiredKeys.filter(key => {
        const keys = key.split('.')
        let current = kiTranslations

        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k]
          } else {
            return true // Missing key
          }
        }

        return false
      })

      if (missingKeys.length === 0) {
        log('  ✅ Todas las claves requeridas están presentes', colors.green)
      } else {
        errors.push(`Claves faltantes en ki.json: ${missingKeys.join(', ')}`)
      }

      // Verificar que existe sección home
      if (kiTranslations.home) {
        log('  ✅ Sección "home" encontrada', colors.green)
      } else {
        errors.push('Sección "home" no encontrada en ki.json')
      }
    } catch (error) {
      errors.push(`Error al parsear ki.json: ${error.message}`)
    }
  }

  // 4. Validar HomePage.jsx
  log('\n4. Validando HomePage.jsx...', colors.yellow)

  const homePagePath = path.join(__dirname, '../src/pages/HomePage.jsx')

  if (!fs.existsSync(homePagePath)) {
    errors.push('HomePage.jsx no encontrado')
  } else {
    const homePageContent = fs.readFileSync(homePagePath, 'utf-8')

    // Verificar que use useTranslation
    if (homePageContent.includes('useTranslation')) {
      log('  ✅ Usa el hook useTranslation', colors.green)
    } else {
      errors.push('HomePage.jsx no usa useTranslation')
    }

    // Verificar que use las claves de traducción
    if (homePageContent.includes("t('home.")) {
      log('  ✅ Usa claves de traducción home.*', colors.green)
    } else {
      warnings.push('HomePage.jsx no parece usar claves de traducción home.*')
    }
  }

  // Resumen
  log('\n📊 Resumen de validación:', colors.bold)

  if (errors.length === 0) {
    log('✅ Todas las validaciones pasaron correctamente', colors.green)
    log('🎉 Paso 5.1 completado exitosamente', colors.green)
  } else {
    log('❌ Se encontraron errores:', colors.red)
    errors.forEach(error => log(`  - ${error}`, colors.red))
  }

  if (warnings.length > 0) {
    log('\n⚠️  Advertencias:', colors.yellow)
    warnings.forEach(warning => log(`  - ${warning}`, colors.yellow))
  }

  log(
    '\n🚀 Próximo paso: Validar la funcionalidad en el navegador',
    colors.blue
  )
  log('   1. Iniciar la aplicación: npm start', colors.blue)
  log('   2. Navegar a la página de inicio', colors.blue)
  log('   3. Probar el cambio de idioma', colors.blue)
  log(
    '   4. Verificar que todos los textos se traduzcan correctamente',
    colors.blue
  )

  return errors.length === 0
}

// Ejecutar validación
if (require.main === module) {
  const success = validateStep5_1()
  process.exit(success ? 0 : 1)
}

module.exports = { validateStep5_1 }
