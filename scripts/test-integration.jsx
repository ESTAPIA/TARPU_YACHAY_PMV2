// Test básico para verificar la integración del sistema i18n
import { LanguageProvider } from './i18n/LanguageContext'
import { useTranslation } from './i18n/useTranslation'

function TestComponent() {
  const { t, currentLanguage, changeLanguage } = useTranslation()

  return (
    <div>
      <h1>{t('common.app_name')}</h1>
      <p>Idioma actual: {currentLanguage}</p>
      <button onClick={() => changeLanguage('ki')}>
        {t('common.change_language')}
      </button>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
}

export default App

// Este es un test básico para verificar que el sistema funciona
// No es necesario ejecutar esto, solo es para confirmar que la integración está bien
