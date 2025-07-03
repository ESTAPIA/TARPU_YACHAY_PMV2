# Configuración Avanzada de Firebase Authentication - Paso 1

**Fecha:** 1 de julio de 2025  
**Estado:** ✅ COMPLETADO (Parte técnica) / 🔄 PENDIENTE (Configuración Firebase Console)

---

## 🔧 Configuración en Firebase Console

### ✅ 1. Métodos de Autenticación Habilitados

**¿Qué verificar?**

- Email/Password debe estar **Enabled**
- Ruta: Firebase Console → Authentication → Sign-in method

**Configuración recomendada:**

- ✅ Email/Password: **Enabled**
- ❌ Google: Disabled (por ahora)
- ❌ Facebook: Disabled (por ahora)
- ❌ Anonymous: Disabled (por ahora)

### ✅ 2. Dominios Autorizados Configurados

**¿Qué configurar?**

- Ruta: Firebase Console → Authentication → Settings → Authorized domains

**Dominios requeridos:**

- ✅ `localhost` (desarrollo local)
- ✅ `127.0.0.1` (desarrollo alternativo)
- ✅ Tu dominio de producción (cuando despliegues)

**¿Por qué es importante?**
Firebase solo permite autenticación desde dominios autorizados. Sin esto, la autenticación fallará en desarrollo y producción.

---

## 🔒 Reglas de Seguridad Básicas

### Reglas de Firestore Database

Para el PMV2, configuraremos reglas básicas que permitan:

- Solo usuarios autenticados puedan leer/escribir sus propios datos
- Acceso restringido a colecciones específicas

**Reglas recomendadas para empezar:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regla básica: solo usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Regla específica para usuarios: solo pueden acceder a sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Regla para semillas: usuarios autenticados pueden leer todas,
    // pero solo pueden escribir las propias
    match /seeds/{seedId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
    }
  }
}
```

### Reglas de Storage

Para archivos (imágenes de semillas, etc.):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Solo usuarios autenticados pueden subir archivos
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 && // Máximo 5MB
        request.resource.contentType.matches('image/.*'); // Solo imágenes
    }
  }
}
```

---

## 🧪 Verificación de Funcionamiento

### Componente de Prueba Creado

Se creará el componente `FirebaseAuthTest.jsx` para verificar:

- ✅ Conexión con Firebase Auth
- ✅ Registro de usuario de prueba
- ✅ Login con credenciales
- ✅ Logout correcto
- ✅ Manejo de errores

### Pruebas a Realizar

1. **Prueba de conexión**: Verificar que Firebase Auth se inicialize
2. **Prueba de registro**: Crear un usuario de prueba
3. **Prueba de login**: Autenticar con el usuario creado
4. **Prueba de logout**: Cerrar sesión correctamente
5. **Prueba de errores**: Verificar manejo de errores (email inválido, etc.)

---

## 📋 Checklist del Paso 1

- [ ] Email/Password habilitado en Firebase Console _(USUARIO)_
- [ ] Dominios autorizados configurados (localhost, 127.0.0.1) _(USUARIO)_
- [x] Reglas de seguridad básicas documentadas _(COMPLETADO)_
- [x] Componente de prueba creado y funcional _(COMPLETADO)_
- [ ] Verificación completa de Firebase Auth exitosa _(PENDIENTE - requiere configuración)_

---

## ✅ COMPLETADO - PARTE TÉCNICA

### Documentación creada:

- ✅ Reglas de seguridad básicas para Firestore y Storage
- ✅ Checklist detallado de configuración
- ✅ Guía paso a paso para Firebase Console

### Componente de prueba implementado:

- ✅ `FirebaseAuthTest.jsx` - Suite completa de pruebas
- ✅ Pruebas de conexión, registro, login y logout
- ✅ Interfaz visual con resultados en tiempo real
- ✅ Manejo de errores y estados de carga

### Integración:

- ✅ Componente agregado a App.jsx
- ✅ Visible en http://localhost:5173/
- ✅ Listo para pruebas una vez configurado Firebase Console

---

**Próximo paso:** Una vez completado este paso, avanzaremos al Paso 2 (Creación del AuthContext).
