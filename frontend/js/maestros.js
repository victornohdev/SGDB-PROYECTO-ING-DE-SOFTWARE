// =============================================
//  MAESTROS.JS — CRUD completo de maestros
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

const API = 'http://localhost:3000/api';
let maestros   = [];
let editandoId = null;

// --- Cargar al iniciar ---
document.addEventListener('DOMContentLoaded', async () => {
  await cargarGruposSelect();
  await cargarMaestros();
});

// --- Cargar maestros desde el backend ---
async function cargarMaestros() {
  const tbody = document.getElementById('tabla-maestros');

  try {
    const res = await fetch(`${API}/maestros`);
    maestros  = await res.json();

    document.getElementById('subtitulo').textContent =
      `${maestros.length} maestro${maestros.length !== 1 ? 's' : ''} registrado${maestros.length !== 1 ? 's' : ''}`;

    renderTabla(maestros);

  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="vacio-texto">Error al cargar maestros</div>
        </div>
      </td></tr>`;
  }
}

// --- Renderizar tabla ---
function renderTabla(lista) {
  const tbody = document.getElementById('tabla-maestros');

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-building-columns"></i></div>
          <div class="vacio-texto">Sin maestros registrados</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(m => `
    <tr>
      <td>
        <div class="d-flex align-center gap-sm">
          <div class="avatar avatar-morado">${m.nombre[0]}</div>
          <b>${m.nombre}</b>
        </div>
      </td>
      <td class="mono">${m.usuario}</td>
      <td>
       ${m.grupos.map(g =>
  `<span class="badge badge-azul" style="margin:2px">${g.nombre}</span>`
).join('')}
      </td>
<td>
  <div class="acciones">
    <button class="btn btn-outline btn-sm" onclick="editarMaestro(${m.id})">
      <i class="fa-solid fa-pen"></i>
    </button>

    <button class="btn btn-danger btn-sm" onclick="eliminarMaestro(${m.id})">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>
</td>
    </tr>
  `).join('');
}

// --- Filtrar tabla ---
function filtrarTabla(input) {
  const val    = input.value.toLowerCase();
  const filtro = maestros.filter(m =>
    m.nombre.toLowerCase().includes(val) ||
    m.usuario.toLowerCase().includes(val)
  );
  renderTabla(filtro);
}

// --- Cargar grupos en el select del modal ---
async function cargarGruposSelect() {
  try {
    const res    = await fetch(`${API}/grupos`);
    const grupos = await res.json();
    const sel    = document.getElementById('mae-grupos');

    sel.innerHTML = grupos.map(g =>
      `<option value="${g.id}">${g.grado}° ${g.nombre}</option>`
    ).join('');

  } catch (err) {
    console.error('Error al cargar grupos:', err);
  }
}

// --- Abrir modal para nuevo maestro ---
function abrirModal() {
  editandoId = null;
  document.getElementById('modal-titulo').textContent = 'Registrar Maestro';
  limpiarModal();
  // Mostrar campo contraseña en nuevo registro
  document.getElementById('mae-contrasena').closest('.form-grupo').style.display = 'block';
  document.getElementById('modal-maestro').classList.add('abierto');
}

// --- Abrir modal para editar ---
function editarMaestro(id) {
  const maestro = maestros.find(m => m.id === id);
  if (!maestro) return;

  editandoId = id;
  document.getElementById('modal-titulo').textContent = 'Editar Maestro';
  document.getElementById('mae-nombre').value         = maestro.nombre;
  document.getElementById('mae-usuario').value        = maestro.usuario;

  // En edición ocultar contraseña (opcional cambiarla)
  document.getElementById('mae-contrasena').value = '';
  document.getElementById('mae-contrasena').placeholder = 'Dejar vacío para no cambiar';

  // Marcar grupos asignados
  const sel = document.getElementById('mae-grupos');
  console.log(maestro);
  Array.from(sel.options).forEach(opt => {
    opt.selected = maestro.grupos.some(
  g => g.id === Number(opt.value)
);
  });

  ocultarErrorModal();
  document.getElementById('modal-maestro').classList.add('abierto');
}

// --- Cerrar modal ---
function cerrarModal() {
  document.getElementById('modal-maestro').classList.remove('abierto');
  limpiarModal();
}

// --- Limpiar campos ---
function limpiarModal() {
  document.getElementById('mae-nombre').value     = '';
  document.getElementById('mae-usuario').value    = '';
  document.getElementById('mae-contrasena').value = '';
  document.getElementById('mae-contrasena').placeholder = '••••••••';

  // Deseleccionar todos los grupos
  const sel = document.getElementById('mae-grupos');
  Array.from(sel.options).forEach(opt => opt.selected = false);

  ocultarErrorModal();
}

// --- Guardar maestro ---
async function guardarMaestro() {
  const nombre     = document.getElementById('mae-nombre').value.trim();
  const usuario    = document.getElementById('mae-usuario').value.trim();
  const contrasena = document.getElementById('mae-contrasena').value.trim();
  const grupos     = Array.from(document.getElementById('mae-grupos').selectedOptions)
                         .map(o => o.value);
console.log('Grupos seleccionados:', grupos);
  // Validar campos
  if (!nombre || !usuario) {
    mostrarErrorModal('Por favor completa nombre y usuario.');
    return;
  }

  if (!editandoId && !contrasena) {
    mostrarErrorModal('La contraseña es obligatoria para nuevos maestros.');
    return;
  }

  if (grupos.length === 0) {
    mostrarErrorModal('Selecciona al menos un grupo.');
    return;
  }

  const body = { nombre, usuario, grupos };
  if (contrasena) body.contrasena = contrasena;

  try {
    let res;

    if (editandoId) {
      res = await fetch(`${API}/maestros/${editandoId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
    } else {
      res = await fetch(`${API}/maestros`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
    }

    const data = await res.json();

    if (!res.ok) {
      mostrarErrorModal(data.mensaje || 'Error al guardar el maestro.');
      return;
    }

    cerrarModal();
    await cargarMaestros();

  } catch (err) {
    mostrarErrorModal('No se pudo conectar con el servidor.');
  }
}

// --- Eliminar maestro ---
async function eliminarMaestro(id) {
  if (!confirm('¿Estás seguro de eliminar este maestro?')) return;

  try {
    const res = await fetch(`${API}/maestros/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      alert('Error al eliminar el maestro.');
      return;
    }

    await cargarMaestros();

  } catch (err) {
    alert('No se pudo conectar con el servidor.');
  }
}

// --- Mostrar error en modal ---
function mostrarErrorModal(msg) {
  const el = document.getElementById('error-modal');
  el.textContent   =msg;
  el.style.display = 'block';
}

// --- Ocultar error en modal ---
function ocultarErrorModal() {
  document.getElementById('error-modal').style.display = 'none';
}

// --- Cerrar modal al hacer click fuera ---
document.getElementById('modal-maestro').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-maestro')) cerrarModal();
});