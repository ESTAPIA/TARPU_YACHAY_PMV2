# PASO 2 BLOQUE 3 - ARQUITECTURA DE NAVEGACIÓN

## ✅ Paso 2: Definición de la arquitectura de navegación

**Fecha:** 1 de julio de 2025  
**Objetivo:** Diseñar la estructura completa del Bottom Navigation Bar y los flujos de navegación

---

## 🏗️ Arquitectura de las 5 Secciones Principales

### 1. 🏠 **Inicio/Dashboard**

- **Ruta:** `/home`
- **Icono:** 🏠 (Casa)
- **Nombre:** "Inicio"
- **Función:** Página principal con resumen de actividad del usuario
- **Contenido:**
  - Resumen de semillas registradas
  - Intercambios recientes
  - Accesos rápidos a funciones principales
  - Estadísticas básicas de actividad

### 2. 🌱 **Catálogo de Semillas**

- **Ruta:** `/catalog`
- **Icono:** 🌱 (Semilla/Brote)
- **Nombre:** "Semillas"
- **Función:** Explorar y buscar semillas disponibles
- **Contenido:**
  - Lista de todas las semillas disponibles
  - Funciones de búsqueda y filtrado
  - Vista detallada de cada semilla
  - Información de propietarios

### 3. ➕ **Registrar Semilla**

- **Ruta:** `/add-seed`
- **Icono:** ➕ (Más/Agregar)
- **Nombre:** "Registrar"
- **Función:** Añadir nuevas semillas al catálogo
- **Contenido:**
  - Formulario de registro de semillas
  - Captura de fotos
  - Grabación de audio (futuro)
  - Geolocalización

### 4. 🔄 **Intercambios**

- **Ruta:** `/exchanges`
- **Icono:** 🔄 (Flechas circulares)
- **Nombre:** "Trueques"
- **Función:** Gestionar intercambios entre usuarios
- **Contenido:**
  - Solicitudes enviadas y recibidas
  - Historial de intercambios
  - Chat básico para negociación
  - Estado de trueques

### 5. 👤 **Perfil de Usuario**

- **Ruta:** `/profile`
- **Icono:** 👤 (Persona)
- **Nombre:** "Perfil"
- **Función:** Gestión de cuenta y configuraciones
- **Contenido:**
  - Información personal
  - Configuraciones de la app
  - Estadísticas de usuario
  - Logout y privacidad

---

## 🔄 Flujos de Navegación Principales

### **Flujo 1: Usuario Nuevo (Post-Login)**

```
Login → Welcome → Home (Dashboard)
                    ↓
    [Bottom Navigation disponible]
```

### **Flujo 2: Exploración de Semillas**

```
Home → Catálogo → Vista Detallada → Solicitar Intercambio
  ↑       ↓              ↓               ↓
  └── Volver ←────── Volver ←───── Intercambios
```

### **Flujo 3: Registro de Nueva Semilla**

```
Home → Registrar → Completar Formulario → Confirmar → Home
  ↑       ↓              ↓                  ↓        ↑
  └── Volver ←────── Cancelar ←────── Guardar ──────┘
```

### **Flujo 4: Gestión de Intercambios**

```
Home → Intercambios → Ver Solicitud → Responder → Actualizar Estado
  ↑        ↓              ↓             ↓             ↓
  └── Volver ←────── Volver ←───── Aceptar/Rechazar ──┘
```

### **Flujo 5: Gestión de Perfil**

```
Home → Perfil → Editar Info → Guardar → Perfil
  ↑      ↓          ↓          ↓        ↑
  └── Volver ←── Cancelar ←── Aplicar ──┘
           ↓
        Logout → Login
```

---

## 🎨 Especificaciones de Diseño

### **Iconografía Seleccionada**

- **Estilo:** Emojis Unicode para máxima compatibilidad
- **Tamaño:** Consistente en todos los dispositivos
- **Accesibilidad:** Texto alternativo descriptivo

### **Nomenclatura Final**

| Sección | Nombre Corto | Nombre Completo      |
| ------- | ------------ | -------------------- |
| 🏠      | Inicio       | Dashboard Principal  |
| 🌱      | Semillas     | Catálogo de Semillas |
| ➕      | Registrar    | Añadir Semilla       |
| 🔄      | Trueques     | Intercambios         |
| 👤      | Perfil       | Mi Cuenta            |

### **Estados de Navegación**

- **Activo:** Destacado visualmente (color/fondo diferente)
- **Inactivo:** Color neutro
- **Disabled:** No aplicable (todas las secciones siempre disponibles)
- **Loading:** Indicador durante navegación

---

## 📱 Consideraciones Mobile-First

### **Responsive Behavior**

- **Móvil (< 768px):** Bottom Navigation visible
- **Tablet (768px - 1024px):** Bottom Navigation optimizada
- **Desktop (> 1024px):** Adaptación a sidebar (futuro)

### **Touch Targets**

- **Mínimo:** 44px de alto (iOS/Android guidelines)
- **Recomendado:** 48px de alto
- **Separación:** Espaciado adecuado entre botones

### **Accesibilidad**

- **Screen readers:** Labels descriptivos
- **Navegación por teclado:** Focus states claros
- **Contraste:** Cumplir WCAG AA guidelines

---

## 🔗 Integración con Rutas Existentes

### **Rutas ya Configuradas (Paso 1)**

✅ `/home` - HomePage (placeholder)  
✅ `/catalog` - CatalogPage (placeholder)  
✅ `/add-seed` - AddSeedPage (placeholder)  
✅ `/exchanges` - ExchangesPage (placeholder)  
✅ `/profile` - ProfilePage (existente)

### **Rutas de Autenticación**

✅ `/login` - LoginPage  
✅ `/register` - RegisterPage  
✅ `/forgot-password` - ForgotPasswordPage  
✅ `/welcome` - WelcomePage

---

## 🎯 Próximos Pasos

### **Paso 3: Implementación del Layout**

- Crear `AppLayout.jsx` con estructura HTML5
- Integrar el Bottom Navigation Bar
- Configurar área de contenido dinámico

### **Paso 4: Bottom Navigation Bar**

- Implementar navegación funcional
- Añadir indicadores de página activa
- Optimizar para touch/mobile

---

## ✅ Validación del Paso 2

### **Criterios Completados:**

✅ **5 secciones definidas** con funcionalidad clara  
✅ **Iconografía documentada** con emojis Unicode  
✅ **Nomenclatura establecida** (corta y completa)  
✅ **Flujos de navegación** mapeados completamente  
✅ **Consideraciones mobile-first** planificadas  
✅ **Integración con rutas** verificada

### **Entregables del Paso 2:**

- Arquitectura de navegación completamente documentada
- Flujos de usuario definidos
- Especificaciones de diseño establecidas
- Base sólida para implementación en Paso 3

---

**📂 Archivo:** `docs/PASO_2_BLOQUE_3_ARQUITECTURA_NAVEGACION.md`

**🎯 Estado:** COMPLETADO - Listo para Paso 3 (Implementación del Layout)
