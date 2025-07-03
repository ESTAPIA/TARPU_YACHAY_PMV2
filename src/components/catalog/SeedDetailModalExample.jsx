// src/components/catalog/SeedDetailModalExample.jsx
// BLOQUE 6 - PASO 4: Ejemplo de uso del componente SeedDetailModal
//
// Este componente demuestra el uso del SeedDetailModal
// integrado con SeedCard para testing manual

import React, { useState } from 'react'
import SeedCard from './SeedCard'
import SeedDetailModal from './SeedDetailModal'

function SeedDetailModalExample() {
  const [selectedSeed, setSelectedSeed] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [exchangeRequested, setExchangeRequested] = useState(false)

  // Datos de ejemplo con información completa para el modal
  const exampleSeeds = [
    {
      id: '1',
      name: 'Tomate Cherry',
      variety: 'Sweet 100',
      category: 'hortalizas',
      description:
        'Variedad de tomate cherry dulce y jugoso, ideal para ensaladas y consumo fresco. Se adapta bien al clima andino y produce frutos pequeños pero abundantes durante toda la temporada.',
      location: 'Quito, Pichincha',
      imageUrl:
        'https://images.unsplash.com/photo-1592841200221-4e1f8d9af378?w=500',
      ownerName: 'María González',
      isAvailableForExchange: true,
      exchangeNotes:
        'Busco intercambiar por semillas de lechuga o rábano. Disponible a partir de marzo.',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Maíz Blanco',
      variety: 'Choclo Ecuatoriano',
      category: 'cereales',
      description:
        'Maíz blanco tradicional ecuatoriano, ideal para choclo tierno. Grano grande y dulce, muy apreciado en la gastronomía local. Ciclo de cultivo de 6 meses.',
      location: 'Otavalo, Imbabura',
      imageUrl:
        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500',
      ownerName: 'Carlos Imbaquingo',
      isAvailableForExchange: false,
      exchangeNotes: '',
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      name: 'Quinua Roja',
      variety: 'Pata de Venado',
      category: 'cereales',
      description:
        'Quinua roja ancestral de los Andes, resistente a heladas y sequías. Alto contenido proteico y nutricional. Ideal para sopas, ensaladas y preparaciones tradicionales.',
      location: 'Latacunga, Cotopaxi',
      imageUrl: '', // Sin imagen para probar fallback
      ownerName: 'Luis Toapanta',
      isAvailableForExchange: true,
      exchangeNotes:
        'Intercambio por semillas de hortalizas o legumbres. Tengo disponible 1kg de semilla.',
      createdAt: new Date('2024-01-08'),
    },
  ]

  // Manejar click en tarjeta para abrir modal
  const handleSeedClick = seed => {
    setSelectedSeed(seed)
    setIsModalOpen(true)
    setExchangeRequested(false)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSeed(null)
    setExchangeRequested(false)
  }

  // Manejar solicitud de intercambio
  const handleRequestExchange = seed => {
    setExchangeRequested(true)
    setTimeout(() => setExchangeRequested(false), 1500)
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h2
        style={{ textAlign: 'center', marginBottom: '24px', color: '#2e7d32' }}
      >
        Ejemplo de SeedDetailModal - Pruebas Manuales
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>
        Haz clic en cualquier tarjeta para ver el modal de detalles.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {exampleSeeds.map(seed => (
          <SeedCard
            key={seed.id}
            seed={seed}
            onClick={() => handleSeedClick(seed)}
            loading={false}
          />
        ))}
      </div>
      <SeedDetailModal
        seed={selectedSeed}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRequestExchange={
          selectedSeed ? () => handleRequestExchange(selectedSeed) : undefined
        }
      />
      {exchangeRequested && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: '#4caf50',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 9999,
            fontWeight: 600,
          }}
        >
          Solicitud de intercambio enviada (simulado)
        </div>
      )}
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
          ¿Qué puedes probar aquí?
        </h4>
        <ul style={{ color: '#555', lineHeight: '1.6' }}>
          <li>🖱️ Abrir/cerrar el modal de detalles de semilla</li>
          <li>🖼️ Visualizar imagen principal y zoom básico</li>
          <li>📋 Ver toda la información relevante de la semilla</li>
          <li>👤 Ver datos del propietario (solo nombre y ubicación)</li>
          <li>
            🔄 Probar el botón de "Solicitar intercambio" (solo si está
            disponible)
          </li>
          <li>📱 Comprobar diseño responsive y accesibilidad básica</li>
        </ul>
      </div>
    </div>
  )
}

export default SeedDetailModalExample
