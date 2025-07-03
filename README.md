# Tarpu Yachay PMV2

**Progressive Web App para registro e intercambio de semillas nativas**

PWA moderna desarrollada con React + Vite, Firebase y funcionalidades offline-first para el registro e intercambio de semillas nativas en comunidades rurales.

## 🚀 Tecnologías Principales

- **Frontend:** React 19 + Vite + SWC
- **Backend:** Firebase (Auth, Firestore, Storage)
- **PWA:** Service Worker + Manifest + Workbox
- **Calidad de código:** ESLint + Prettier
- **Navegación:** React Router DOM

## 📁 Estructura del Proyecto

```
tarpu-yachay-pmv2/
├── docs/                    # 📚 Documentación técnica
├── public/                  # 🌐 Archivos públicos y recursos PWA
├── src/                     # 💻 Código fuente
│   ├── components/          # 🧩 Componentes reutilizables
│   ├── pages/              # 📄 Páginas de la aplicación
│   ├── assets/             # 🖼️ Recursos estáticos
│   ├── contexts/           # 🔄 Contextos de React
│   └── services/           # 🛠️ Servicios y APIs
└── README.md               # 📖 Este archivo
```

## 📚 Documentación

La documentación técnica completa está organizada en la carpeta [`docs/`](./docs/):

- **[Estructura del proyecto](./docs/ESTRUCTURA.md)** - Organización detallada de carpetas
- **[Configuración de Firebase](./docs/FIREBASE_CONFIG.md)** - Setup y buenas prácticas
- **[Configuración PWA](./docs/PWA_CONFIG.md)** - Progressive Web App
- **[Service Worker](./docs/SERVICE_WORKER_CONFIG.md)** - Funcionalidades offline
- **[Resultados de pruebas](./docs/PASO_10_RESULTADOS.md)** - Validación del Bloque 1

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting y formateo
npm run lint
npm run format
```

## Variables de entorno y seguridad

- Las credenciales sensibles de Firebase y otras APIs deben ir en el archivo `.env` en la raíz del proyecto.
- Ejemplo de archivo `.env`:

```
VITE_FIREBASE_API_KEY=TU_API_KEY_AQUI
VITE_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN_AQUI
VITE_FIREBASE_PROJECT_ID=TU_PROJECT_ID_AQUI
VITE_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET_AQUI
VITE_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID_AQUI
VITE_FIREBASE_APP_ID=TU_APP_ID_AQUI
```

- Nunca subas el archivo `.env` a GitHub. El archivo `.gitignore` ya lo protege.
- Comparte solo el archivo `.env.example` para que otros desarrolladores sepan qué variables deben configurar.

### Buenas prácticas

- Cambia las credenciales si accidentalmente se suben a un repositorio público.
- Usa siempre variables de entorno para cualquier clave sensible o token de API.
- Revisa que `.env` esté en `.gitignore` antes de hacer push.

> Para producción, configura las variables de entorno en el entorno de despliegue (Vercel, Netlify, etc.) en vez de subir archivos locales.
