// Cargar datos del perfil del usuario
function cargarPerfil() {
  const usuarioActual = verificarSesion();
  
  if (!usuarioActual) {
    // Si no hay sesión, redirigir a login
    window.location.href = 'login.html';
    return;
  }

  // Obtener todos los usuarios para encontrar los datos completos
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.email === usuarioActual.email);

  if (usuario) {
    // Llenar el formulario con los datos del usuario
    document.getElementById('editarNombre').value = usuario.nombre || '';
    document.getElementById('editarApellido').value = usuario.apellido || '';
    document.getElementById('editarEmail').value = usuario.email || '';
    document.getElementById('editarTelefono').value = usuario.telefono || '';
    document.getElementById('editarFecha').value = usuario.fechaNacimiento || '';
    document.getElementById('editarCiudad').value = usuario.ciudad || '';
    document.getElementById('editarDisponibilidad').value = usuario.disponibilidad || '';
    document.getElementById('editarInfoAdicional').value = usuario.informacionAdicional || '';

    document.getElementById('nombrePerfil').textContent = `${usuario.nombre} ${usuario.apellido}`;
    document.getElementById('correoPerfil').textContent = usuario.email;

    const tipoUsuario = usuario.tipoUsuario === 'acompanante' ? 'Acompañante' : 'Adulto Mayor';
    document.getElementById('tipoPerfil').textContent = tipoUsuario;

    const iniciales = (usuario.nombre?.charAt(0) || '') + (usuario.apellido?.charAt(0) || '');
    document.getElementById('inicialesAvatar').textContent = iniciales.toUpperCase() || 'AC';
    document.getElementById('avatarUsuarioNav').textContent = iniciales.toUpperCase() || 'AC';

    if (usuario.tipoUsuario === 'acompanante') {
      document.getElementById('camposAcompanante').style.display = 'block';
      document.getElementById('editarExperiencia').value = usuario.experiencia || '';
      document.getElementById('editarNivelEducacion').value = usuario.nivelEducacion || '';
    }
  }
}

// Guardar cambios del perfil
function guardarPerfil(datosActualizados) {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) return { exito: false, mensaje: 'No hay sesión activa' };

  const usuarios = obtenerUsuarios();
  const indiceUsuario = usuarios.findIndex(u => u.email === usuarioActual.email);

  if (indiceUsuario !== -1) {
    usuarios[indiceUsuario] = { ...usuarios[indiceUsuario], ...datosActualizados };
    if (typeof guardarEnBaseDatos === 'function') {
      guardarEnBaseDatos('usuarios', usuarios);
    } else {
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    // Actualizar sesión
    localStorage.setItem('usuarioActual', JSON.stringify({
      email: datosActualizados.email || usuarioActual.email,
      nombre: datosActualizados.nombre || usuarioActual.nombre,
      apellido: datosActualizados.apellido || usuarioActual.apellido
    }));

    return { exito: true, mensaje: 'Perfil actualizado exitosamente' };
  }

  return { exito: false, mensaje: 'Usuario no encontrado' };
}

// Manejar cambio de avatar
function manejarCambioAvatar() {
  const input = document.getElementById('entradaAvatar');
  const avatarGrande = document.getElementById('avatarGrande');
  const inicialesAvatar = document.getElementById('inicialesAvatar');

  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        // Crear imagen
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';

        inicialesAvatar.style.display = 'none';
        avatarGrande.innerHTML = '';
        avatarGrande.appendChild(img);

        // Guardar imagen en localStorage (como base64)
        const usuarioActual = verificarSesion();
        if (usuarioActual) {
          const usuarios = obtenerUsuarios();
          const indiceUsuario = usuarios.findIndex(u => u.email === usuarioActual.email);
          if (indiceUsuario !== -1) {
            usuarios[indiceUsuario].avatar = e.target.result;
            if (typeof guardarEnBaseDatos === 'function') {
              guardarEnBaseDatos('usuarios', usuarios);
            } else {
              localStorage.setItem('usuarios', JSON.stringify(usuarios));
            }
            actualizarAvatarGlobal();
          }
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// Cargar avatar guardado
function cargarAvatar() {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) return;

  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.email === usuarioActual.email);

  if (usuario && usuario.avatar) {
    const avatarGrande = document.getElementById('avatarGrande');
    const inicialesAvatar = document.getElementById('inicialesAvatar');
    
    if (avatarGrande && inicialesAvatar) {
      const img = document.createElement('img');
      img.src = usuario.avatar;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';

      inicialesAvatar.style.display = 'none';
      avatarGrande.innerHTML = '';
      avatarGrande.appendChild(img);
    }
  }
  
  // Actualizar avatar en la barra de navegación usando la función global
  actualizarAvatarGlobal();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  cargarPerfil();
  cargarAvatar();
  manejarCambioAvatar();

  // Botón para cambiar avatar
  document.getElementById('botonEditarAvatar').addEventListener('click', function() {
    document.getElementById('entradaAvatar').click();
  });

  document.getElementById('botonCerrarSesion').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      cerrarSesion();
      alert('Sesión cerrada exitosamente');
      window.location.href = 'login.html';
    }
  });

  document.getElementById('botonEliminarCuenta').addEventListener('click', function() {
    eliminarCuenta();
  });

  document.getElementById('formularioPerfil').addEventListener('submit', function(e) {
    e.preventDefault();

    const datosActualizados = {
      nombre: document.getElementById('editarNombre').value,
      apellido: document.getElementById('editarApellido').value,
      email: document.getElementById('editarEmail').value,
      telefono: document.getElementById('editarTelefono').value,
      fechaNacimiento: document.getElementById('editarFecha').value,
      ciudad: document.getElementById('editarCiudad').value,
      disponibilidad: document.getElementById('editarDisponibilidad').value,
      informacionAdicional: document.getElementById('editarInfoAdicional').value
    };

    if (document.getElementById('camposAcompanante').style.display !== 'none') {
      datosActualizados.experiencia = document.getElementById('editarExperiencia').value;
      datosActualizados.nivelEducacion = document.getElementById('editarNivelEducacion').value;
    }

    const resultado = guardarPerfil(datosActualizados);

    if (resultado.exito) {
      alert('¡Perfil actualizado exitosamente!');
      // Recargar para mostrar cambios
      cargarPerfil();
      cargarAvatar();
    } else {
      alert('Error: ' + resultado.mensaje);
    }
  });
});

function eliminarCuenta() {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) {
    alert('No hay sesión activa');
    return;
  }

  const confirmacion = prompt('Esta acción no se puede deshacer. Para confirmar, escribe "ELIMINAR" en mayúsculas:');
  
  if (confirmacion !== 'ELIMINAR') {
    if (confirmacion !== null) {
      alert('Confirmación incorrecta. La cuenta no ha sido eliminada.');
    }
    return;
  }

  if (!confirm('¿Estás completamente seguro? Esto eliminará tu cuenta, todas tus citas, conversaciones y datos de forma permanente.')) {
    return;
  }

  const emailUsuario = usuarioActual.email.toLowerCase();
  
  const usuarios = obtenerUsuarios();
  const usuariosActualizados = usuarios.filter(u => u.email.toLowerCase() !== emailUsuario);
  
  if (typeof guardarEnBaseDatos === 'function') {
    guardarEnBaseDatos('usuarios', usuariosActualizados);
  } else {
    localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
  }

  const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  const citasActualizadas = citas.filter(c => {
    const emailAcompanante = (c.acompanante?.email || c.acompananteId || '').toLowerCase();
    const emailAdultoMayor = (c.adultoMayor?.email || '').toLowerCase();
    return emailAcompanante !== emailUsuario && emailAdultoMayor !== emailUsuario;
  });
  
  if (typeof guardarEnBaseDatos === 'function') {
    guardarEnBaseDatos('citas', citasActualizadas);
  } else {
    localStorage.setItem('citas', JSON.stringify(citasActualizadas));
  }

  const conversaciones = JSON.parse(localStorage.getItem('conversaciones') || '[]');
  const conversacionesActualizadas = conversaciones.filter(conv => {
    const emailParticipante1 = (conv.participante1 || '').toLowerCase();
    const emailParticipante2 = (conv.participante2 || '').toLowerCase();
    return emailParticipante1 !== emailUsuario && emailParticipante2 !== emailUsuario;
  });
  
  if (typeof guardarEnBaseDatos === 'function') {
    guardarEnBaseDatos('conversaciones', conversacionesActualizadas);
  } else {
    localStorage.setItem('conversaciones', JSON.stringify(conversacionesActualizadas));
  }

  const mensajes = JSON.parse(localStorage.getItem('mensajes') || '[]');
  const mensajesActualizados = mensajes.filter(m => {
    const emailRemitente = (m.remitente || '').toLowerCase();
    return emailRemitente !== emailUsuario;
  });
  
  if (typeof guardarEnBaseDatos === 'function') {
    guardarEnBaseDatos('mensajes', mensajesActualizados);
  } else {
    localStorage.setItem('mensajes', JSON.stringify(mensajesActualizados));
  }

  const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  const notificacionesActualizadas = notificaciones.filter(n => {
    const emailPara = (n.paraEmail || '').toLowerCase();
    return emailPara !== emailUsuario;
  });
  
  if (typeof guardarEnBaseDatos === 'function') {
    guardarEnBaseDatos('notificaciones', notificacionesActualizadas);
  } else {
    localStorage.setItem('notificaciones', JSON.stringify(notificacionesActualizadas));
  }

  cerrarSesion();
  
  alert('Tu cuenta ha sido eliminada permanentemente. Gracias por haber usado AbueClick.');
  window.location.href = 'index.html';
}

