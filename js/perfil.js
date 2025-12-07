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
    document.getElementById('editNombre').value = usuario.nombre || '';
    document.getElementById('editApellido').value = usuario.apellido || '';
    document.getElementById('editEmail').value = usuario.email || '';
    document.getElementById('editTelefono').value = usuario.telefono || '';
    document.getElementById('editFecha').value = usuario.fechaNacimiento || '';
    document.getElementById('editCiudad').value = usuario.ciudad || '';
    document.getElementById('editDisponibilidad').value = usuario.disponibilidad || '';
    document.getElementById('editInfoAdicional').value = usuario.informacionAdicional || '';

    // Mostrar nombre en el header
    document.getElementById('profileName').textContent = `${usuario.nombre} ${usuario.apellido}`;
    document.getElementById('profileEmail').textContent = usuario.email;

    // Mostrar tipo de usuario
    const tipoUsuario = usuario.tipoUsuario === 'acompanante' ? 'Acompañante' : 'Adulto Mayor';
    document.getElementById('profileType').textContent = tipoUsuario;

    // Mostrar iniciales en el avatar
    const iniciales = (usuario.nombre?.charAt(0) || '') + (usuario.apellido?.charAt(0) || '');
    document.getElementById('avatarInitials').textContent = iniciales.toUpperCase() || 'AC';
    document.getElementById('userAvatarNav').textContent = iniciales.toUpperCase() || 'AC';

    // Si es acompañante, mostrar campos adicionales
    if (usuario.tipoUsuario === 'acompanante') {
      document.getElementById('acompananteFields').style.display = 'block';
      document.getElementById('editExperiencia').value = usuario.experiencia || '';
      document.getElementById('editNivelEducacion').value = usuario.nivelEducacion || '';
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
    // Actualizar datos del usuario
    usuarios[indiceUsuario] = { ...usuarios[indiceUsuario], ...datosActualizados };
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

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
  const input = document.getElementById('avatarInput');
  const avatarLarge = document.getElementById('avatarLarge');
  const avatarInitials = document.getElementById('avatarInitials');

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

        // Reemplazar iniciales con imagen
        avatarInitials.style.display = 'none';
        avatarLarge.innerHTML = '';
        avatarLarge.appendChild(img);

        // Guardar imagen en localStorage (como base64)
        const usuarioActual = verificarSesion();
        if (usuarioActual) {
          const usuarios = obtenerUsuarios();
          const indiceUsuario = usuarios.findIndex(u => u.email === usuarioActual.email);
          if (indiceUsuario !== -1) {
            usuarios[indiceUsuario].avatar = e.target.result;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            // Actualizar avatar en la barra de navegación usando la función global
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
    const avatarLarge = document.getElementById('avatarLarge');
    const avatarInitials = document.getElementById('avatarInitials');
    
    if (avatarLarge && avatarInitials) {
      const img = document.createElement('img');
      img.src = usuario.avatar;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';

      avatarInitials.style.display = 'none';
      avatarLarge.innerHTML = '';
      avatarLarge.appendChild(img);
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
  document.getElementById('editAvatarBtn').addEventListener('click', function() {
    document.getElementById('avatarInput').click();
  });

  // Botón para cerrar sesión
  document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      cerrarSesion();
      alert('Sesión cerrada exitosamente');
      window.location.href = 'login.html';
    }
  });

  // Manejar envío del formulario
  document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const datosActualizados = {
      nombre: document.getElementById('editNombre').value,
      apellido: document.getElementById('editApellido').value,
      email: document.getElementById('editEmail').value,
      telefono: document.getElementById('editTelefono').value,
      fechaNacimiento: document.getElementById('editFecha').value,
      ciudad: document.getElementById('editCiudad').value,
      disponibilidad: document.getElementById('editDisponibilidad').value,
      informacionAdicional: document.getElementById('editInfoAdicional').value
    };

    // Si es acompañante, agregar campos adicionales
    if (document.getElementById('acompananteFields').style.display !== 'none') {
      datosActualizados.experiencia = document.getElementById('editExperiencia').value;
      datosActualizados.nivelEducacion = document.getElementById('editNivelEducacion').value;
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

