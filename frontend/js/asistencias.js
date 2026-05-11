// =============================================
//  ASISTENCIAS.JS — Pase de lista y edición
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

const API = 'http://localhost:3000/api';

// Estado temporal de asistencias (antes de subir)
let sesionTemp = {};
let grupos     = [];
let grupoActivo = 0;

// --- Inicializar al cargar ---
document.addEventListener('DOMContentLoaded', async () => {
  // Mostrar fecha de hoy
  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const el = document.getElementById('fecha-hoy');
  if (el) el.textContent = hoy;

  await cargarGruposMaestro();
});

// --- Cargar grupos del maestro ---
async function cargarGruposMaestro() {
  try {
    const usuario = obtenerUsuario();
    const res     = await fetch(`${API}/maestros/${usuario.id}/grupos`);
    grupos        = await res.json();

    if (!grupos || grupos.length === 0) {
      document.getElementById('contenido-grupos').innerHTML = `
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-building-columns"></i></div>
          <div class="vacio-texto">No tienes grupos asignados</div>
        </div>`;
      return;
    }

    renderTabs();
    renderGrupo(0);

  } catch (err) {
    document.getElementById('contenido-grupos').innerHTML = `
      <div class="vacio">
        <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="vacio-texto">Error al cargar grupos</div>
      </div>`;
  }
}

// --- Renderizar tabs ---
function renderTabs() {
  const tabs = document.getElementById('tabs-grupos');
  tabs.innerHTML = grupos.map((g, i) => `
    <div class="tab ${i === 0 ? 'activo' : ''}"
         onclick="cambiarTab(${i})">
      ${g.grado} ${g.nombre}
    </div>
  `).join('');
}

// --- Cambiar tab activo ---
function cambiarTab(idx) {
  grupoActivo = idx;

  // Actualizar tabs
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('activo', i === idx);
  });

  renderGrupo(idx);
}

// --- Renderizar contenido de un grupo ---
async function renderGrupo(idx) {
  const grupo     = grupos[idx];
  console.log('Grupo:', grupo);
  const contenido = document.getElementById('contenido-grupos');
  const hoy       = today();

  contenido.innerHTML = `
    <div class="vacio">
      <div class="vacio-icono"><i class="fa-solid fa-spinner"></i></div>
      <div class="vacio-texto">Cargando alumnos...</div>
    </div>`;

  try {
    // Verificar si ya se pasó lista hoy
    const resLista = await fetch(`${API}/asistencias/verificar?grupoId=${grupo.id}&fecha=${hoy}`);
    const dataLista = await resLista.json();
    console.log('Lista verificada:', dataLista);
    const yaPaso   = dataLista.pasada;

    // Cargar alumnos del grupo
    const resAlumnos = await fetch(`${API}/grupos/${grupo.id}/alumnos`);
    const alumnos    = await resAlumnos.json();
console.log('Alumnos:', alumnos);
    // Inicializar sesionTemp para este grupo si no existe
    if (!sesionTemp[grupo.id]) {
      sesionTemp[grupo.id] = {};
    }

    contenido.innerHTML = `
      ${yaPaso ? `
        <div class="alerta alerta-verde" style="margin-bottom:16px">
          <i class="fa-solid fa-check"></i> <span>Lista ya registrada para hoy — ${hoy}</span>
        </div>` : ''}

      <div class="card">
        <div class="card-header">
          <div class="card-titulo">
            ${grupo.grado} ${grupo.nombre} — ${alumnos.length} alumnos
          </div>
          ${!yaPaso ? `
            <button class="btn btn-success btn-sm" onclick="subirLista(${grupo.id})">
              📤 Subir Lista
            </button>` : ''}
        </div>
        <div class="card-body">
          ${alumnos.length === 0
            ? `<div class="vacio">
                <div class="vacio-icono">👥</div>
                <div class="vacio-texto">Sin alumnos en este grupo</div>
               </div>`
            : alumnos.map(al => {
                const estado = sesionTemp[grupo.id][al.id] || '';
                return `
                  <div class="asist-fila">
                    <div>
                      <div class="asist-nombre">${al.nombre}</div>
                      <div class="asist-control">${al.control}</div>
                    </div>
                    <div class="asist-botones">
                      <button
                        class="asist-btn asistio ${estado === 'asistio' ? '' : 'inactivo'}"
                        onclick="marcarTemp(${grupo.id}, ${al.id}, 'asistio', this)">
                        ✓ Asistió
                      </button>
                      <button
                        class="asist-btn falto ${estado === 'falto' ? '' : 'inactivo'}"
                        onclick="marcarTemp(${grupo.id}, ${al.id}, 'falto', this)">
                        ✗ Faltó
                      </button>
                      <button
                        class="asist-btn retardo ${estado === 'retardo' ? '' : 'inactivo'}"
                        onclick="marcarTemp(${grupo.id}, ${al.id}, 'retardo', this)">
                        ⏱ Retardo
                      </button>
                    </div>
                  </div>`;
              }).join('')
          }
        </div>
      </div>`;

  } catch (err) {
    contenido.innerHTML = `
      <div class="vacio">
        <div class="vacio-icono">⚠️</div>
        <div class="vacio-texto">Error al cargar el grupo</div>
      </div>`;
  }
}

// --- Marcar asistencia temporal ---
function marcarTemp(grupoId, alumnoId, estado, btn) {
  // Guardar en sesionTemp
  if (!sesionTemp[grupoId]) sesionTemp[grupoId] = {};
  sesionTemp[grupoId][alumnoId] = estado;

  // Actualizar botones visualmente
  const fila = btn.closest('.asist-fila');
  fila.querySelectorAll('.asist-btn').forEach(b => b.classList.add('inactivo'));
  btn.classList.remove('inactivo');
}

// --- Subir lista al backend ---
async function subirLista(grupoId) {
  const hoy        = today();
  const pendientes = sesionTemp[grupoId];

  if (!pendientes || Object.keys(pendientes).length === 0) {
    alert('Marca la asistencia de al menos un alumno antes de subir.');
    return;
  }

  const asistencias = Object.entries(pendientes).map(([alumnoId, estado]) => ({
    alumnoId: parseInt(alumnoId),
    estado,
    fecha: hoy,
    grupoId
  }));

  try {
    const usuario = obtenerUsuario();
    const res = await fetch(`${API}/asistencias`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ asistencias, maestroId: usuario.id })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.mensaje || 'Error al subir la lista.');
      return;
    }

    // Limpiar temp de este grupo
    sesionTemp[grupoId] = {};

    // Recargar el grupo actual
    renderGrupo(grupoActivo);

  } catch (err) {
    alert('No se pudo conectar con el servidor.');
  }
}

// --- Obtener fecha de hoy en formato YYYY-MM-DD ---
function today() {
  return new Date().toISOString().split('T')[0];
}