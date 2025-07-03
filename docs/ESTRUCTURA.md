# Estructura de Carpetas Inicial - Tarpu Yachay PMV2

Esta es la estructura base recomendada para el proyecto, pensada para escalabilidad y organización clara del código.

```
tarpu-yachay-pmv2/
├── public/                # Archivos estáticos públicos (favicon, manifest, etc.)
├── src/                   # Código fuente principal
│   ├── assets/            # Imágenes, íconos, fuentes, etc.
│   ├── components/        # Componentes reutilizables de React
│   ├── contexts/          # Contextos globales de React
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Vistas principales (rutas)
│   ├── services/          # Servicios y lógica de negocio (API, Firebase, etc.)
│   ├── styles/            # Estilos globales y utilitarios
│   └── utils/             # Funciones utilitarias generales
├── package.json           # Configuración de dependencias y scripts
├── vite.config.js         # Configuración de Vite
├── README.md              # Documentación principal del proyecto
└── ESTRUCTURA.md          # (Este archivo) Descripción de la estructura
```

## Descripción de carpetas principales

- **public/**: Recursos estáticos accesibles directamente por el navegador.
- **src/assets/**: Imágenes, íconos, fuentes y otros recursos multimedia.
- **src/components/**: Componentes reutilizables y genéricos de la UI.
- **src/contexts/**: Archivos de contextos globales de React (ej: AuthContext, OfflineContext).
- **src/hooks/**: Custom hooks para lógica reutilizable.
- **src/pages/**: Vistas principales que corresponden a rutas de la app.
- **src/services/**: Lógica de negocio, integración con APIs y Firebase.
- **src/styles/**: Archivos de estilos globales, variables CSS, etc.
- **src/utils/**: Funciones utilitarias y helpers generales.

---

> Esta estructura puede ampliarse según crezcan los requerimientos del proyecto.
