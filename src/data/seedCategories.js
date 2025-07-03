// src/data/seedCategories.js
// BLOQUE 5 - PASO 3: Configuración de categorías predefinidas
//
// Sistema de categorías estándar para semillas, organizadas por tipo
// y características comunes en agricultura andina y familiar.
//
// Estructura:
// - id: identificador único
// - name: nombre de la categoría
// - icon: emoji representativo
// - description: descripción breve
// - examples: ejemplos de semillas/plantas típicas
// - keywords: palabras clave para búsqueda/filtro

/**
 * @typedef {Object} SeedCategory
 * @property {string} id - Identificador único de la categoría
 * @property {string} name - Nombre de la categoría
 * @property {string} icon - Emoji representativo
 * @property {string} description - Descripción breve de la categoría
 * @property {string[]} examples - Ejemplos de semillas/plantas típicas
 * @property {string[]} keywords - Palabras clave para búsqueda
 */

/**
 * Categorías estándar de semillas para Tarpu Yachay
 * @type {SeedCategory[]}
 */
export const seedCategories = [
  {
    id: 'cereales',
    name: 'Cereales',
    icon: '🌽',
    description: 'Plantas gramíneas cultivadas por sus granos',
    examples: ['Maíz', 'Quinua', 'Amaranto', 'Trigo', 'Cebada', 'Avena'],
    keywords: [
      'maiz',
      'quinua',
      'amaranto',
      'trigo',
      'cebada',
      'avena',
      'grano',
      'cereal',
    ],
  },
  {
    id: 'legumbres',
    name: 'Legumbres',
    icon: '🫘',
    description: 'Plantas de la familia de las leguminosas',
    examples: ['Frijol', 'Haba', 'Arveja', 'Lenteja', 'Garbanzo', 'Lupino'],
    keywords: [
      'frijol',
      'haba',
      'arveja',
      'lenteja',
      'garbanzo',
      'lupino',
      'leguminosa',
      'vaina',
    ],
  },
  {
    id: 'hortalizas',
    name: 'Hortalizas',
    icon: '🥬',
    description: 'Plantas comestibles cultivadas en huertos',
    examples: [
      'Lechuga',
      'Zanahoria',
      'Brócoli',
      'Tomate',
      'Pimiento',
      'Cebolla',
    ],
    keywords: [
      'lechuga',
      'zanahoria',
      'brocoli',
      'tomate',
      'pimiento',
      'cebolla',
      'verdura',
      'hortaliza',
    ],
  },
  {
    id: 'frutales',
    name: 'Frutales',
    icon: '🍎',
    description: 'Árboles y plantas que producen frutas',
    examples: ['Manzana', 'Durazno', 'Capulí', 'Mora', 'Fresa', 'Babaco'],
    keywords: [
      'manzana',
      'durazno',
      'capuli',
      'mora',
      'fresa',
      'babaco',
      'fruta',
      'frutal',
      'arbol',
    ],
  },
  {
    id: 'aromaticas',
    name: 'Aromáticas',
    icon: '🌿',
    description: 'Plantas aromáticas y medicinales',
    examples: [
      'Cilantro',
      'Perejil',
      'Orégano',
      'Hierba buena',
      'Manzanilla',
      'Toronjil',
    ],
    keywords: [
      'cilantro',
      'perejil',
      'oregano',
      'hierba',
      'manzanilla',
      'toronjil',
      'aromatica',
      'medicinal',
    ],
  },
  {
    id: 'otros',
    name: 'Otros',
    icon: '🌱',
    description: 'Otras plantas y semillas no clasificadas',
    examples: [
      'Plantas ornamentales',
      'Variedades especiales',
      'Semillas experimentales',
    ],
    keywords: [
      'otro',
      'especial',
      'ornamental',
      'experimental',
      'varios',
      'miscelaneo',
    ],
  },
]

/**
 * Obtiene una categoría por su ID
 * @param {string} id - ID de la categoría
 * @returns {SeedCategory|undefined} - Categoría encontrada o undefined
 */
export const getCategoryById = id => {
  return seedCategories.find(category => category.id === id)
}

/**
 * Filtra categorías por texto de búsqueda
 * @param {string} searchText - Texto de búsqueda
 * @returns {SeedCategory[]} - Categorías que coinciden con la búsqueda
 */
export const filterCategories = (searchText = '') => {
  if (!searchText.trim()) {
    return seedCategories
  }

  const searchLower = searchText.toLowerCase().trim()

  return seedCategories.filter(category => {
    // Buscar en nombre
    if (category.name.toLowerCase().includes(searchLower)) {
      return true
    }

    // Buscar en palabras clave
    if (category.keywords.some(keyword => keyword.includes(searchLower))) {
      return true
    }

    // Buscar en ejemplos
    if (
      category.examples.some(example =>
        example.toLowerCase().includes(searchLower)
      )
    ) {
      return true
    }

    return false
  })
}

/**
 * Obtiene todas las categorías formateadas para un selector
 * @returns {Array<{value: string, label: string, icon: string}>}
 */
export const getCategoriesForSelect = () => {
  return seedCategories.map(category => ({
    value: category.id,
    label: category.name,
    icon: category.icon,
    description: category.description,
  }))
}

/**
 * Valida si un ID de categoría es válido
 * @param {string} categoryId - ID de categoría a validar
 * @returns {boolean} - true si es válido, false si no
 */
export const isValidCategoryId = categoryId => {
  return seedCategories.some(category => category.id === categoryId)
}

/**
 * Devuelve el nombre legible de una categoría por su ID
 * @param {string} categoryId - ID de la categoría
 * @returns {string} - Nombre de la categoría o el ID si no existe
 */
export const getCategoryDisplayName = categoryId => {
  const cat = seedCategories.find(c => c.id === categoryId)
  return cat ? cat.name : categoryId
}

export default seedCategories
