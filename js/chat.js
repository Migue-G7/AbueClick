// Sistema de Chat entre Adulto Mayor y Acompañante

// ============================================
// GESTIÓN DE CONVERSACIONES
// ============================================

// Crear una nueva conversación cuando se agenda una cita
function crearConversacion(adultoMayorEmail, acompananteEmail, citaId, servicio) {
  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  
  // Verificar si ya existe una conversación para esta cita
  const conversacionExistente = conversaciones.find(c => c.citaId === citaId);
  if (conversacionExistente) {
    return conversacionExistente;
  }

  const nuevaConversacion = {
    id: Date.now().toString(),
    citaId: citaId,
    adultoMayorEmail: adultoMayorEmail,
    acompananteEmail: acompananteEmail,
    servicio: servicio,
    fechaCreacion: new Date().toISOString(),
    ultimoMensaje: null,
    ultimaActualizacion: new Date().toISOString()
  };

  conversaciones.push(nuevaConversacion);
  if (typeof guardarEnBaseDatos === 'function') {
    guardarEnBaseDatos('conversaciones', conversaciones);
  } else {
    localStorage.setItem('conversaciones', JSON.stringify(conversaciones));
  }
  
  return nuevaConversacion;
}

// Obtener todas las conversaciones del usuario actual (solo las que tienen cita agendada)
function obtenerConversacionesUsuario() {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) return [];

  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  const usuarios = obtenerUsuarios();
  
  // Filtrar conversaciones donde el usuario actual participa Y que tengan una cita asociada
  return conversaciones
    .filter(conv => {
      // Verificar que el usuario participa en la conversación (case-insensitive)
      const emailActual = usuarioActual.email.toLowerCase();
      const participa = conv.adultoMayorEmail.toLowerCase() === emailActual || 
                        conv.acompananteEmail.toLowerCase() === emailActual;
      if (!participa) return false;
      
      // Verificar que existe una cita asociada a esta conversación
      const tieneCita = citas.some(cita => {
        // Verificar por citaId o por emails de participantes (case-insensitive)
        const citaAdultoMayorEmail = cita.adultoMayor?.email?.toLowerCase() || '';
        const citaAcompananteEmail = (cita.acompananteId || cita.acompanante?.email || '').toLowerCase();
        const convAdultoMayorEmail = conv.adultoMayorEmail.toLowerCase();
        const convAcompananteEmail = conv.acompananteEmail.toLowerCase();
        
        return cita.fechaCreacion === conv.citaId || 
               (citaAdultoMayorEmail === convAdultoMayorEmail && 
                citaAcompananteEmail === convAcompananteEmail);
      });
      
      return tieneCita;
    })
    .map(conv => {
      // Obtener información del otro participante (case-insensitive)
      const emailActual = usuarioActual.email.toLowerCase();
      const otroEmail = conv.adultoMayorEmail.toLowerCase() === emailActual 
        ? conv.acompananteEmail 
        : conv.adultoMayorEmail;
      
      const otroUsuario = usuarios.find(u => u.email === otroEmail);
      
      return {
        ...conv,
        otroParticipante: otroUsuario ? {
          nombre: `${otroUsuario.nombre} ${otroUsuario.apellido}`,
          email: otroEmail,
          avatar: otroUsuario.avatar || null,
          iniciales: (otroUsuario.nombre?.charAt(0) || '') + (otroUsuario.apellido?.charAt(0) || '')
        } : {
          nombre: 'Usuario',
          email: otroEmail,
          avatar: null,
          iniciales: 'U'
        }
      };
    })
    .sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion));
}

// Obtener una conversación por ID
function obtenerConversacion(conversacionId) {
  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  return conversaciones.find(c => c.id === conversacionId);
}

// ============================================
// GESTIÓN DE MENSAJES
// ============================================

// Enviar un mensaje
function enviarMensaje(conversacionId, texto, remitenteEmail) {
  if (!texto || texto.trim() === '') return null;

  const mensajes = JSON.parse(localStorage.getItem('mensajes') || '[]');
  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  
  const nuevoMensaje = {
    id: Date.now().toString(),
    conversacionId: conversacionId,
    remitenteEmail: remitenteEmail,
    texto: texto.trim(),
    fechaCreacion: new Date().toISOString(),
    leido: false
  };

  mensajes.push(nuevoMensaje);
  if (typeof guardarEnBaseDatos === 'function') {
    guardarEnBaseDatos('mensajes', mensajes);
  } else {
    localStorage.setItem('mensajes', JSON.stringify(mensajes));
  }

  // Actualizar la conversación
  const conversacion = conversaciones.find(c => c.id === conversacionId);
  if (conversacion) {
    conversacion.ultimoMensaje = texto.trim();
    conversacion.ultimaActualizacion = new Date().toISOString();
    if (typeof guardarEnBaseDatos === 'function') {
      guardarEnBaseDatos('conversaciones', conversaciones);
    } else {
      localStorage.setItem('conversaciones', JSON.stringify(conversaciones));
    }
  }

  return nuevoMensaje;
}

// Obtener mensajes de una conversación
function obtenerMensajes(conversacionId) {
  const mensajes = JSON.parse(localStorage.getItem('mensajes') || '[]');
  return mensajes
    .filter(m => m.conversacionId === conversacionId)
    .sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
}

// Marcar mensajes como leídos
function marcarMensajesLeidos(conversacionId, lectorEmail) {
  const mensajes = JSON.parse(localStorage.getItem('mensajes') || '[]');
  let actualizado = false;

  mensajes.forEach(mensaje => {
    if (mensaje.conversacionId === conversacionId && 
        mensaje.remitenteEmail !== lectorEmail && 
        !mensaje.leido) {
      mensaje.leido = true;
      actualizado = true;
    }
  });

  if (actualizado) {
    localStorage.setItem('mensajes', JSON.stringify(mensajes));
  }
}

// ============================================
// INTERFAZ DE USUARIO
// ============================================

let conversacionActual = null;

// Cargar lista de conversaciones
function cargarConversaciones() {
  const conversaciones = obtenerConversacionesUsuario();
  const listaDiv = document.getElementById('listaConversaciones');
  const sinConversacionesDiv = document.getElementById('sinConversaciones');

  if (!listaDiv) return;

  if (conversaciones.length === 0) {
    listaDiv.style.display = 'none';
    if (sinConversacionesDiv) {
      sinConversacionesDiv.style.display = 'block';
    }
    return;
  }

  listaDiv.style.display = 'block';
  if (sinConversacionesDiv) {
    sinConversacionesDiv.style.display = 'none';
  }

  listaDiv.innerHTML = '';

  conversaciones.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'conversacion-item';
    item.dataset.conversacionId = conv.id;
    
    const avatar = conv.otroParticipante.avatar 
      ? `<img src="${conv.otroParticipante.avatar}" alt="${conv.otroParticipante.nombre}" class="conversacion-avatar-img">`
      : `<span class="conversacion-avatar-iniciales">${conv.otroParticipante.iniciales}</span>`;

    const ultimoMensaje = conv.ultimoMensaje || 'Sin mensajes';
    const fechaUltimo = conv.ultimaActualizacion 
      ? new Date(conv.ultimaActualizacion).toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    item.innerHTML = `
      <div class="conversacion-avatar">${avatar}</div>
      <div class="conversacion-info">
        <div class="conversacion-header">
          <h4 class="conversacion-nombre">${conv.otroParticipante.nombre}</h4>
          <span class="conversacion-fecha">${fechaUltimo}</span>
        </div>
        <p class="conversacion-servicio">${conv.servicio}</p>
        <p class="conversacion-ultimo-mensaje">${ultimoMensaje}</p>
      </div>
    `;

    item.addEventListener('click', () => abrirConversacion(conv.id));
    listaDiv.appendChild(item);
  });
}

// Abrir una conversación
function abrirConversacion(conversacionId) {
  const conversaciones = obtenerConversacionesUsuario();
  const conversacion = conversaciones.find(c => c.id === conversacionId);
  
  if (!conversacion) return;

  conversacionActual = conversacion;
  const usuarioActual = verificarSesion();

  // Mostrar área de chat
  document.getElementById('chatVacio').style.display = 'none';
  document.getElementById('chatActivo').style.display = 'flex';

  // Actualizar header del chat
  const otroParticipante = conversacion.otroParticipante;
  document.getElementById('chatNombre').textContent = otroParticipante.nombre;
  document.getElementById('chatServicio').textContent = conversacion.servicio;

  // Actualizar avatar
  const chatAvatar = document.getElementById('chatAvatar');
  if (otroParticipante.avatar) {
    chatAvatar.innerHTML = `<img src="${otroParticipante.avatar}" alt="${otroParticipante.nombre}">`;
  } else {
    chatAvatar.textContent = otroParticipante.iniciales;
  }

  // Cargar mensajes
  cargarMensajes(conversacionId);

  // Marcar mensajes como leídos
  if (usuarioActual) {
    marcarMensajesLeidos(conversacionId, usuarioActual.email);
  }

  // Resaltar conversación seleccionada
  document.querySelectorAll('.conversacion-item').forEach(item => {
    item.classList.remove('activa');
    if (item.dataset.conversacionId === conversacionId) {
      item.classList.add('activa');
    }
  });
}

// Cargar mensajes en el chat
function cargarMensajes(conversacionId) {
  const mensajes = obtenerMensajes(conversacionId);
  const mensajesDiv = document.getElementById('chatMensajes');
  const usuarioActual = verificarSesion();

  if (!mensajesDiv || !usuarioActual) return;

  mensajesDiv.innerHTML = '';

  if (mensajes.length === 0) {
    mensajesDiv.innerHTML = `
      <div class="mensaje-vacio">
        <p>No hay mensajes aún. ¡Comienza la conversación!</p>
      </div>
    `;
    return;
  }

  mensajes.forEach(mensaje => {
    const esMio = mensaje.remitenteEmail === usuarioActual.email;
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje ${esMio ? 'mensaje-propio' : 'mensaje-otro'}`;
    
    const fecha = new Date(mensaje.fechaCreacion).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    mensajeDiv.innerHTML = `
      <div class="mensaje-contenido">
        <p class="mensaje-texto">${mensaje.texto}</p>
        <span class="mensaje-fecha">${fecha}</span>
      </div>
    `;

    mensajesDiv.appendChild(mensajeDiv);
  });

  // Scroll al final
  mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
}

// Enviar mensaje desde el formulario
function manejarEnvioMensaje(e) {
  e.preventDefault();
  
  if (!conversacionActual) return;

  const input = document.getElementById('inputMensaje');
  const texto = input.value.trim();

  if (!texto) return;

  const usuarioActual = verificarSesion();
  if (!usuarioActual) return;

  enviarMensaje(conversacionActual.id, texto, usuarioActual.email);
  input.value = '';

  // Recargar mensajes
  cargarMensajes(conversacionActual.id);
  
  // Actualizar lista de conversaciones
  cargarConversaciones();
}

// Inicializar eventos
document.addEventListener('DOMContentLoaded', function() {
  const formEnviarMensaje = document.getElementById('formEnviarMensaje');
  if (formEnviarMensaje) {
    formEnviarMensaje.addEventListener('submit', manejarEnvioMensaje);
  }

  // Verificar si hay una conversación para abrir automáticamente (desde Mis Citas)
  const conversacionParaAbrir = sessionStorage.getItem('abrirConversacion');
  if (conversacionParaAbrir) {
    sessionStorage.removeItem('abrirConversacion');
    // Esperar un momento para que las conversaciones se carguen
    setTimeout(() => {
      abrirConversacion(conversacionParaAbrir);
    }, 500);
  }

  // Auto-refrescar mensajes cada 5 segundos
  setInterval(() => {
    if (conversacionActual) {
      cargarMensajes(conversacionActual.id);
    }
  }, 5000);
});

