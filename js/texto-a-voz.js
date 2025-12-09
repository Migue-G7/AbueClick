// Funcionalidad de Texto a Voz para mejorar la accesibilidad
// Permite a los usuarios seleccionar texto y escucharlo

let sintesisVoz = null;
let botonLectura = null;
let textoSeleccionado = '';
let estaHablando = false;

// Inicializar la funcionalidad cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  inicializarTextoAVoz();
});

// Inicializar la funcionalidad de texto a voz
function inicializarTextoAVoz() {
  // Verificar si el navegador soporta la Web Speech API
  if (!('speechSynthesis' in window)) {
    console.warn('Tu navegador no soporta la funcionalidad de texto a voz');
    return;
  }

  // Crear el botón flotante para leer texto
  crearBotonLectura();

  // Detectar cuando se selecciona texto
  document.addEventListener('mouseup', manejarSeleccionTexto);
  document.addEventListener('keyup', manejarSeleccionTexto);

  // Detener la lectura si se hace clic fuera del botón
  document.addEventListener('click', function(e) {
    if (botonLectura && !botonLectura.contains(e.target) && !window.getSelection().toString().trim()) {
      ocultarBotonLectura();
    }
  });
}

// Crear el botón flotante para leer texto
function crearBotonLectura() {
  botonLectura = document.createElement('div');
  botonLectura.id = 'boton-lectura-texto';
  botonLectura.className = 'boton-lectura-texto';
  botonLectura.innerHTML = `
    <button id="btn-leer-texto" class="btn-leer" title="Leer texto seleccionado" aria-label="Leer texto seleccionado">
      <span class="icono-lectura">🔊</span>
      <span class="texto-boton">Leer</span>
    </button>
    <button id="btn-detener-lectura" class="btn-detener" style="display: none;" title="Detener lectura" aria-label="Detener lectura">
      <span class="icono-lectura">⏹</span>
    </button>
  `;
  document.body.appendChild(botonLectura);

  // Event listeners para los botones
  document.getElementById('btn-leer-texto').addEventListener('click', leerTextoSeleccionado);
  document.getElementById('btn-detener-lectura').addEventListener('click', detenerLectura);
}

// Manejar la selección de texto
function manejarSeleccionTexto() {
  const seleccion = window.getSelection();
  textoSeleccionado = seleccion.toString().trim();

  // Si hay texto seleccionado (más de 3 caracteres), mostrar el botón
  if (textoSeleccionado.length > 3) {
    mostrarBotonLectura(seleccion);
  } else {
    ocultarBotonLectura();
  }
}

// Mostrar el botón de lectura en la posición del texto seleccionado
function mostrarBotonLectura(seleccion) {
  if (!botonLectura) return;

  const rango = seleccion.getRangeAt(0);
  const rect = rango.getBoundingClientRect();
  
  // Posicionar el botón cerca del texto seleccionado
  botonLectura.style.display = 'flex';
  botonLectura.style.top = (rect.top + window.scrollY - 50) + 'px';
  botonLectura.style.left = (rect.left + window.scrollX + (rect.width / 2) - 40) + 'px';

  // Asegurar que el botón esté visible
  setTimeout(() => {
    botonLectura.classList.add('visible');
  }, 10);
}

// Ocultar el botón de lectura
function ocultarBotonLectura() {
  if (!botonLectura) return;
  botonLectura.classList.remove('visible');
  setTimeout(() => {
    botonLectura.style.display = 'none';
  }, 200);
}

// Leer el texto seleccionado
function leerTextoSeleccionado() {
  if (!textoSeleccionado || estaHablando) return;

  // Detener cualquier lectura previa
  window.speechSynthesis.cancel();

  // Crear nueva síntesis de voz
  sintesisVoz = new SpeechSynthesisUtterance(textoSeleccionado);
  
  // Configurar la voz en español
  const voces = window.speechSynthesis.getVoices();
  const vozEspanol = voces.find(voice => 
    voice.lang.includes('es') || voice.lang.includes('ES')
  ) || voces.find(voice => voice.lang.includes('es-'));
  
  if (vozEspanol) {
    sintesisVoz.voice = vozEspanol;
  }
  
  // Configuración de la voz
  sintesisVoz.lang = 'es-ES';
  sintesisVoz.rate = 0.9; // Velocidad ligeramente más lenta para mejor comprensión
  sintesisVoz.pitch = 1.0;
  sintesisVoz.volume = 1.0;

  // Event listeners para controlar el estado
  sintesisVoz.onstart = function() {
    estaHablando = true;
    actualizarEstadoBoton(true);
  };

  sintesisVoz.onend = function() {
    estaHablando = false;
    actualizarEstadoBoton(false);
  };

  sintesisVoz.onerror = function(e) {
    console.error('Error en la síntesis de voz:', e);
    estaHablando = false;
    actualizarEstadoBoton(false);
    alert('Hubo un error al intentar leer el texto. Por favor, inténtalo de nuevo.');
  };

  // Iniciar la lectura
  window.speechSynthesis.speak(sintesisVoz);
}

// Detener la lectura
function detenerLectura() {
  window.speechSynthesis.cancel();
  estaHablando = false;
  actualizarEstadoBoton(false);
}

// Actualizar el estado visual del botón
function actualizarEstadoBoton(hablando) {
  const btnLeer = document.getElementById('btn-leer-texto');
  const btnDetener = document.getElementById('btn-detener-lectura');
  
  if (hablando) {
    btnLeer.style.display = 'none';
    btnDetener.style.display = 'flex';
  } else {
    btnLeer.style.display = 'flex';
    btnDetener.style.display = 'none';
  }
}

// Cargar voces cuando estén disponibles (algunos navegadores las cargan asíncronamente)
if ('speechSynthesis' in window) {
  // Cargar voces inmediatamente si están disponibles
  if (speechSynthesis.getVoices().length > 0) {
    // Voces ya cargadas
  } else {
    // Esperar a que se carguen las voces
    speechSynthesis.onvoiceschanged = function() {
      // Voces cargadas, la funcionalidad ya está lista
    };
  }
}

