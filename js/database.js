// ============================================
// SISTEMA DE BASE DE DATOS COMPARTIDA
// Simula una base de datos compartida usando archivo JSON
// ============================================

const DATABASE_FILE = 'database.json';
const SYNC_INTERVAL = 30000; // Sincronizar cada 30 segundos
let syncTimer = null;

// ============================================
// FUNCIONES DE CARGA Y GUARDADO
// ============================================

/**
 * Cargar datos desde el archivo JSON compartido
 * @returns {Promise<Object>} Datos de la base de datos
 */
async function cargarBaseDatos() {
  if (typeof cargarDesdeFirebase === 'function') {
    try {
      const datos = await cargarDesdeFirebase();
      if (datos && Object.keys(datos).length > 0) {
        return datos;
      }
    } catch (error) {
      console.warn('Error al cargar desde Firebase, intentando JSON local:', error);
    }
  }

  try {
    const response = await fetch(DATABASE_FILE);
    if (!response.ok) {
      console.warn('No se pudo cargar database.json, usando datos locales');
      return obtenerDatosLocales();
    }
    
    const datos = await response.json();
    console.log('✅ Base de datos cargada desde JSON compartido');
    
    sincronizarConLocalStorage(datos);
    
    return datos;
  } catch (error) {
    console.warn('Error al cargar database.json:', error);
    console.log('Usando datos locales de localStorage');
    return obtenerDatosLocales();
  }
}

/**
 * Obtener datos desde localStorage
 * @returns {Object} Datos locales
 */
function obtenerDatosLocales() {
  return {
    usuarios: JSON.parse(localStorage.getItem('usuarios') || '[]'),
    citas: JSON.parse(localStorage.getItem('citas') || '[]'),
    conversaciones: JSON.parse(localStorage.getItem('conversaciones') || '[]'),
    mensajes: JSON.parse(localStorage.getItem('mensajes') || '[]'),
    notificaciones: JSON.parse(localStorage.getItem('notificaciones') || '[]'),
    ultimaActualizacion: localStorage.getItem('ultimaActualizacion'),
    version: '1.0'
  };
}

/**
 * Sincronizar datos del JSON compartido con localStorage
 * @param {Object} datos Datos desde el JSON
 */
function sincronizarConLocalStorage(datos) {
  // Combinar datos del JSON con localStorage (dar prioridad al más reciente)
  const datosLocales = obtenerDatosLocales();
  
  // Para usuarios: mergear, evitando duplicados
  const usuariosCombinados = combinarArraysUnicos(datos.usuarios, datosLocales.usuarios, 'email');
  localStorage.setItem('usuarios', JSON.stringify(usuariosCombinados));
  
  // Para citas: mergear por fechaCreacion
  const citasCombinadas = combinarArraysUnicos(datos.citas, datosLocales.citas, 'fechaCreacion');
  localStorage.setItem('citas', JSON.stringify(citasCombinadas));
  
  // Para conversaciones: mergear por id
  const conversacionesCombinadas = combinarArraysUnicos(datos.conversaciones, datosLocales.conversaciones, 'id');
  localStorage.setItem('conversaciones', JSON.stringify(conversacionesCombinadas));
  
  // Para mensajes: mergear por id
  const mensajesCombinados = combinarArraysUnicos(datos.mensajes, datosLocales.mensajes, 'id');
  localStorage.setItem('mensajes', JSON.stringify(mensajesCombinados));
  
  // Para notificaciones: mergear por id
  const notificacionesCombinadas = combinarArraysUnicos(datos.notificaciones, datosLocales.notificaciones, 'id');
  localStorage.setItem('notificaciones', JSON.stringify(notificacionesCombinadas));
  
  // Actualizar timestamp
  const fechaMasReciente = datos.ultimaActualizacion && datosLocales.ultimaActualizacion
    ? (new Date(datos.ultimaActualizacion) > new Date(datosLocales.ultimaActualizacion) 
        ? datos.ultimaActualizacion 
        : datosLocales.ultimaActualizacion)
    : (datos.ultimaActualizacion || datosLocales.ultimaActualizacion || new Date().toISOString());
  
  localStorage.setItem('ultimaActualizacion', fechaMasReciente);
  
  console.log('✅ Datos sincronizados con localStorage');
}

/**
 * Combinar dos arrays evitando duplicados basándose en una clave única
 * @param {Array} array1 Primer array
 * @param {Array} array2 Segundo array
 * @param {string} clave Clave única para comparar
 * @returns {Array} Array combinado sin duplicados
 */
function combinarArraysUnicos(array1, array2, clave) {
  const map = new Map();
  
  // Agregar elementos del primer array
  array1.forEach(item => {
    if (item[clave]) {
      map.set(item[clave], item);
    }
  });
  
  // Agregar elementos del segundo array (sobrescribir si ya existe)
  array2.forEach(item => {
    if (item[clave]) {
      const existente = map.get(item[clave]);
      // Si ambos tienen fechaCreacion o similar, usar el más reciente
      if (existente && item.fechaCreacion && existente.fechaCreacion) {
        if (new Date(item.fechaCreacion) > new Date(existente.fechaCreacion)) {
          map.set(item[clave], item);
        }
      } else {
        map.set(item[clave], item);
      }
    }
  });
  
  return Array.from(map.values());
}

/**
 * Exportar datos de localStorage a formato JSON para compartir
 * @returns {Object} Datos formateados para exportar
 */
function exportarDatosParaCompartir() {
  const datos = obtenerDatosLocales();
  datos.ultimaActualizacion = new Date().toISOString();
  return datos;
}

/**
 * Descargar datos como archivo JSON (para compartir manualmente)
 */
function descargarBaseDatos() {
  const datos = exportarDatosParaCompartir();
  const jsonString = JSON.stringify(datos, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'database.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ Base de datos exportada como database.json');
  alert('Base de datos exportada exitosamente. Comparte el archivo database.json con otros usuarios.');
}

/**
 * Importar datos desde un archivo JSON
 * @param {File} archivo Archivo JSON a importar
 * @returns {Promise<boolean>} true si se importó exitosamente
 */
async function importarBaseDatos(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const datos = JSON.parse(e.target.result);
        
        // Validar estructura
        if (!datos.usuarios || !Array.isArray(datos.usuarios)) {
          throw new Error('Formato de archivo inválido');
        }
        
        // Sincronizar con localStorage
        sincronizarConLocalStorage(datos);
        
        console.log('✅ Base de datos importada exitosamente');
        resolve(true);
      } catch (error) {
        console.error('Error al importar base de datos:', error);
        reject(error);
      }
    };
    
    reader.onerror = function() {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(archivo);
  });
}

function guardarEnBaseDatos(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
  localStorage.setItem('ultimaActualizacion', new Date().toISOString());
  localStorage.setItem('pendienteSincronizacion', 'true');
  
  if (typeof guardarEnBaseDatosFirebase === 'function') {
    guardarEnBaseDatosFirebase(clave, datos).catch(error => {
      console.warn('Error al guardar en Firebase, usando solo localStorage:', error);
    });
  }
  
  console.log(`✅ Datos guardados en ${clave}`);
}

// ============================================
// FUNCIONES DE SINCRONIZACIÓN AUTOMÁTICA
// ============================================

/**
 * Iniciar sincronización automática periódica
 */
function iniciarSincronizacionAutomatica() {
  if (syncTimer) {
    clearInterval(syncTimer);
  }
  
  // Cargar inmediatamente al iniciar
  cargarBaseDatos();
  
  // Sincronizar periódicamente
  syncTimer = setInterval(() => {
    console.log('🔄 Sincronizando base de datos...');
    cargarBaseDatos();
  }, SYNC_INTERVAL);
  
  console.log('✅ Sincronización automática iniciada (cada 30 segundos)');
}

/**
 * Detener sincronización automática
 */
function detenerSincronizacionAutomatica() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
    console.log('⏸️ Sincronización automática detenida');
  }
}

/**
 * Sincronización manual inmediata
 */
async function sincronizarManual() {
  console.log('🔄 Sincronización manual iniciada...');
  await cargarBaseDatos();
  alert('Sincronización completada');
}

// ============================================
// FUNCIONES ESPECÍFICAS PARA CADA ENTIDAD
// ============================================

/**
 * Obtener usuarios desde la base de datos compartida
 * @returns {Promise<Array>} Array de usuarios
 */
async function obtenerUsuariosCompartidos() {
  const datos = await cargarBaseDatos();
  return datos.usuarios;
}

/**
 * Guardar usuario en la base de datos compartida
 * @param {Object} usuario Datos del usuario
 */
function guardarUsuarioCompartido(usuario) {
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
  // Verificar si ya existe
  const existe = usuarios.find(u => u.email === usuario.email);
  if (!existe) {
    usuarios.push(usuario);
    guardarEnBaseDatos('usuarios', usuarios);
  }
}

/**
 * Obtener citas desde la base de datos compartida
 * @returns {Promise<Array>} Array de citas
 */
async function obtenerCitasCompartidas() {
  const datos = await cargarBaseDatos();
  return datos.citas;
}

/**
 * Guardar cita en la base de datos compartida
 * @param {Object} cita Datos de la cita
 */
function guardarCitaCompartida(cita) {
  const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  citas.push(cita);
  guardarEnBaseDatos('citas', citas);
}

// ============================================
// INICIALIZACIÓN
// ============================================

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async () => {
      if (typeof inicializarFirebase === 'function') {
        await inicializarFirebase();
        
        if (typeof suscribirseACambiosEnTiempoReal === 'function') {
          suscribirseACambiosEnTiempoReal();
          console.log('✅ Escucha en tiempo real activada');
        }
      }
      
      iniciarSincronizacionAutomatica();
    }, 1000);
  });
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
  window.cargarBaseDatos = cargarBaseDatos;
  window.descargarBaseDatos = descargarBaseDatos;
  window.importarBaseDatos = importarBaseDatos;
  window.sincronizarManual = sincronizarManual;
  window.iniciarSincronizacionAutomatica = iniciarSincronizacionAutomatica;
  window.detenerSincronizacionAutomatica = detenerSincronizacionAutomatica;
}

