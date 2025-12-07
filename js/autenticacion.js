// ============================================
// SISTEMA DE AUTENTICACIÓN BÁSICO
// NOTA: Esto es solo para prototipos/demostración
// Para producción, necesitas un backend con base de datos
// ============================================

// Función para guardar un usuario registrado
function guardarUsuario(datosUsuario) {
  // Obtener usuarios existentes o crear array vacío
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
  // Verificar si el email ya existe
  const emailExiste = usuarios.some(user => user.email === datosUsuario.email);
  
  if (emailExiste) {
    return { exito: false, mensaje: 'Este correo electrónico ya está registrado' };
  }
  
  // Agregar nuevo usuario
  usuarios.push(datosUsuario);
  
  // Guardar en localStorage
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  
  return { exito: true, mensaje: 'Usuario registrado exitosamente' };
}

// Función para verificar credenciales de login
function verificarLogin(email, password) {
  // Obtener usuarios registrados
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
  // Buscar usuario por email
  const usuario = usuarios.find(user => user.email === email);
  
  if (!usuario) {
    return { exito: false, mensaje: 'Usuario no encontrado. Por favor regístrate primero.' };
  }
  
  // Verificar contraseña (en producción, esto debería estar encriptado)
  if (usuario.password !== password) {
    return { exito: false, mensaje: 'Contraseña incorrecta' };
  }
  
  // Guardar sesión actual
  localStorage.setItem('usuarioActual', JSON.stringify({
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido
  }));
  
  return { exito: true, mensaje: 'Inicio de sesión exitoso', usuario: usuario };
}

// Función para verificar si hay una sesión activa
function verificarSesion() {
  const usuarioActual = localStorage.getItem('usuarioActual');
  return usuarioActual ? JSON.parse(usuarioActual) : null;
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('usuarioActual');
}

// Función para obtener todos los usuarios (solo para desarrollo)
function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem('usuarios') || '[]');
}

// Función para actualizar avatar en todas las páginas
function actualizarAvatarGlobal() {
  const usuarioActual = verificarSesion();
  if (!usuarioActual) return;

  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.email === usuarioActual.email);
  
  if (usuario) {
    // Buscar todos los avatares en la página
    const avatares = document.querySelectorAll('#userAvatar, #userAvatarNav, .avatar-circle');
    
    avatares.forEach(avatar => {
      if (usuario.avatar) {
        // Si hay imagen, mostrar imagen
        const img = document.createElement('img');
        img.src = usuario.avatar;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        avatar.innerHTML = '';
        avatar.appendChild(img);
      } else {
        // Si no hay imagen, mostrar iniciales
        const iniciales = (usuario.nombre?.charAt(0) || '') + (usuario.apellido?.charAt(0) || '');
        avatar.textContent = iniciales.toUpperCase() || 'AC';
      }
    });
  }
}

