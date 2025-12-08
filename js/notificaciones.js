// JavaScript para página de notificaciones

// Cargar y mostrar notificaciones
function cargarNotificaciones() {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) {
    window.location.href = 'login.html';
    return;
  }

  const notificaciones = obtenerNotificaciones(usuarioActual.email);
  const listaDiv = document.getElementById('notificacionesList');
  const sinNotificacionesDiv = document.getElementById('sinNotificaciones');

  if (!listaDiv) return;

  if (notificaciones.length === 0) {
    listaDiv.style.display = 'none';
    if (sinNotificacionesDiv) {
      sinNotificacionesDiv.style.display = 'block';
    }
    return;
  }

  listaDiv.innerHTML = '';
  sinNotificacionesDiv.style.display = 'none';

  // Ordenar por fecha (más recientes primero)
  notificaciones.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

  notificaciones.forEach(notificacion => {
    const item = document.createElement('div');
    item.className = 'notificacion-item';
    item.dataset.id = notificacion.id;

    const fecha = new Date(notificacion.fechaCreacion);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let detallesHTML = '';
    if (notificacion.tipo === 'nueva_cita' && notificacion.datos) {
      detallesHTML = `
        <div class="notificacion-detalles">
          <p><strong>Servicio:</strong> ${notificacion.datos.servicio || 'Acompañamiento'}</p>
          <p><strong>Fecha:</strong> ${notificacion.datos.fecha || 'No especificada'}</p>
          <p><strong>Hora:</strong> ${notificacion.datos.hora || 'No especificada'}</p>
          <p><strong>Lugar:</strong> ${notificacion.datos.lugar || 'No especificado'}</p>
          ${notificacion.datos.adultoMayor ? `
            <p><strong>Cliente:</strong> ${notificacion.datos.adultoMayor.nombre}</p>
            ${notificacion.datos.adultoMayor.telefono ? `<p><strong>Teléfono:</strong> ${notificacion.datos.adultoMayor.telefono}</p>` : ''}
          ` : ''}
        </div>
      `;
    }

    item.innerHTML = `
      <div class="notificacion-header">
        <div>
          <div class="notificacion-titulo">${notificacion.datos?.mensaje || 'Nueva notificación'}</div>
          <div class="notificacion-fecha">${fechaFormateada}</div>
        </div>
        <button class="btn-marcar-leida" onclick="marcarComoLeida('${notificacion.id}')">Marcar como leída</button>
      </div>
      <div class="notificacion-mensaje">
        ${notificacion.datos?.mensaje || 'Tienes una nueva notificación'}
      </div>
      ${detallesHTML}
    `;

    listaDiv.appendChild(item);
  });
}

// Marcar notificación como leída
function marcarComoLeida(id) {
  marcarNotificacionLeida(id);
  cargarNotificaciones();
  actualizarBadgeNotificaciones();
}

// Actualizar badge de notificaciones en la barra de navegación
function actualizarBadgeNotificaciones() {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) return;

  const numero = obtenerNumeroNotificaciones(usuarioActual.email);
  const badge = document.getElementById('notificationBadge');

  if (badge) {
    if (numero > 0) {
      badge.textContent = numero > 99 ? '99+' : numero;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Actualizar badge en todas las páginas
document.addEventListener('DOMContentLoaded', function() {
  actualizarBadgeNotificaciones();
  
  // Actualizar cada 30 segundos
  setInterval(actualizarBadgeNotificaciones, 30000);
});
