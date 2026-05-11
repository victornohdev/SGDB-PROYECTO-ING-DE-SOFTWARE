// =============================================
//  GRUPOS.JS — CRUD completo de grupos
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

const API = 'http://localhost:3000/api';
let grupos     = [];
let editandoId = null;

// --- Cargar al iniciar ---
document.addEventListener('DOMContentLoaded', async () => {
  await cargarGrupos();
});

// --- Cargar grupos desde el backend ---
async function cargarGrupos() {
  const tbody = document.getElementById('tabla-grupos');

  try {
    const res = await fetch(`${API}/grupos`);
    grupos    = await res.json();

    document.getElementById('subtitulo').textContent =
      `${grupos.length} grupo${grupos.length !== 1 ? 's' : ''} activo${grupos.length !== 1 ? 's' : ''}`;

    renderTabla(grupos);

  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="vacio-texto">Error al cargar grupos</div>
        </div>
      </td></tr>`;
  }
}

// --- Renderizar tabla ---
function renderTabla(lista) {
  const tbody = document.getElementById('tabla-grupos');

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-building-columns"></i></div>
          <div class="vacio-texto">Sin grupos registrados</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(g => `
    <tr>
      <td><b>${g.grado} ${g.nombre}</b></td>
      <td>
        <span class="badge ${g.turno === 'Matutino' ? 'badge-azul' : 'badge-amarillo'}">
          ${g.turno}
        </span>
      </td>
      <td>${g.totalAlumnos ?? 0} alumnos</td>
      <td>${g.maestro ?? '<span class="text-muted">Sin asignar</span>'}</td>
      <td>
        <div class="acciones">
          <button class="btn btn-outline btn-sm" onclick="editarGrupo(${g.id})">✏️</button>
          <button class="btn btn-danger btn-sm"  onclick="eliminarGrupo(${g.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// --- Abrir modal para nuevo grupo ---
function abrirModal() {
  editandoId = null;
  document.getElementById('modal-titulo').textContent = 'Nuevo Grupo';
  limpiarModal();
  document.getElementById('modal-grupo').classList.add('abierto');
}

// --- Abrir modal para editar ---
function editarGrupo(id) {
  const grupo = grupos.find(g => g.id === id);
  if (!grupo) return;

  editandoId = id;
  document.getElementById('modal-titulo').textContent = 'Editar Grupo';
  document.getElementById('gr-grado').value           = grupo.grado;
  document.getElementById('gr-nombre').value          = grupo.nombre;
  document.getElementById('gr-turno').value           = grupo.turno;
  ocultarErrorModal();
  document.getElementById('modal-grupo').classList.add('abierto');
}

// --- Cerrar modal ---
function cerrarModal() {
  document.getElementById('modal-grupo').classList.remove('abierto');
  limpiarModal();
}

// --- Limpiar campos ---
function limpiarModal() {
  document.getElementById('gr-grado').value  = '';
  document.getElementById('gr-nombre').value = '';
  document.getElementById('gr-turno').value  = 'Matutino';
  ocultarErrorModal();
}

// --- Guardar grupo ---
async function guardarGrupo() {
  const grado  = document.getElementById('gr-grado').value;
  const nombre = document.getElementById('gr-nombre').value.trim().toUpperCase();
  const turno  = document.getElementById('gr-turno').value;

  // Validar campos
  if (!grado || !nombre) {
    mostrarErrorModal('Por favor completa todos los campos.');
    return;
  }

  const body = { grado, nombre, turno };

  try {
    let res;

    if (editandoId) {
      res = await fetch(`${API}/grupos/${editandoId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
    } else {
      res = await fetch(`${API}/grupos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
    }

    const data = await res.json();

    if (!res.ok) {
      mostrarErrorModal(data.mensaje || 'Error al guardar el grupo.');
      return;
    }

    cerrarModal();
    await cargarGrupos();

  } catch (err) {
    mostrarErrorModal('No se pudo conectar con el servidor.');
  }
}

// --- Eliminar grupo ---
async function eliminarGrupo(id) {
  if (!confirm('¿Estás seguro de eliminar este grupo?\nSi tiene alumnos asignados no podrá eliminarse.')) return;

  try {
    const res = await fetch(`${API}/grupos/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      alert(data.mensaje || 'Error al eliminar el grupo.');
      return;
    }

    await cargarGrupos();

  } catch (err) {
    alert('No se pudo conectar con el servidor.');
  }
}

// --- Mostrar error en modal ---
function mostrarErrorModal(msg) {
  const el = document.getElementById('error-modal');
  el.textContent   = msg;
  el.style.display = 'block';
}

// --- Ocultar error en modal ---
function ocultarErrorModal() {
  document.getElementById('error-modal').style.display = 'none';
}

// --- Cerrar modal al hacer click fuera ---
document.getElementById('modal-grupo').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-grupo')) cerrarModal();
});