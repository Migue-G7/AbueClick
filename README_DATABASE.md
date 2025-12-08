# Base de Datos Compartida - AbueClick

Este sistema simula una base de datos compartida usando un archivo JSON (`database.json`) que puede ser compartido entre múltiples usuarios en diferentes computadores.

## 📋 Estructura

El archivo `database.json` contiene:
- **usuarios**: Lista de todos los usuarios registrados
- **citas**: Todas las citas agendadas
- **conversaciones**: Conversaciones de chat
- **mensajes**: Mensajes de las conversaciones
- **notificaciones**: Notificaciones del sistema
- **ultimaActualizacion**: Timestamp de la última actualización
- **version**: Versión del formato de datos

## 🔄 Cómo Funciona

### Sincronización Automática
- El sistema intenta cargar `database.json` cada 30 segundos
- Los datos se combinan con localStorage local
- Se priorizan los datos más recientes en caso de conflictos

### Sincronización Manual
- Puedes sincronizar manualmente desde el panel de administrador
- La sincronización carga datos desde `database.json` y los combina con los locales

## 📤 Exportar Base de Datos

1. Ve al **Panel de Administrador** (`admin.html`)
2. Haz clic en la pestaña **"Base de Datos"**
3. Haz clic en **"Exportar Base de Datos"**
4. Se descargará el archivo `database.json` con todos los datos actuales

## 📥 Importar Base de Datos

1. Ve al **Panel de Administrador** (`admin.html`)
2. Haz clic en la pestaña **"Base de Datos"**
3. Haz clic en **"Importar Base de Datos"**
4. Selecciona el archivo `database.json` compartido
5. Los datos se combinarán con los datos locales

## 🌐 Compartir entre Múltiples Computadores

### Opción 1: Carpeta Compartida en Red
1. Coloca el archivo `database.json` en una carpeta compartida en red
2. Cada usuario debe tener acceso a esa carpeta
3. Actualiza la ruta en `js/database.js` si es necesario

### Opción 2: Dropbox/Google Drive
1. Un usuario exporta el `database.json`
2. Lo sube a Dropbox/Google Drive en una carpeta compartida
3. Otros usuarios descargan el archivo y lo colocan en la raíz del proyecto
4. El sistema lo detectará automáticamente

### Opción 3: Servidor Local
1. Coloca el proyecto en un servidor local (XAMPP, Node.js, etc.)
2. El archivo `database.json` será accesible vía HTTP
3. Todos los usuarios apuntan a la misma URL del servidor

### Opción 4: Repositorio Git
1. Incluye `database.json` en un repositorio Git
2. Los usuarios hacen `git pull` periódicamente para obtener actualizaciones
3. Exportan e importan cuando necesiten sincronizar cambios

## ⚙️ Configuración

### Cambiar Intervalo de Sincronización
Edita `js/database.js` y modifica:
```javascript
const SYNC_INTERVAL = 30000; // Milisegundos (actualmente 30 segundos)
```

### Cambiar Ubicación del Archivo
Edita `js/database.js` y modifica:
```javascript
const DATABASE_FILE = 'database.json'; // O ruta relativa/absoluta
```

## 🔒 Consideraciones de Seguridad

⚠️ **Importante**: Este sistema es solo para prototipos y demostraciones.

- Los datos se almacenan en texto plano (sin encriptación)
- Las contraseñas no están encriptadas
- No hay control de acceso concurrente
- No hay validación de integridad de datos

**Para producción**, se debe usar:
- Backend con base de datos real (MySQL, PostgreSQL, MongoDB)
- API REST para acceso a datos
- Autenticación y autorización adecuadas
- Encriptación de datos sensibles

## 📝 Notas

- El sistema usa localStorage como caché local
- Los datos se combinan automáticamente (sin duplicados)
- Se priorizan los datos más recientes en caso de conflictos
- La sincronización es unidireccional (JSON → localStorage)
- Para compartir cambios, debes exportar el JSON manualmente

## 🆘 Solución de Problemas

### El archivo no se sincroniza
- Verifica que `database.json` esté en la raíz del proyecto
- Asegúrate de tener un servidor local ejecutándose (para evitar problemas de CORS)
- Revisa la consola del navegador para ver errores

### Datos no aparecen después de importar
- Recarga la página después de importar
- Verifica que el formato del JSON sea correcto
- Revisa que no haya errores en la consola

### Conflictos de datos
- El sistema combina datos automáticamente
- Se usa la fecha de creación para determinar qué datos son más recientes
- Puedes exportar y revisar el JSON manualmente si hay problemas

