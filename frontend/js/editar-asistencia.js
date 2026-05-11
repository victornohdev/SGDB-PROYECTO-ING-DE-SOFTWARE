// =============================================
//  EDITAR-ASISTENCIA.JS
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

const API = 'http://localhost:3000/api';
let asistencias = [];

// --- Inicializar ---
document.addEventListener('DOMContentLoaded', async () => {
  await cargarGruposSelect();
});

// --- Cargar grupos del maestro en el select ---
async function cargarGruposSelect() {
  try {
    const usuario = obtenerUsuario();
    const res     = await fetch(`${API}/maestros/${usuario.id}/grupos`);
    const grupos  = await res.json();
    const sel     = document.getElementById('sel-grupo');

    if (!grupos || grupos.length === 0) {
      sel.innerHTML = '<option value="">Sin grupos asignados</option>';
      return;
    }

    sel.innerHTML = '<option value="">-- Elige un grupo --</option>' +
      grupos.map(g =>
        `<option value="${g.id}">${g.grado} ${g.nombre}</option>`
      ).join('');

  } catch (err) {
    console.error('Error al cargar grupos:', err);
  }
}

// --- Cargar asistencias del grupo seleccionado ---
async function cargarAsistencias() {
  const grupoId   = document.getElementById('sel-grupo').value;
  const contenido = document.getElementById('contenido-edicion');

  if (!grupoId) {
    contenido.innerHTML = '';
    return;
  }

  contenido.innerHTML = `
    <div class="vacio">
      <div class="vacio-icono"><i class="fa-solid fa-spinner"></i></div>
      <div class="vacio-texto">Cargando asistencias...</div>
    </div>`;

  try {
    const hoy = today();
    const res = await fetch(`${API}/asistencias/editar?grupoId=${grupoId}&fecha=${hoy}`);
    asistencias = await res.json();

    if (!asistencias || asistencias.length === 0) {
      contenido.innerHTML = `
        <div class="card">
          <div class="card-body">
            <div class="vacio">
              <div class="vacio-icono">✅</div>
              <div class="vacio-texto">No hay asistencias pendientes de editar para hoy</div>
            </div>
          </div>
        </div>`;
      return;
    }

    contenido.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-titulo">Asistencias de hoy — ${hoy}</div>
          <span class="badge badge-amarillo">⚠️ Sin confirmar</span>
        </div>
        <div class="card-body">
          ${asistencias.map(a => `
            <div class="asist-fila">
              <div>
                <div class="asist-nombre">${a.alumno}</div>
                <div class="asist-control">${a.control}</div>
              </div>
              <div class="asist-botones">
                <button
                  class="asist-btn asistio ${a.estado === 'asistio' ? '' : 'inactivo'}"
                  onclick="cambiarEstado(${a.id}, 'asistio', this)">
                  ✓ Asistió
                </button>
                <button
                  class="asist-btn falto ${a.estado === 'falto' ? '' : 'inactivo'}"
                  onclick="cambiarEstado(${a.id}, 'falto', this)">
                  ✗ Faltó
                </button>
                <button
                  class="asist-btn retardo ${a.estado === 'retardo' ? '' : 'inactivo'}"
                  onclick="cambiarEstado(${a.id}, 'retardo', this)">
                  ⏱ Retardo
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;

  } catch (err) {
    contenido.innerHTML = `
      <div class="vacio">
        <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="vacio-texto">Error al cargar asistencias</div>
      </div>`;
  }
}

// --- Cambiar estado de una asistencia ---
async function cambiarEstado(asistenciaId, estado, btn) {
  // Actualizar visualmente primero
  const fila = btn.closest('.asist-fila');
  fila.querySelectorAll('.asist-btn').forEach(b => b.classList.add('inactivo'));
  btn.classList.remove('inactivo');

  try {
    const res = await fetch(`${API}/asistencias/${asistenciaId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ estado })
    });

    if (!res.ok) {
      alert('Error al actualizar la asistencia.');
      // Revertir visual si falla
      await cargarAsistencias();
    }

  } catch (err) {
    alert('No se pudo conectar con el servidor.');
    await cargarAsistencias();
  }
}

// --- Fecha de hoy ---
function today() {
  return new Date().toISOString().split('T')[0];
}