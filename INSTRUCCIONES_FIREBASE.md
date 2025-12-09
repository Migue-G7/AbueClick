# 🔥 Configuración de Firebase para AbueClick

## ¿Por qué Firebase?

Firebase permite que los datos se sincronicen automáticamente entre todos los usuarios en tiempo real, sin necesidad de un servidor propio. Es gratuito para proyectos pequeños y funciona perfectamente con hosting estático.

## 📋 Pasos para Configurar Firebase

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** o **"Crear proyecto"**
3. Ingresa el nombre del proyecto: `AbueClick` (o el que prefieras)
4. Desactiva Google Analytics (opcional, para simplificar)
5. Haz clic en **"Crear proyecto"**

### 2. Configurar Firestore Database

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (para desarrollo)
4. Elige una ubicación cercana a tus usuarios (ej: `southamerica-east1`)
5. Haz clic en **"Habilitar"**

**⚠️ IMPORTANTE - Reglas de Seguridad:**

Ve a la pestaña **"Reglas"** y copia estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /abueclick/{document} {
      allow read, write: if true;
    }
  }
}
```

Estas reglas permiten que cualquier usuario pueda leer y escribir. Para producción, deberías agregar autenticación.

### 3. Obtener Credenciales del Proyecto

1. Ve a **"Configuración del proyecto"** (ícono de engranaje)
2. Baja hasta **"Tus aplicaciones"**
3. Haz clic en el ícono **`</>`** (web)
4. Registra la app con un nickname (ej: "AbueClick Web")
5. **NO marques** "También configurar Firebase Hosting"
6. Haz clic en **"Registrar app"**

### 4. Copiar Configuración

Verás un código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 5. Configurar en AbueClick

1. Abre el archivo `js/firebase-config.js`
2. Reemplaza `TU_API_KEY`, `TU_PROJECT_ID`, etc. con tus valores reales
3. Guarda el archivo

### 6. Agregar Scripts de Firebase a tus HTML

Abre todos tus archivos HTML y agrega estos scripts **ANTES** de `js/database.js`:

```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>

<!-- Tu configuración y base de datos -->
<script src="js/firebase-config.js"></script>
<script src="js/firebase-database.js"></script>
<script src="js/database.js"></script>
```

## ✅ Verificación

1. Abre la consola del navegador (F12)
2. Deberías ver: `✅ Firebase inicializado correctamente`
3. Crea un usuario nuevo
4. En otro dispositivo/navegador, debería aparecer automáticamente

## 🔄 Cómo Funciona

- **Guardar datos**: Se guardan en Firebase Y en localStorage (respaldo)
- **Cargar datos**: Primero intenta Firebase, si falla usa localStorage
- **Tiempo real**: Los cambios se sincronizan automáticamente entre todos los usuarios
- **Sin servidor**: No necesitas backend, Firebase hace todo

## 🆓 Límites Gratuitos

Firebase tiene un plan gratuito generoso:
- 50,000 lecturas/día
- 20,000 escrituras/día
- 20,000 eliminaciones/día
- 1 GB de almacenamiento

Para un proyecto pequeño/mediano, esto es más que suficiente.

## 🛡️ Seguridad en Producción

Cuando estés listo para producción, actualiza las reglas de Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /abueclick/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Esto requeriría que los usuarios estén autenticados para escribir.

## 📞 Soporte

Si tienes problemas:
1. Verifica que los scripts de Firebase estén cargados
2. Verifica que las credenciales sean correctas
3. Revisa la consola del navegador para errores
4. Asegúrate de que Firestore esté habilitado en tu proyecto

