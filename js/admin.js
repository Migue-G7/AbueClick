// Sistema de Administrador - AbueClick

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

function mostrarTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Desactivar todos los botones
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar el tab seleccionado
  const tabContent = document.getElementById(`tab-${tabName}`);
  if (tabContent) {
    tabContent.classList.add('active');
  }
  
  // Activar el botón correspondiente
  const btn = event.target;
  if (btn) {
    btn.classList.add('active');
  }
  
  // Cargar contenido según el tab
  switch(tabName) {
    case 'usuarios':
      cargarUsuarios();
      break;
    case 'citas':
      cargarCitas();
      break;
    case 'conversaciones':
      cargarConversaciones();
      break;
    case 'notificaciones':
      cargarNotificaciones();
      break;
    case 'database':
      actualizarInfoBaseDatos();
      break;
  }
}

// Actualizar información de base de datos
function actualizarInfoBaseDatos() {
  const ultimaActualizacion = localStorage.getItem('ultimaActualizacion');
  const fechaElement = document.getElementById('ultimaActualizacionDB');
  const estadoElement = document.getElementById('estadoSincronizacion');
  
  if (fechaElement) {
    if (ultimaActualizacion) {
      const fecha = new Date(ultimaActualizacion);
      fechaElement.textContent = fecha.toLocaleString('es-ES');
    } else {
      fechaElement.textContent = 'Nunca';
    }
  }
  
  if (estadoElement) {
    // Intentar verificar si el archivo existe
    fetch('database.json')
      .then(response => {
        if (response.ok) {
          estadoElement.textContent = '✅ Archivo database.json disponible';
          estadoElement.style.color = '#27ae60';
        } else {
          estadoElement.textContent = '⚠️ Archivo database.json no encontrado (usando localStorage)';
          estadoElement.style.color = '#f39c12';
        }
      })
      .catch(() => {
        estadoElement.textContent = '⚠️ No se puede acceder a database.json (usando localStorage)';
        estadoElement.style.color = '#f39c12';
      });
  }
}

// Manejar importación de base de datos
function manejarImportarDB(event) {
  const archivo = event.target.files[0];
  if (!archivo) return;
  
  if (archivo.type !== 'application/json' && !archivo.name.endsWith('.json')) {
    alert('Por favor, selecciona un archivo JSON válido.');
    return;
  }
  
  if (confirm('¿Estás seguro de que deseas importar esta base de datos? Los datos locales se combinarán con los datos importados.')) {
    importarBaseDatos(archivo)
      .then(() => {
        alert('Base de datos importada exitosamente. Recarga la página para ver los cambios.');
        actualizarInfoBaseDatos();
        // Recargar todas las estadísticas
        cargarEstadisticas();
      })
      .catch(error => {
        alert('Error al importar la base de datos: ' + error.message);
      });
  }
  
  // Limpiar el input
  event.target.value = '';
}

// ============================================
// ESTADÍSTICAS
// ============================================

function cargarEstadisticas() {
  const usuarios = obtenerUsuarios();
  const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  
  // Contar usuarios por tipo
  const totalUsuarios = usuarios.length;
  const adultosMayores = usuarios.filter(u => u.tipoUsuario === 'adultoMayor').length;
  const acompanantes = usuarios.filter(u => u.tipoUsuario === 'acompanante').length;
  
  // Actualizar estadísticas
  document.getElementById('totalUsuarios').textContent = totalUsuarios;
  document.getElementById('totalAdultosMayores').textContent = adultosMayores;
  document.getElementById('totalAcompanantes').textContent = acompanantes;
  document.getElementById('totalCitas').textContent = citas.length;
  document.getElementById('totalConversaciones').textContent = conversaciones.length;
  document.getElementById('totalNotificaciones').textContent = notificaciones.length;
}

// ============================================
// GESTIÓN DE USUARIOS
// ============================================

function cargarUsuarios() {
  const usuarios = obtenerUsuarios();
  const listaDiv = document.getElementById('usuariosList');
  if (!listaDiv) return;
  
  listaDiv.innerHTML = '';
  
  if (usuarios.length === 0) {
    listaDiv.innerHTML = '<p class="sin-datos">No hay usuarios registrados</p>';
    return;
  }
  
  usuarios.forEach(usuario => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    
    const tipoUsuario = usuario.tipoUsuario === 'adultoMayor' ? '👴 Adulto Mayor' : 
                       usuario.tipoUsuario === 'acompanante' ? '🤝 Acompañante' :
                       usuario.tipoUsuario === 'administrador' ? '⚙️ Administrador' : '❓ Usuario';
    
    item.innerHTML = `
      <div class="admin-item-header">
        <div>
          <h4>${usuario.nombre} ${usuario.apellido}</h4>
          <p class="admin-item-meta">${usuario.email}</p>
        </div>
        <span class="admin-badge">${tipoUsuario}</span>
      </div>
      <div class="admin-item-details">
        <p><strong>Teléfono:</strong> ${usuario.telefono || 'No registrado'}</p>
        <p><strong>Ciudad:</strong> ${usuario.ciudad || 'No registrada'}</p>
        <p><strong>Fecha de registro:</strong> ${usuario.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString('es-ES') : 'No disponible'}</p>
        ${usuario.tipoUsuario === 'acompanante' ? `<p><strong>Experiencia:</strong> ${usuario.experiencia || 'No especificada'}</p>` : ''}
        ${usuario.tipoUsuario === 'adultoMayor' ? `<p><strong>Fecha de nacimiento:</strong> ${usuario.fechaNacimiento || 'No registrada'}</p>` : ''}
      </div>
      ${usuario.tipoUsuario !== 'administrador' ? `
        <div class="admin-item-actions">
          <button class="btn-admin-danger" onclick="eliminarUsuario('${usuario.email}')">Eliminar Usuario</button>
        </div>
      ` : ''}
    `;
    
    listaDiv.appendChild(item);
  });
}

function filtrarUsuarios() {
  const filtro = document.getElementById('filtroTipoUsuario').value;
  const usuarios = obtenerUsuarios();
  const listaDiv = document.getElementById('usuariosList');
  if (!listaDiv) return;
  
  listaDiv.innerHTML = '';
  
  let usuariosFiltrados = usuarios;
  if (filtro !== 'todos') {
    usuariosFiltrados = usuarios.filter(u => u.tipoUsuario === filtro);
  }
  
  if (usuariosFiltrados.length === 0) {
    listaDiv.innerHTML = '<p class="sin-datos">No hay usuarios con este filtro</p>';
    return;
  }
  
  usuariosFiltrados.forEach(usuario => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    
    const tipoUsuario = usuario.tipoUsuario === 'adultoMayor' ? '👴 Adulto Mayor' : 
                       usuario.tipoUsuario === 'acompanante' ? '🤝 Acompañante' :
                       usuario.tipoUsuario === 'administrador' ? '⚙️ Administrador' : '❓ Usuario';
    
    item.innerHTML = `
      <div class="admin-item-header">
        <div>
          <h4>${usuario.nombre} ${usuario.apellido}</h4>
          <p class="admin-item-meta">${usuario.email}</p>
        </div>
        <span class="admin-badge">${tipoUsuario}</span>
      </div>
      <div class="admin-item-details">
        <p><strong>Teléfono:</strong> ${usuario.telefono || 'No registrado'}</p>
        <p><strong>Ciudad:</strong> ${usuario.ciudad || 'No registrada'}</p>
        <p><strong>Fecha de registro:</strong> ${usuario.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString('es-ES') : 'No disponible'}</p>
      </div>
      ${usuario.tipoUsuario !== 'administrador' ? `
        <div class="admin-item-actions">
          <button class="btn-admin-danger" onclick="eliminarUsuario('${usuario.email}')">Eliminar Usuario</button>
        </div>
      ` : ''}
    `;
    
    listaDiv.appendChild(item);
  });
}

function eliminarUsuario(email) {
  if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) {
    return;
  }
  
  const usuarios = obtenerUsuarios();
  const usuariosFiltrados = usuarios.filter(u => u.email !== email);
  localStorage.setItem('usuarios', JSON.stringify(usuariosFiltrados));
  
  // También eliminar citas relacionadas
  const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  const citasFiltradas = citas.filter(c => 
    c.adultoMayor?.email !== email && c.acompanante?.email !== email
  );
  localStorage.setItem('citas', JSON.stringify(citasFiltradas));
  
  alert('Usuario eliminado exitosamente');
  cargarUsuarios();
  cargarEstadisticas();
}

// ============================================
// GESTIÓN DE CITAS
// ============================================

function cargarCitas() {
  const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  const listaDiv = document.getElementById('citasList');
  if (!listaDiv) return;
  
  listaDiv.innerHTML = '';
  
  if (citas.length === 0) {
    listaDiv.innerHTML = '<p class="sin-datos">No hay citas agendadas</p>';
    return;
  }
  
  // Ordenar por fecha más reciente
  citas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  
  citas.forEach(cita => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    
    const fechaFormateada = cita.fecha 
      ? new Date(cita.fecha).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Fecha no especificada';
    
    item.innerHTML = `
      <div class="admin-item-header">
        <div>
          <h4>${cita.servicio || 'Servicio'}</h4>
          <p class="admin-item-meta">${cita.tipo || 'Tipo no especificado'}</p>
        </div>
        <span class="admin-badge">📅 Cita</span>
      </div>
      <div class="admin-item-details">
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Hora:</strong> ${cita.hora || 'No especificada'}</p>
        <p><strong>Lugar:</strong> ${cita.lugar || 'No especificado'}</p>
        <p><strong>Adulto Mayor:</strong> ${cita.adultoMayor?.nombre || 'N/A'} (${cita.adultoMayor?.email || 'N/A'})</p>
        <p><strong>Acompañante:</strong> ${cita.acompanante?.nombre || 'N/A'} (${cita.acompanante?.email || 'N/A'})</p>
        ${cita.observaciones ? `<p><strong>Observaciones:</strong> ${cita.observaciones}</p>` : ''}
        <p><strong>Fecha de creación:</strong> ${new Date(cita.fechaCreacion).toLocaleDateString('es-ES')}</p>
      </div>
      <div class="admin-item-actions">
        <button class="btn-admin-danger" onclick="eliminarCita('${cita.fechaCreacion}')">Eliminar Cita</button>
      </div>
    `;
    
    listaDiv.appendChild(item);
  });
}

function eliminarCita(fechaCreacion) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.')) {
    return;
  }
  
  const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  const citasFiltradas = citas.filter(c => c.fechaCreacion !== fechaCreacion);
  localStorage.setItem('citas', JSON.stringify(citasFiltradas));
  
  alert('Cita eliminada exitosamente');
  cargarCitas();
  cargarEstadisticas();
}

// ============================================
// GESTIÓN DE CONVERSACIONES
// ============================================

function cargarConversaciones() {
  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  const listaDiv = document.getElementById('conversacionesList');
  if (!listaDiv) return;
  
  listaDiv.innerHTML = '';
  
  if (conversaciones.length === 0) {
    listaDiv.innerHTML = '<p class="sin-datos">No hay conversaciones activas</p>';
    return;
  }
  
  conversaciones.sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion));
  
  conversaciones.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    
    item.innerHTML = `
      <div class="admin-item-header">
        <div>
          <h4>Conversación entre ${conv.adultoMayorEmail} y ${conv.acompananteEmail}</h4>
          <p class="admin-item-meta">${conv.servicio || 'Servicio'}</p>
        </div>
        <span class="admin-badge">💬 Chat</span>
      </div>
      <div class="admin-item-details">
        <p><strong>Adulto Mayor:</strong> ${conv.adultoMayorEmail}</p>
        <p><strong>Acompañante:</strong> ${conv.acompananteEmail}</p>
        <p><strong>Último mensaje:</strong> ${conv.ultimoMensaje || 'Sin mensajes'}</p>
        <p><strong>Fecha de creación:</strong> ${new Date(conv.fechaCreacion).toLocaleDateString('es-ES')}</p>
        <p><strong>Última actualización:</strong> ${new Date(conv.ultimaActualizacion).toLocaleDateString('es-ES')}</p>
      </div>
      <div class="admin-item-actions">
        <button class="btn-admin-danger" onclick="eliminarConversacion('${conv.id}')">Eliminar Conversación</button>
      </div>
    `;
    
    listaDiv.appendChild(item);
  });
}

function eliminarConversacion(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta conversación? También se eliminarán todos los mensajes asociados.')) {
    return;
  }
  
  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  const conversacionesFiltradas = conversaciones.filter(c => c.id !== id);
  localStorage.setItem('conversaciones', JSON.stringify(conversacionesFiltradas));
  
  // Eliminar mensajes asociados
  const mensajes = JSON.parse(localStorage.getItem('mensajes') || '[]');
  const mensajesFiltrados = mensajes.filter(m => m.conversacionId !== id);
  localStorage.setItem('mensajes', JSON.stringify(mensajesFiltrados));
  
  alert('Conversación eliminada exitosamente');
  cargarConversaciones();
  cargarEstadisticas();
}

// ============================================
// GESTIÓN DE NOTIFICACIONES
// ============================================

function cargarNotificaciones() {
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  const listaDiv = document.getElementById('notificacionesList');
  if (!listaDiv) return;
  
  listaDiv.innerHTML = '';
  
  if (notificaciones.length === 0) {
    listaDiv.innerHTML = '<p class="sin-datos">No hay notificaciones</p>';
    return;
  }
  
  notificaciones.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  
  notificaciones.forEach(notif => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    
    const estado = notif.leida ? 'Leída' : 'No leída';
    const tipoNotif = notif.tipo === 'nueva_cita' ? '📅 Nueva Cita' : '🔔 Notificación';
    
    item.innerHTML = `
      <div class="admin-item-header">
        <div>
          <h4>${notif.datos?.mensaje || 'Notificación'}</h4>
          <p class="admin-item-meta">Para: ${notif.paraEmail}</p>
        </div>
        <span class="admin-badge ${notif.leida ? '' : 'unread'}">${tipoNotif} - ${estado}</span>
      </div>
      <div class="admin-item-details">
        <p><strong>Tipo:</strong> ${notif.tipo}</p>
        <p><strong>Fecha de creación:</strong> ${new Date(notif.fechaCreacion).toLocaleDateString('es-ES')}</p>
        ${notif.datos?.servicio ? `<p><strong>Servicio:</strong> ${notif.datos.servicio}</p>` : ''}
        ${notif.datos?.fecha ? `<p><strong>Fecha de cita:</strong> ${notif.datos.fecha}</p>` : ''}
      </div>
      <div class="admin-item-actions">
        <button class="btn-admin-danger" onclick="eliminarNotificacion('${notif.id}')">Eliminar Notificación</button>
      </div>
    `;
    
    listaDiv.appendChild(item);
  });
}

function eliminarNotificacion(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
    return;
  }
  
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  const notificacionesFiltradas = notificaciones.filter(n => n.id !== id);
  localStorage.setItem('notificaciones', JSON.stringify(notificacionesFiltradas));
  
  alert('Notificación eliminada exitosamente');
  cargarNotificaciones();
  cargarEstadisticas();
}

