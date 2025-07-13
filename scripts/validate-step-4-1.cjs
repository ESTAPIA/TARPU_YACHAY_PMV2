// scripts/validate-step-4-1.cjs
// Script de validación para Paso 4.1: Integración con el Sistema Principal

const fs = require('fs')
const path = require('path')

console.log('🔍 Validando Paso 4.1: Integración con el Sistema Principal\n')

// Función para verificar archivos
function validateFile(filePath, validations) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    console.log(`📄 Validando: ${filePath}`)

    let allValid = true
    validations.forEach(({ check, message }) => {
      const isValid = check(content)
      console.log(`  ${isValid ? '✅' : '❌'} ${message}`)
      if (!isValid) allValid = false
    })

    console.log('')
    return allValid
  } catch (error) {
    console.log(`❌ Error leyendo archivo: ${filePath}`)
    console.log(`   ${error.message}\n`)
    return false
  }
}

// Validaciones para App.jsx
const appValidations = [
  {
    check: content =>
      content.includes(
        "import { LanguageProvider } from './i18n/LanguageContext'"
      ),
    message: 'Import de LanguageProvider',
  },
  {
    check: content =>
      content.includes("import { AuthProvider } from './contexts/AuthContext'"),
    message: 'Import de AuthProvider',
  },
  {
    check: content =>
      content.includes(
        "import { OfflineProvider } from './contexts/OfflineContext'"
      ),
    message: 'Import de OfflineProvider',
  },
  {
    check: content =>
      content.includes(
        "import { NotificationProvider } from './contexts/NotificationContext'"
      ),
    message: 'Import de NotificationProvider',
  },
  {
    check: content => {
      const providerPattern =
        /<LanguageProvider>\s*<AuthProvider>\s*<OfflineProvider>\s*<NotificationProvider>/s
      return providerPattern.test(content)
    },
    message: 'Jerarquía correcta de providers',
  },
  {
    check: content => {
      const closingPattern =
        /<\/NotificationProvider>\s*<\/OfflineProvider>\s*<\/AuthProvider>\s*<\/LanguageProvider>/s
      return closingPattern.test(content)
    },
    message: 'Cierre correcto de providers',
  },
]

// Ejecutar validaciones
let allValid = true

allValid &= validateFile('src/App.jsx', appValidations)

// Verificar que los archivos de dependencias existan
const requiredFiles = [
  'src/i18n/LanguageContext.jsx',
  'src/contexts/AuthContext.jsx',
  'src/contexts/OfflineContext.jsx',
  'src/contexts/NotificationContext.jsx',
  'src/router/AppRouter.jsx',
]

console.log('📋 Verificando archivos de dependencias:')
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allValid = false
})

console.log('\n📊 Resultado final:')
if (allValid) {
  console.log('✅ Paso 4.1 completado correctamente')
  console.log('🎯 App.jsx configurado con la jerarquía correcta de providers')
  console.log('🔗 Todas las dependencias están disponibles')
} else {
  console.log('❌ Se encontraron problemas en el Paso 4.1')
  console.log('🔧 Revisa los errores arriba y corrige antes de continuar')
}

process.exit(allValid ? 0 : 1)
