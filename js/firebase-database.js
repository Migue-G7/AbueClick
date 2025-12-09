let db = null;
let firebaseInicializado = false;

async function inicializarFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK no cargado. Usando solo localStorage.');
    return false;
  }

  try {
    let config = null;
    
    if (typeof window !== 'undefined' && window.firebaseConfig) {
      config = window.firebaseConfig;
    } else {
      console.warn('Configuración de Firebase no encontrada');
      return false;
    }

    if (config.apiKey === "TU_API_KEY" || !config.apiKey) {
      console.warn('Firebase no configurado. Configura tus credenciales en js/firebase-config.js');
      return false;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    
    db = firebase.firestore();
    firebaseInicializado = true;
    console.log('✅ Firebase inicializado correctamente');
    return true;
  } catch (error) {
    console.warn('Error al inicializar Firebase:', error);
    console.log('Usando sistema local como respaldo');
  }
  return false;
}

async function guardarEnBaseDatosFirebase(clave, datos) {
  if (!firebaseInicializado) {
    await inicializarFirebase();
  }

  if (!db || !firebaseInicializado) {
    localStorage.setItem(clave, JSON.stringify(datos));
    localStorage.setItem('ultimaActualizacion', new Date().toISOString());
    return false;
  }

  try {
    const docRef = db.collection('abueclick').doc('datos');
    const datosCompletos = {
      [clave]: datos,
      ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp(),
      version: '1.0'
    };

    await docRef.set(datosCompletos, { merge: true });
    
    localStorage.setItem(clave, JSON.stringify(datos));
    localStorage.setItem('ultimaActualizacion', new Date().toISOString());
    
    console.log(`✅ Datos guardados en Firebase: ${clave}`);
    return true;
  } catch (error) {
    console.error('Error al guardar en Firebase:', error);
    localStorage.setItem(clave, JSON.stringify(datos));
    return false;
  }
}

async function cargarDesdeFirebase() {
  if (!firebaseInicializado) {
    await inicializarFirebase();
  }

  if (!db || !firebaseInicializado) {
    return obtenerDatosLocales();
  }

  try {
    const docRef = db.collection('abueclick').doc('datos');
    const doc = await docRef.get();

    if (doc.exists) {
      const datos = doc.data();
      sincronizarConLocalStorage(datos);
      console.log('✅ Datos cargados desde Firebase');
      return datos;
    } else {
      console.log('No hay datos en Firebase, usando datos locales');
      return obtenerDatosLocales();
    }
  } catch (error) {
    console.error('Error al cargar desde Firebase:', error);
    return obtenerDatosLocales();
  }
}

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

function sincronizarConLocalStorage(datos) {
  const datosLocales = obtenerDatosLocales();
  
  const usuariosCombinados = combinarArraysUnicos(datos.usuarios || [], datosLocales.usuarios, 'email');
  localStorage.setItem('usuarios', JSON.stringify(usuariosCombinados));
  
  const citasCombinadas = combinarArraysUnicos(datos.citas || [], datosLocales.citas, 'fechaCreacion');
  localStorage.setItem('citas', JSON.stringify(citasCombinadas));
  
  const conversacionesCombinadas = combinarArraysUnicos(datos.conversaciones || [], datosLocales.conversaciones, 'id');
  localStorage.setItem('conversaciones', JSON.stringify(conversacionesCombinadas));
  
  const mensajesCombinados = combinarArraysUnicos(datos.mensajes || [], datosLocales.mensajes, 'id');
  localStorage.setItem('mensajes', JSON.stringify(mensajesCombinados));
  
  const notificacionesCombinadas = combinarArraysUnicos(datos.notificaciones || [], datosLocales.notificaciones, 'id');
  localStorage.setItem('notificaciones', JSON.stringify(notificacionesCombinadas));
  
  if (datos.ultimaActualizacion) {
    localStorage.setItem('ultimaActualizacion', datos.ultimaActualizacion.toDate ? datos.ultimaActualizacion.toDate().toISOString() : datos.ultimaActualizacion);
  }
  
  console.log('✅ Datos sincronizados con localStorage');
}

function combinarArraysUnicos(array1, array2, clave) {
  const map = new Map();
  
  array1.forEach(item => {
    if (item[clave]) {
      map.set(item[clave], item);
    }
  });
  
  array2.forEach(item => {
    if (item[clave]) {
      const existente = map.get(item[clave]);
      if (existente && item.fechaCreacion && existente.fechaCreacion) {
        const fechaItem = item.fechaCreacion?.toDate ? item.fechaCreacion.toDate() : new Date(item.fechaCreacion);
        const fechaExistente = existente.fechaCreacion?.toDate ? existente.fechaCreacion.toDate() : new Date(existente.fechaCreacion);
        if (fechaItem > fechaExistente) {
          map.set(item[clave], item);
        }
      } else {
        map.set(item[clave], item);
      }
    }
  });
  
  return Array.from(map.values());
}

function suscribirseACambiosEnTiempoReal(callback) {
  if (!firebaseInicializado) {
    inicializarFirebase().then(success => {
      if (success && db) {
        configurarEscucha(callback);
      }
    });
  } else if (db) {
    configurarEscucha(callback);
  }
}

function configurarEscucha(callback) {
  const docRef = db.collection('abueclick').doc('datos');
  
  docRef.onSnapshot((doc) => {
    if (doc.exists) {
      const datos = doc.data();
      sincronizarConLocalStorage(datos);
      if (callback) callback(datos);
      console.log('🔄 Datos actualizados en tiempo real desde Firebase');
    }
  }, (error) => {
    console.error('Error en la escucha en tiempo real:', error);
  });
}

if (typeof window !== 'undefined') {
  window.guardarEnBaseDatosFirebase = guardarEnBaseDatosFirebase;
  window.cargarDesdeFirebase = cargarDesdeFirebase;
  window.suscribirseACambiosEnTiempoReal = suscribirseACambiosEnTiempoReal;
  window.inicializarFirebase = inicializarFirebase;
}

