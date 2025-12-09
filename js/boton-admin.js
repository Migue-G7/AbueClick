// Botón flotante para administradores - Volver al panel de administración
// Solo visible para usuarios administradores

let botonAdmin = null;

// Inicializar el botón cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  inicializarBotonAdmin();
});

// Inicializar el botón de administrador
function inicializarBotonAdmin() {
  // No mostrar el botón en la página de administración
  if (window.location.pathname.includes('admin.html')) {
    return;
  }

  // Verificar si el usuario es administrador
  if (typeof verificarSesion === 'function') {
    const usuarioActual = verificarSesion();
    
    if (usuarioActual && usuarioActual.esAdministrador) {
      crearBotonAdmin();
    }
  }
}

// Crear el botón flotante de administrador
function crearBotonAdmin() {
  botonAdmin = document.createElement('div');
  botonAdmin.id = 'boton-admin-flotante';
  botonAdmin.className = 'boton-admin-flotante';
  botonAdmin.innerHTML = `
    <a href="admin.html" class="btn-admin-volver" title="Volver al Panel de Administración" aria-label="Volver al Panel de Administración">
      <span class="icono-admin">⚙️</span>
      <span class="texto-admin">Panel Admin</span>
    </a>
  `;
  document.body.appendChild(botonAdmin);
}

// Función para verificar y actualizar la visibilidad del botón
function actualizarBotonAdmin() {
  // No mostrar el botón en la página de administración
  if (window.location.pathname.includes('admin.html')) {
    if (botonAdmin) {
      botonAdmin.remove();
      botonAdmin = null;
    }
    return;
  }

  // Verificar si el usuario es administrador
  if (typeof verificarSesion === 'function') {
    const usuarioActual = verificarSesion();
    
    if (usuarioActual && usuarioActual.esAdministrador) {
      if (!botonAdmin) {
        crearBotonAdmin();
      }
    } else {
      if (botonAdmin) {
        botonAdmin.remove();
        botonAdmin = null;
      }
    }
  }
}

// Actualizar el botón cuando cambia la sesión
if (typeof window !== 'undefined') {
  // Verificar periódicamente si cambió el estado de la sesión
  setInterval(actualizarBotonAdmin, 1000);
}

