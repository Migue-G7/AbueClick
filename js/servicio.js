// JavaScript para páginas de servicio

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

// Crear una notificación
function crearNotificacion(paraEmail, tipo, datos) {
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  
  const notificacion = {
    id: Date.now().toString(),
    paraEmail: paraEmail,
    tipo: tipo, // 'nueva_cita', 'cita_cancelada', etc.
    datos: datos,
    leida: false,
    fechaCreacion: new Date().toISOString()
  };
  
  notificaciones.push(notificacion);
  if (typeof guardarEnBaseDatos === 'function') {
    guardarEnBaseDatos('notificaciones', notificaciones);
  } else {
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
  }
  
  return notificacion;
}

// Obtener notificaciones de un usuario
function obtenerNotificaciones(email) {
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  return notificaciones.filter(n => n.paraEmail === email && !n.leida);
}

// Marcar notificación como leída
function marcarNotificacionLeida(id) {
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  const notificacion = notificaciones.find(n => n.id === id);
  if (notificacion) {
    notificacion.leida = true;
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
  }
}

// Obtener número de notificaciones no leídas
function obtenerNumeroNotificaciones(email) {
  return obtenerNotificaciones(email).length;
}

// ============================================
// BÚSQUEDA DE ACOMPAÑANTES
// ============================================

// Función para obtener acompañantes registrados
function obtenerAcompanantesRegistrados() {
  const usuarios = obtenerUsuarios();
  
  // Filtrar solo acompañantes
  const acompanantes = usuarios.filter(usuario => usuario.tipoUsuario === 'acompanante');
  
  // Mapear a formato esperado
  return acompanantes.map((usuario, index) => {
    // Determinar especialidad basada en nivel de educación o experiencia
    let especialidad = 'Acompañante';
    if (usuario.nivelEducacion) {
      const nivel = usuario.nivelEducacion.toLowerCase();
      if (nivel.includes('enfermer') || nivel.includes('salud')) {
        especialidad = 'Enfermería';
      } else if (nivel.includes('medicina')) {
        especialidad = 'Medicina';
      } else if (nivel.includes('geriatr') || nivel.includes('gerontolog')) {
        especialidad = 'Geriatría';
      } else if (nivel.includes('psicolog')) {
        especialidad = 'Psicología';
      }
    }
    
    return {
      id: usuario.email, // Usar email como ID único
      nombre: `${usuario.nombre} ${usuario.apellido}`,
      experiencia: usuario.experiencia || 'Sin especificar',
      especialidad: especialidad,
      ciudad: usuario.ciudad ? usuario.ciudad.toLowerCase().replace(/\s+/g, '') : '',
      disponibilidad: usuario.disponibilidad || '',
      descripcion: usuario.informacionAdicional || 'Acompañante profesional disponible para ayudarle.',
      email: usuario.email,
      telefono: usuario.telefono || ''
    };
  });
}

// Función para buscar acompañantes con filtros
function buscarAcompanantes(filtros) {
  const acompanantes = obtenerAcompanantesRegistrados();
  
  return acompanantes.filter(acompanante => {
    // Filtro por ciudad
    if (filtros.ciudad) {
      const ciudadAcompanante = acompanante.ciudad;
      const ciudadFiltro = filtros.ciudad.toLowerCase();
      if (ciudadAcompanante !== ciudadFiltro && !ciudadAcompanante.includes(ciudadFiltro)) {
        return false;
      }
    }
    
    // Filtro por experiencia
    if (filtros.experiencia) {
      const expAcompanante = acompanante.experiencia;
      if (expAcompanante !== filtros.experiencia && !expAcompanante.includes(filtros.experiencia)) {
        return false;
      }
    }
    
    // Filtro por especialidad/tipo (opcional, no es estricto)
    // Este filtro es más flexible y no excluye si no coincide exactamente
    
    // Filtro por disponibilidad
    if (filtros.disponibilidad) {
      const dispAcompanante = acompanante.disponibilidad.toLowerCase();
      const dispFiltro = filtros.disponibilidad.toLowerCase();
      if (dispAcompanante !== dispFiltro && dispAcompanante !== 'completo' && dispFiltro !== 'completo') {
        return false;
      }
    }
    
    return true;
  });
}

// Función para mostrar resultados de búsqueda
function mostrarResultados(acompanantes) {
  const resultadosDiv = document.getElementById('resultadosBusqueda');
  const cuadriculaDiv = document.getElementById('cuadriculaAcompanantes');
  const selectAcompanante = document.getElementById('acompananteSeleccionado');

  if (!resultadosDiv || !cuadriculaDiv) return;

  resultadosDiv.style.display = 'block';
  cuadriculaDiv.innerHTML = '';
  selectAcompanante.innerHTML = '<option value="">Seleccione un acompañante</option>';

  if (acompanantes.length === 0) {
    cuadriculaDiv.innerHTML = '<p style="font-size: 18px; color: #666; grid-column: 1 / -1;">No se encontraron acompañantes con los criterios seleccionados.</p>';
    return;
  }

  acompanantes.forEach(acompanante => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-acompanante';
    tarjeta.dataset.id = acompanante.id;
    tarjeta.innerHTML = `
      <div class="nombre-acompanante">${acompanante.nombre}</div>
      <div class="info-acompanante">Experiencia: ${acompanante.experiencia}</div>
      <div class="info-acompanante">Ciudad: ${acompanante.ciudad ? acompanante.ciudad.charAt(0).toUpperCase() + acompanante.ciudad.slice(1) : 'No especificada'}</div>
      <div class="especialidad-acompanante">${acompanante.especialidad}</div>
      ${acompanante.telefono ? `<div class="info-acompanante">Teléfono: ${acompanante.telefono}</div>` : ''}
      <p style="margin-top: 10px; font-size: 16px; color: #666;">${acompanante.descripcion}</p>
    `;

    tarjeta.addEventListener('click', function() {
      document.querySelectorAll('.tarjeta-acompanante').forEach(t => t.classList.remove('seleccionada'));
      tarjeta.classList.add('seleccionada');
      selectAcompanante.value = acompanante.id;
    });

    cuadriculaDiv.appendChild(tarjeta);

    // Agregar opción al select
    const option = document.createElement('option');
    option.value = acompanante.id;
    option.textContent = `${acompanante.nombre} - ${acompanante.especialidad}`;
    selectAcompanante.appendChild(option);
  });
}

// Función para verificar si el usuario es acompañante
function esAcompanante() {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) return false;
  
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.email === usuarioActual.email);
  
  return usuario && usuario.tipoUsuario === 'acompanante';
}

// Función para configurar la página según el tipo de usuario
function configurarPaginaServicio() {
  if (esAcompanante()) {
    // Ocultar secciones de búsqueda y agendamiento
    const busquedaSection = document.querySelector('.busqueda-acompanante');
    const agendarSection = document.querySelector('.agendar-cita');
    
    if (busquedaSection) {
      busquedaSection.style.display = 'none';
    }
    
    if (agendarSection) {
      // Reemplazar el contenido de agendamiento con mensaje informativo
      agendarSection.innerHTML = `
        <div class="mensaje-acompanante">
          <h2>Información para Acompañantes</h2>
          <div class="info-box">
            <p class="info-texto">
              Como acompañante registrado, recibirás notificaciones cuando un adulto mayor te seleccione para un servicio de acompañamiento.
            </p>
            <div class="info-destacada">
              <h3>¿Cómo funciona?</h3>
              <ul>
                <li>✅ Los adultos mayores buscan acompañantes según sus necesidades</li>
                <li>✅ Cuando te seleccionen, recibirás una notificación con los detalles</li>
                <li>✅ Puedes ver tus notificaciones en el icono de campana 🔔</li>
                <li>✅ Mantén tu perfil actualizado para aparecer en las búsquedas</li>
              </ul>
            </div>
            <div class="info-acciones">
              <a href="notificaciones.html" class="btn-ver-notificaciones">Ver Mis Notificaciones</a>
              <a href="perfil.html" class="btn-editar-perfil">Editar Mi Perfil</a>
            </div>
          </div>
        </div>
      `;
    }
  }
}

// Manejar búsqueda de acompañantes
document.addEventListener('DOMContentLoaded', function() {
  // Configurar página según tipo de usuario
  configurarPaginaServicio();
  
  const formularioBusqueda = document.getElementById('formularioBusqueda');
  const formularioAgendar = document.getElementById('formularioAgendar');

  if (formularioBusqueda) {
    formularioBusqueda.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Verificar que el usuario tenga sesión activa
      const usuarioActual = verificarSesion();
      if (!usuarioActual) {
        alert('Por favor, inicia sesión para buscar acompañantes.');
        window.location.href = 'login.html';
        return;
      }
      
      // Verificar que el usuario no sea acompañante
      if (esAcompanante()) {
        alert('Los acompañantes no pueden buscar otros acompañantes. Esta función está disponible solo para adultos mayores.');
        return;
      }
      
      const filtros = {
        ciudad: document.getElementById('ciudad').value,
        experiencia: document.getElementById('experiencia').value,
        disponibilidad: document.getElementById('disponibilidad').value
      };

      const resultados = buscarAcompanantes(filtros);
      mostrarResultados(resultados);
    });
  }

  // Manejar agendamiento de cita
  if (formularioAgendar) {
    formularioAgendar.addEventListener('submit', function(e) {
      e.preventDefault();

      // Verificar que el usuario tenga sesión activa
      const usuarioActual = verificarSesion();
      if (!usuarioActual) {
        alert('Por favor, inicia sesión para agendar una cita.');
        window.location.href = 'login.html';
        return;
      }

      // Verificar que el usuario no sea acompañante
      if (esAcompanante()) {
        alert('Los acompañantes no pueden agendar citas. Solo los adultos mayores pueden solicitar servicios de acompañamiento.');
        return;
      }

      const formData = new FormData(formularioAgendar);
      const acompananteId = formData.get('acompananteSeleccionado');
      const observaciones = formData.get('observaciones') || '';

      if (!acompananteId) {
        alert('Por favor, primero busque y seleccione un acompañante.');
        return;
      }

      // Detectar el tipo de servicio desde el título de la página
      const servicioTipo = document.querySelector('h1').textContent.trim();
      
      // usuarioActual ya está definido arriba, no necesitamos declararlo de nuevo
      if (!usuarioActual) {
        alert('Error: No hay sesión activa. Por favor inicia sesión.');
        return;
      }

      const usuarios = obtenerUsuarios();
      const usuario = usuarios.find(u => u.email.toLowerCase() === usuarioActual.email.toLowerCase());
      
      // Obtener información del acompañante seleccionado
      const acompanantes = obtenerAcompanantesRegistrados();
      const acompananteSeleccionado = acompanantes.find(a => a.id === acompananteId || a.email === acompananteId);
      
      if (!acompananteSeleccionado || !acompananteSeleccionado.email) {
        alert('Error: No se pudo encontrar la información del acompañante seleccionado.');
        return;
      }

      // Crear objeto de cita con TODA la información necesaria
      const cita = {
        fecha: formData.get('fechaCita') || formData.get('fechaEvento') || formData.get('fechaCompras') || formData.get('fechaTramite'),
        hora: formData.get('horaCita') || formData.get('horaEvento') || formData.get('horaCompras') || formData.get('horaTramite'),
        lugar: formData.get('centroMedico') || formData.get('lugarEvento') || formData.get('lugarCompras') || formData.get('entidadTramite'),
        tipo: formData.get('tipoConsulta') || formData.get('tipoEventoAgendar') || formData.get('tipoComprasAgendar') || formData.get('tipoTramiteAgendar'),
        observaciones: observaciones,
        acompananteId: acompananteSeleccionado.email, // Guardar el EMAIL como ID
        servicio: servicioTipo,
        fechaCreacion: new Date().toISOString(),
        // Información del adulto mayor
        adultoMayor: usuario ? {
          nombre: `${usuario.nombre} ${usuario.apellido}`,
          email: usuario.email,
          telefono: usuario.telefono || ''
        } : {
          nombre: `${usuarioActual.nombre || ''} ${usuarioActual.apellido || ''}`.trim() || 'Usuario',
          email: usuarioActual.email,
          telefono: ''
        },
        // Información del acompañante
        acompanante: {
          nombre: acompananteSeleccionado.nombre,
          email: acompananteSeleccionado.email,
          telefono: acompananteSeleccionado.telefono || ''
        }
      };
      
      // Agregar campos específicos según el servicio
      if (formData.get('duracionEvento')) {
        cita.duracion = formData.get('duracionEvento');
      }
      if (formData.get('listaCompras')) {
        cita.listaCompras = formData.get('listaCompras');
      }
      if (formData.get('documentosNecesarios')) {
        cita.documentosNecesarios = formData.get('documentosNecesarios');
      }

      // Guardar cita en base de datos compartida
      const citas = JSON.parse(localStorage.getItem('citas') || '[]');
      citas.push(cita);
      if (typeof guardarEnBaseDatos === 'function') {
        guardarEnBaseDatos('citas', citas);
      } else {
        localStorage.setItem('citas', JSON.stringify(citas));
      }
      
      // Debug: Verificar que la cita se guardó correctamente
      console.log('=== CITA GUARDADA ===');
      console.log('Cita completa:', JSON.stringify(cita, null, 2));
      console.log('Adulto Mayor email:', cita.adultoMayor?.email);
      console.log('Acompañante email:', cita.acompanante?.email);
      console.log('Acompañante ID:', cita.acompananteId);
      console.log('Total de citas en sistema:', citas.length);
      
      // Verificar inmediatamente que se guardó
      const citasVerificadas = JSON.parse(localStorage.getItem('citas') || '[]');
      console.log('✅ Verificación - Total de citas después de guardar:', citasVerificadas.length);
      if (citasVerificadas.length > 0) {
        const ultimaCita = citasVerificadas[citasVerificadas.length - 1];
        console.log('✅ Última cita guardada:', {
          servicio: ultimaCita.servicio,
          adultoMayorEmail: ultimaCita.adultoMayor?.email,
          acompananteEmail: ultimaCita.acompanante?.email,
          acompananteId: ultimaCita.acompananteId
        });
      }

      // Crear conversación de chat entre el adulto mayor y el acompañante
      if (usuarioActual && acompananteSeleccionado && acompananteSeleccionado.email) {
        const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
        
        // Verificar si ya existe una conversación para esta cita
        const conversacionExistente = conversaciones.find(c => c.citaId === cita.fechaCreacion);
        
        if (!conversacionExistente) {
          const nuevaConversacion = {
            id: Date.now().toString(),
            citaId: cita.fechaCreacion,
            adultoMayorEmail: usuarioActual.email,
            acompananteEmail: acompananteSeleccionado.email,
            servicio: servicioTipo,
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
        }
      }

      // Crear notificación para el acompañante
      if (acompananteSeleccionado && acompananteSeleccionado.email) {
        crearNotificacion(
          acompananteSeleccionado.email,
          'nueva_cita',
          {
            mensaje: `Tienes una nueva solicitud de acompañamiento para ${servicioTipo}`,
            citaId: cita.fechaCreacion,
            fecha: cita.fecha,
            hora: cita.hora,
            lugar: cita.lugar,
            tipo: cita.tipo,
            adultoMayor: cita.adultoMayor,
            servicio: servicioTipo
          }
        );
      }

      alert('¡Cita agendada exitosamente! El acompañante recibirá una notificación. Serás redirigido al inicio.');
      formularioAgendar.reset();
      const resultadosDiv = document.getElementById('resultadosBusqueda');
      if (resultadosDiv) {
        resultadosDiv.style.display = 'none';
      }
      
      // Redirigir a la página de inicio
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    });
  }
});

