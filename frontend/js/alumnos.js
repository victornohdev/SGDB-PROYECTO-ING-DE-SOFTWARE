// =============================================
//  ALUMNOS.JS — CRUD completo de alumnos
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

const API = 'http://localhost:3000/api';
let alumnos = [];
let editandoId = null;

// --- Cargar al iniciar ---
document.addEventListener('DOMContentLoaded', async () => {
  await cargarGruposSelect();
  await cargarAlumnos();
});

// --- Cargar alumnos desde el backend ---
async function cargarAlumnos() {
  const tbody = document.getElementById('tabla-alumnos');

  try {
    const res = await fetch(`${API}/alumnos`);
    alumnos   = await res.json();

    document.getElementById('subtitulo').textContent =
      `${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''} registrado${alumnos.length !== 1 ? 's' : ''}`;

    renderTabla(alumnos);

  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="vacio-texto">Error al cargar alumnos</div>
        </div>
      </td></tr>`;
  }
}

// --- Renderizar tabla ---
function renderTabla(lista) {
  const tbody = document.getElementById('tabla-alumnos');

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-building-columns"></i></div>
          <div class="vacio-texto">Sin alumnos registrados</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(a => `
    <tr>
      <td>
        <div class="d-flex align-center gap-sm">
          <div class="avatar">${a.nombre[0]}</div>
          <b>${a.nombre}</b>
        </div>
      </td>
      <td class="mono">${a.control}</td>
      <td><span class="badge badge-azul">${a.grado} ${a.grupo}</span></td>
      <td>${formatearFecha(a.cumpleanos)}</td>
      <td>
        <div class="acciones">
          <button class="btn btn-outline btn-sm" onclick="editarAlumno(${a.id})">✏️</button>
          <button class="btn btn-danger btn-sm"  onclick="eliminarAlumno(${a.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// --- Filtrar tabla por búsqueda ---
function filtrarTabla(input) {
  const val    = input.value.toLowerCase();
  const filtro = alumnos.filter(a =>
    a.nombre.toLowerCase().includes(val) ||
    a.control.toLowerCase().includes(val) ||
    `${a.grado} ${a.grupo}`.toLowerCase().includes(val)
  );
  renderTabla(filtro);
}

// --- Cargar grupos en el select del modal ---
async function cargarGruposSelect() {
  try {
    const res    = await fetch(`${API}/grupos`);
    const grupos = await res.json();
    const sel    = document.getElementById('al-grupo');

    sel.innerHTML = '<option value="">Selecciona</option>' +
      grupos.map(g => `<option value="${g.nombre}">${g.grado} ${g.nombre}</option>`).join('');

  } catch (err) {
    console.error('Error al cargar grupos:', err);
  }
}

// --- Abrir modal para nuevo alumno ---
function abrirModal() {
  editandoId = null;
  document.getElementById('modal-titulo').textContent = 'Registrar Alumno';
  limpiarModal();
  document.getElementById('modal-alumno').classList.add('abierto');
}

// --- Abrir modal para editar ---
function editarAlumno(id) {
  const alumno = alumnos.find(a => a.id === id);
  if (!alumno) return;

  editandoId = id;
  document.getElementById('modal-titulo').textContent  = 'Editar Alumno';
  document.getElementById('al-nombre').value           = alumno.nombre;
  document.getElementById('al-control').value          = alumno.control;
  document.getElementById('al-cumple').value           = alumno.cumpleanos;
  document.getElementById('al-grado').value            = alumno.grado;
  document.getElementById('al-grupo').value            = alumno.grupo;
  ocultarErrorModal();
  document.getElementById('modal-alumno').classList.add('abierto');
}

// --- Cerrar modal ---
function cerrarModal() {
  document.getElementById('modal-alumno').classList.remove('abierto');
  limpiarModal();
}

// --- Limpiar campos del modal ---
function limpiarModal() {
  document.getElementById('al-nombre').value  = '';
  document.getElementById('al-control').value = '';
  document.getElementById('al-cumple').value  = '';
  document.getElementById('al-grado').value   = '';
  document.getElementById('al-grupo').value   = '';
  ocultarErrorModal();
}

// --- Guardar alumno (crear o editar) ---
async function guardarAlumno() {
  const nombre     = document.getElementById('al-nombre').value.trim();
  const control    = document.getElementById('al-control').value.trim();
  const cumpleanos = document.getElementById('al-cumple').value;
  const grado      = document.getElementById('al-grado').value;
  const grupo      = document.getElementById('al-grupo').value;

  // Validar campos
  if (!nombre || !control || !grado || !grupo) {
    mostrarErrorModal('Por favor completa todos los campos obligatorios.');
    return;
  }

  const body = { nombre, control, cumpleanos, grado, grupo };

  try {
    let res;

    if (editandoId) {
      // Editar
      res = await fetch(`${API}/alumnos/${editandoId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
    } else {
      // Crear
      res = await fetch(`${API}/alumnos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
    }

    const data = await res.json();

    if (!res.ok) {
      mostrarErrorModal(data.mensaje || 'Error al guardar el alumno.');
      return;
    }

    cerrarModal();
    await cargarAlumnos();

  } catch (err) {
    mostrarErrorModal('No se pudo conectar con el servidor.');
  }
}

// --- Eliminar alumno ---
async function eliminarAlumno(id) {
  if (!confirm('¿Estás seguro de eliminar este alumno?')) return;

  try {
    const res = await fetch(`${API}/alumnos/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      alert('Error al eliminar el alumno.');
      return;
    }

    await cargarAlumnos();

  } catch (err) {
    alert('No se pudo conectar con el servidor.');
  }
}

// --- Mostrar error en modal ---
function mostrarErrorModal(msg) {
  const el = document.getElementById('error-modal');
  el.textContent = msg;
  el.style.display = 'block';
}

// --- Ocultar error en modal ---
function ocultarErrorModal() {
  document.getElementById('error-modal').style.display = 'none';
}

// --- Formatear fecha ---
function formatearFecha(fecha) {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

// --- Cerrar modal al hacer click fuera ---
document.getElementById('modal-alumno').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-alumno')) cerrarModal();
});