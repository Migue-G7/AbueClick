// Función para mostrar/ocultar campos condicionales
function toggleCamposAcompanante() {
  const acompanante = document.getElementById('compania');
  const camposAcompanante = document.getElementById('camposAcompanante');
  const experiencia = document.getElementById('experiencia');
  const nivelEducacion = document.getElementById('nivelEducacion');

  if (acompanante.checked) {
    camposAcompanante.style.display = 'block';
    experiencia.required = true;
    nivelEducacion.required = true;
  } else {
    camposAcompanante.style.display = 'none';
    experiencia.required = false;
    nivelEducacion.required = false;
    experiencia.value = '';
    nivelEducacion.value = '';
  }
}

// Event listeners para los radio buttons
document.addEventListener('DOMContentLoaded', function() {
  const acompanante = document.getElementById('compania');
  const adultoMayor = document.getElementById('asistencia');

  if (acompanante) {
    acompanante.addEventListener('change', toggleCamposAcompanante);
  }
  
  if (adultoMayor) {
    adultoMayor.addEventListener('change', toggleCamposAcompanante);
  }

  // Ejecutar al cargar la página
  toggleCamposAcompanante();
});

