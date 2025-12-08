// Sistema de Mis Citas

// ============================================
// OBTENER CITAS DEL USUARIO
// ============================================

function obtenerMisCitas() {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) {
    console.log('❌ No hay sesión activa');
    return [];
  }

  const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  console.log('📋 Total de citas en localStorage:', citas.length);
  
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.email.toLowerCase() === usuarioActual.email.toLowerCase());
  
  if (!usuario) {
    console.log('❌ Usuario no encontrado en la base de datos. Email buscado:', usuarioActual.email);
    console.log('📧 Emails disponibles:', usuarios.map(u => u.email));
    return [];
  }
  
  console.log('✅ Usuario encontrado:', usuario.email, 'Tipo:', usuario.tipoUsuario);

  // Determinar si es adulto mayor o acompañante
  const esAcompanante = usuario.tipoUsuario === 'acompanante' || usuario.tipoUsuario === 'compania';
  
  // Filtrar citas según el tipo de usuario
  let misCitas = [];
  
  const emailActual = usuarioActual.email.toLowerCase();
  console.log('🔍 Buscando citas para email:', emailActual);
  console.log('👤 Tipo de usuario:', esAcompanante ? 'Acompañante' : 'Adulto Mayor');
  
  if (esAcompanante) {
    // Si es acompañante, buscar citas donde él es el acompañante
    console.log('🔍 Buscando como acompañante...');
    misCitas = citas.filter(cita => {
      const emailAcompanante = (cita.acompananteId || cita.acompanante?.email || '').toLowerCase();
      const coincide = emailAcompanante === emailActual;
      if (coincide) {
        console.log('✅ Cita encontrada para acompañante:', {
          servicio: cita.servicio,
          fecha: cita.fecha,
          acompananteId: cita.acompananteId,
          acompananteEmail: cita.acompanante?.email
        });
      } else {
        console.log('❌ Cita no coincide:', {
          servicio: cita.servicio,
          acompananteId: cita.acompananteId,
          acompananteEmail: cita.acompanante?.email,
          emailBuscado: emailActual
        });
      }
      return coincide;
    });
  } else {
    // Si es adulto mayor, buscar citas donde él es el adulto mayor
    console.log('🔍 Buscando como adulto mayor...');
    misCitas = citas.filter(cita => {
      const emailAdultoMayor = (cita.adultoMayor?.email || '').toLowerCase();
      const coincide = emailAdultoMayor === emailActual;
      if (coincide) {
        console.log('✅ Cita encontrada para adulto mayor:', {
          servicio: cita.servicio,
          fecha: cita.fecha,
          adultoMayorEmail: cita.adultoMayor?.email
        });
      } else {
        console.log('❌ Cita no coincide:', {
          servicio: cita.servicio,
          adultoMayorEmail: cita.adultoMayor?.email,
          emailBuscado: emailActual
        });
      }
      return coincide;
    });
  }
  
  console.log('📊 Citas encontradas para el usuario:', misCitas.length);
  
  // Ordenar por fecha (más recientes primero)
  return misCitas.sort((a, b) => {
    const fechaA = new Date(a.fechaCreacion || a.fecha);
    const fechaB = new Date(b.fechaCreacion || b.fecha);
    return fechaB - fechaA;
  });
}

// ============================================
// OBTENER CONVERSACIÓN DE UNA CITA
// ============================================

function obtenerConversacionDeCita(cita) {
  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  
  // Buscar conversación por citaId
  return conversaciones.find(conv => conv.citaId === cita.fechaCreacion);
}

// ============================================
// ABRIR CHAT DESDE UNA CITA
// ============================================

function abrirChatDesdeCita(cita) {
  const conversacion = obtenerConversacionDeCita(cita);
  
  if (!conversacion) {
    alert('No se encontró la conversación para esta cita. Por favor, contacta al soporte.');
    return;
  }

  // Guardar el ID de la conversación en sessionStorage para que el chat lo abra automáticamente
  sessionStorage.setItem('abrirConversacion', conversacion.id);
  
  // Redirigir al chat
  window.location.href = 'chat.html';
}

// ============================================
// CARGAR Y MOSTRAR CITAS
// ============================================

function cargarMisCitas() {
  const misCitas = obtenerMisCitas();
  const usuarios = obtenerUsuarios();
  const usuarioActual = verificarSesion();
  const usuario = usuarios.find(u => u.email === usuarioActual?.email);
  const esAcompanante = usuario && (usuario.tipoUsuario === 'acompanante' || usuario.tipoUsuario === 'compania');
  
  const citasContainer = document.getElementById('citasContainer');
  const sinCitas = document.getElementById('sinCitas');

  if (!citasContainer) return;

  if (misCitas.length === 0) {
    citasContainer.style.display = 'none';
    if (sinCitas) {
      sinCitas.style.display = 'block';
    }
    return;
  }

  citasContainer.style.display = 'grid';
  if (sinCitas) {
    sinCitas.style.display = 'none';
  }

  citasContainer.innerHTML = '';

  misCitas.forEach(cita => {
    const citaCard = document.createElement('div');
    citaCard.className = 'cita-card';

    // Obtener información del otro participante
    let otroParticipante = null;
    if (esAcompanante) {
      // Si es acompañante, mostrar info del adulto mayor
      otroParticipante = cita.adultoMayor;
    } else {
      // Si es adulto mayor, buscar info del acompañante
      const acompanante = usuarios.find(u => 
        u.email === cita.acompananteId || u.email === cita.acompanante?.email
      );
      if (acompanante) {
        otroParticipante = {
          nombre: `${acompanante.nombre} ${acompanante.apellido}`,
          email: acompanante.email,
          telefono: acompanante.telefono || 'N/A'
        };
      } else {
        otroParticipante = cita.acompanante || {
          nombre: 'Acompañante',
          email: cita.acompananteId || 'N/A',
          telefono: 'N/A'
        };
      }
    }

    // Formatear fecha
    const fechaFormateada = cita.fecha 
      ? new Date(cita.fecha).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Fecha no especificada';

    // Obtener lugar
    const lugar = cita.lugar || cita.centroMedico || cita.lugarEvento || cita.lugarCompras || cita.entidadTramite || 'No especificado';

    // Verificar si existe conversación
    const conversacion = obtenerConversacionDeCita(cita);
    const tieneConversacion = !!conversacion;

    citaCard.innerHTML = `
      <div class="cita-header">
        <div class="cita-servicio">
          <span class="cita-icon">${obtenerIconoServicio(cita.servicio)}</span>
          <h3>${cita.servicio || 'Servicio'}</h3>
        </div>
        <span class="cita-estado">Activa</span>
      </div>
      
      <div class="cita-info">
        <div class="cita-info-item">
          <span class="cita-label">📅 Fecha:</span>
          <span class="cita-value">${fechaFormateada}</span>
        </div>
        <div class="cita-info-item">
          <span class="cita-label">🕐 Hora:</span>
          <span class="cita-value">${cita.hora || 'No especificada'}</span>
        </div>
        <div class="cita-info-item">
          <span class="cita-label">📍 Lugar:</span>
          <span class="cita-value">${lugar}</span>
        </div>
        <div class="cita-info-item">
          <span class="cita-label">${esAcompanante ? '👴' : '🤝'} ${esAcompanante ? 'Adulto Mayor:' : 'Acompañante:'}</span>
          <span class="cita-value">${otroParticipante?.nombre || 'N/A'}</span>
        </div>
        ${cita.tipo ? `
        <div class="cita-info-item">
          <span class="cita-label">📋 Tipo:</span>
          <span class="cita-value">${cita.tipo}</span>
        </div>
        ` : ''}
        ${cita.observaciones ? `
        <div class="cita-info-item">
          <span class="cita-label">📝 Observaciones:</span>
          <span class="cita-value">${cita.observaciones}</span>
        </div>
        ` : ''}
      </div>

      <div class="cita-acciones">
        ${tieneConversacion ? `
          <button class="btn-chat" data-cita-id="${cita.fechaCreacion}">
            💬 Iniciar Chat
          </button>
        ` : `
          <span class="sin-chat">Chat no disponible</span>
        `}
      </div>
    `;

    // Agregar event listener al botón de chat si existe
    if (tieneConversacion) {
      const btnChat = citaCard.querySelector('.btn-chat');
      if (btnChat) {
        btnChat.addEventListener('click', () => abrirChatDesdeCita(cita));
      }
    }

    citasContainer.appendChild(citaCard);
  });
}

// Función auxiliar para obtener icono según el servicio
function obtenerIconoServicio(servicio) {
  if (!servicio) return '📅';
  
  const servicioLower = servicio.toLowerCase();
  if (servicioLower.includes('medic') || servicioLower.includes('cita médica')) return '🏥';
  if (servicioLower.includes('evento')) return '🎉';
  if (servicioLower.includes('compra')) return '🛒';
  if (servicioLower.includes('trámite') || servicioLower.includes('tramite')) return '📄';
  return '📅';
}

