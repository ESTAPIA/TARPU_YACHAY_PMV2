/**
 * Ejemplo de uso del Header con LanguageSwitch integrado
 *
 * Este archivo demuestra cómo usar el Header con la nueva prop showLanguageSwitch
 * para mostrar el componente de cambio de idioma.
 */

import React from 'react'
import Header from '../src/components/ui/Header'
import { LanguageProvider } from '../src/i18n/LanguageContext'

// Ejemplo básico: Header sin LanguageSwitch
function ExampleBasicHeader() {
  return (
    <Header
      title="Tarpu Yachay"
      subtitle="Intercambio de Semillas"
      icon="🌱"
      variant="primary"
      centered={true}
    />
  )
}

// Ejemplo avanzado: Header con LanguageSwitch
function ExampleHeaderWithLanguageSwitch() {
  return (
    <Header
      title="Tarpu Yachay"
      subtitle="Intercambio de Semillas"
      icon="🌱"
      variant="primary"
      centered={true}
      showLanguageSwitch={true}
    />
  )
}

// Ejemplo con diferentes variantes
function ExampleHeaders() {
  return (
    <LanguageProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Principal con LanguageSwitch */}
        <Header
          title="Tarpu Yachay - PMV2"
          subtitle="Plataforma de Intercambio de Semillas"
          icon="🌱"
          variant="primary"
          centered={true}
          showLanguageSwitch={true}
        />

        {/* Header Secundario sin LanguageSwitch */}
        <Header
          title="Catálogo de Semillas"
          subtitle="Encuentra las semillas que necesitas"
          icon="🔍"
          variant="secondary"
          centered={true}
          showLanguageSwitch={false}
        />

        {/* Header de Perfil con LanguageSwitch */}
        <Header
          title="Mi Perfil"
          subtitle="Gestiona tu información personal"
          icon="👤"
          variant="success"
          centered={false}
          showLanguageSwitch={true}
        />

        {/* Header de Intercambios */}
        <Header
          title="Mis Intercambios"
          subtitle="Historial de intercambios realizados"
          icon="🔄"
          variant="warning"
          centered={false}
          showLanguageSwitch={false}
        />
      </div>
    </LanguageProvider>
  )
}

// Ejemplo de uso en una página completa
function ExamplePage() {
  return (
    <LanguageProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Header principal con LanguageSwitch */}
        <Header
          title="Tarpu Yachay"
          subtitle="Intercambio de Semillas - Comunidad Kichwa"
          icon="🌱"
          variant="primary"
          centered={true}
          showLanguageSwitch={true}
        />

        {/* Contenido de la página */}
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h2>Bienvenido a la Plataforma</h2>
          <p>
            Esta es una demostración de cómo el Header integrado con
            LanguageSwitch puede ser usado en diferentes contextos de la
            aplicación.
          </p>

          <div style={{ marginTop: '30px' }}>
            <h3>Características del Header integrado:</h3>
            <ul>
              <li>✅ Prop `showLanguageSwitch` para control opcional</li>
              <li>
                ✅ Mantiene todos los estilos y funcionalidades originales
              </li>
              <li>✅ Posicionamiento automático del LanguageSwitch</li>
              <li>✅ Compatible con todas las variantes existentes</li>
              <li>✅ Responsive y accesible</li>
            </ul>
          </div>
        </main>
      </div>
    </LanguageProvider>
  )
}

export {
  ExampleBasicHeader,
  ExampleHeaderWithLanguageSwitch,
  ExampleHeaders,
  ExamplePage,
}
