# Configuración de Firebase para Tarpu Yachay PMV2

## 1. Crear o reutilizar el proyecto en Firebase Console

- Accede a https://console.firebase.google.com/
- Crea un nuevo proyecto o selecciona uno existente (ejemplo: `tarpuyachay-aa818`)
- Habilita los productos necesarios: Authentication, Firestore Database, Storage

## 2. Obtener las credenciales de configuración

- Ve a la sección "Project settings" > "General"
- En "Tus apps", selecciona la app web y copia la configuración (API key, Auth domain, etc.)

## 3. Añadir archivo de configuración

- Crea el archivo `src/firebase-config.js` (ya creado)
- Usa variables de entorno para las credenciales (no las escribas directo en el código)
- Ejemplo de uso en el código:
  ```js
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
  ```

## 4. Variables de entorno

- Crea un archivo `.env` en la raíz del proyecto (no lo subas al repositorio)
- Usa el archivo `.env.example` como plantilla
- Ejemplo:
  ```env
  VITE_FIREBASE_API_KEY=AIzaSy...
  VITE_FIREBASE_AUTH_DOMAIN=tarpuyachay-aa818.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=tarpuyachay-aa818
  VITE_FIREBASE_STORAGE_BUCKET=tarpuyachay-aa818.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=21674339341
  VITE_FIREBASE_APP_ID=1:21674339341:web:5ddcbd7801af7c1b9c7944
  ```

## 5. Buenas prácticas de seguridad

- **Nunca subas el archivo `.env` ni credenciales reales a GitHub**
- Usa `.env.example` para compartir la estructura de variables
- Revisa que `.env` esté en `.gitignore`
- Cambia las credenciales si se filtran accidentalmente

---

> Si necesitas cambiar de proyecto Firebase, solo actualiza las variables en `.env` y reinicia el servidor de desarrollo.
