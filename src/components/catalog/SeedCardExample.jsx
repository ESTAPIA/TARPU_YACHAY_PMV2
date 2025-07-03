// src/components/catalog/SeedCardExample.jsx
// BLOQUE 6 - PASO 3: Ejemplo de uso del componente SeedCard
//
// Este componente demuestra el uso de SeedCard con datos de ejemplo
// y diferentes estados (disponible, no disponible, loading)

import React, { useState } from 'react'
import SeedCard from './SeedCard'

function SeedCardExample() {
  const [selectedSeed, setSelectedSeed] = useState(null)

  // Datos de ejemplo para las tarjetas
  const exampleSeeds = [
    {
      id: '1',
      name: 'Tomate Cherry',
      variety: 'Sweet 100',
      category: 'hortalizas',
      location: 'Quito, Pichincha',
      imageUrl:
        'https://images.unsplash.com/photo-1592841200221-4e1f8d9af378?w=300',
      ownerName: 'María González',
      isAvailableForExchange: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Maíz Blanco',
      variety: 'Choclo Ecuatoriano',
      category: 'cereales',
      location: 'Otavalo, Imbabura',
      imageUrl:
        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300',
      ownerName: 'Carlos Imbaquingo',
      isAvailableForExchange: false,
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      name: 'Fréjol Rojo',
      variety: '',
      category: 'legumbres',
      location: 'Ambato, Tungurahua',
      imageUrl: '', // URL vacía para probar el fallback
      ownerName: 'Ana Pérez',
      isAvailableForExchange: true,
      createdAt: new Date('2024-01-12'),
    },
    {
      id: '4',
      name: 'Quinua',
      variety: 'Pata de Venado',
      category: 'cereales',
      location: 'Latacunga, Cotopaxi',
      imageUrl:
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
      ownerName: 'Luis Toapanta',
      isAvailableForExchange: true,
      createdAt: new Date('2024-01-08'),
    },
  ]

  // Manejar click en tarjeta
  const handleSeedClick = seed => {
    setSelectedSeed(seed)
    console.log('Semilla seleccionada:', seed)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', color: '#2e7d32' }}>
        Ejemplo de SeedCard - Catálogo de Semillas
      </h2>

      {/* Grid de tarjetas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {exampleSeeds.map(seed => (
          <SeedCard
            key={seed.id}
            seed={seed}
            onClick={handleSeedClick}
            loading={false}
          />
        ))}
      </div>

      {/* Ejemplo con estado de loading */}
      <h3 style={{ marginBottom: '16px', color: '#555' }}>
        Estado de carga (loading):
      </h3>
      <div style={{ maxWidth: '320px', marginBottom: '30px' }}>
        <SeedCard
          seed={exampleSeeds[0]}
          onClick={handleSeedClick}
          loading={true}
        />
      </div>

      {/* Información de la semilla seleccionada */}
      {selectedSeed && (
        <div
          style={{
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '30px',
          }}
        >
          <h3 style={{ color: '#2e7d32', marginBottom: '16px' }}>
            Semilla seleccionada:
          </h3>
          <pre
            style={{
              fontSize: '14px',
              background: 'white',
              padding: '16px',
              borderRadius: '4px',
            }}
          >
            {JSON.stringify(selectedSeed, null, 2)}
          </pre>
          <button
            onClick={() => setSelectedSeed(null)}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Limpiar selección
          </button>
        </div>
      )}

      {/* Instrucciones */}
      <div
        style={{
          background: '#e8f5e8',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '30px',
          borderLeft: '4px solid #4caf50',
        }}
      >
        <h4 style={{ color: '#2e7d32', marginBottom: '12px' }}>
          Funcionalidades demostradas:
        </h4>
        <ul style={{ color: '#555', lineHeight: '1.6' }}>
          <li>🖱️ Click en las tarjetas para seleccionar semillas</li>
          <li>📱 Diseño responsive que se adapta al ancho disponible</li>
          <li>
            🟢 Badge de disponibilidad (verde = disponible, rojo = no
            disponible)
          </li>
          <li>
            🖼️ Manejo de imágenes con fallback cuando no están disponibles
          </li>
          <li>⏳ Estado de loading con animación visual</li>
          <li>♿ Navegación por teclado (Tab + Enter)</li>
          <li>
            📊 Información estructurada (categoría, ubicación, propietario,
            fecha)
          </li>
        </ul>
      </div>

      {/* Nota técnica */}
      <div
        style={{
          background: '#fff3e0',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '20px',
          borderLeft: '4px solid #ff9800',
        }}
      >
        <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
          <strong>Nota técnica:</strong> Este componente está listo para
          integrarse en el paso 5 junto con SearchBar y el servicio
          seedCatalogService. Los estilos son responsive y siguen las mejores
          prácticas de accesibilidad.
        </p>
      </div>
    </div>
  )
}

export default SeedCardExample
