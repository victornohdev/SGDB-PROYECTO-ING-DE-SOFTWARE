// =============================================
//  CONSULTAS.JS — Reportes y consultas
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

const API = 'http://localhost:3000/api';

// --- Inicializar según la página ---
document.addEventListener('DOMContentLoaded', async () => {
  const pagina = window.location.pathname.split('/').pop();

  if (pagina === 'consulta-general.html') {
    setFechasDefault();
  }

  if (pagina === 'consulta-grupo.html') {
    setFechasDefault();
    await cargarGruposSelect();
  }

  if (pagina === 'consulta-alumno.html') {
    await cargarAlumnosSelect();
  }
});

// --- Establecer fechas por defecto (mes actual) ---
function setFechasDefault() {
  const hoy    = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const fmtInicio = inicio.toISOString().split('T')[0];
  const fmtFin    = hoy.toISOString().split('T')[0];

  const elInicio = document.getElementById('fecha-inicio');
  const elFin    = document.getElementById('fecha-fin');

  if (elInicio) elInicio.value = fmtInicio;
  if (elFin)    elFin.value    = fmtFin;
}

// --- Cargar grupos en select ---
async function cargarGruposSelect() {
  try {
    const usuario = obtenerUsuario();
    const sel     = document.getElementById('sel-grupo');

    let url = `${API}/grupos`;

    // Si es maestro, solo cargar sus grupos
    if (usuario.rol === 'maestro') {
      url = `${API}/maestros/${usuario.id}/grupos`;
    }

    const res    = await fetch(url);
    const grupos = await res.json();

    sel.innerHTML = '<option value="">-- Elige un grupo --</option>' +
      grupos.map(g =>
        `<option value="${g.id}">${g.grado}° ${g.nombre}</option>`
      ).join('');

  } catch (err) {
    console.error('Error al cargar grupos:', err);
  }
}

// --- Cargar alumnos en select ---
async function cargarAlumnosSelect() {

  try {
    const usuario = obtenerUsuario();
    const sel     = document.getElementById('sel-alumno');

    let url = `${API}/alumnos`;

    // Si es maestro, solo cargar alumnos de sus grupos
    if (usuario.rol === 'maestro') {
      url = `${API}/maestros/${usuario.id}/alumnos`;
    }

    const res     = await fetch(url);
    const alumnos = await res.json();
  console.log(usuario);
    sel.innerHTML = '<option value="">-- Elige un alumno --</option>' +
      alumnos.map(a =>
        `<option value="${a.id}">${a.nombre} (${a.control})</option>`
      ).join('');

  } catch (err) {
    console.error('Error al cargar alumnos:', err);
  }
}

// =============================================
//  CONSULTA GENERAL
// =============================================
async function cargarConsulta() {
  const inicio   = document.getElementById('fecha-inicio').value;
  const fin      = document.getElementById('fecha-fin').value;
  const turno    = document.getElementById('filtro-turno').value;
  const contenido = document.getElementById('contenido-general');

  if (!inicio || !fin) {
    alert('Selecciona un rango de fechas.');
    return;
  }

  contenido.innerHTML = `
    <div class="vacio">
      <div class="vacio-icono"><i class="fa-solid fa-spinner"></i></div>
      <div class="vacio-texto">Cargando datos...</div>
    </div>`;

  try {
    const params = new URLSearchParams({ inicio, fin });
    if (turno) params.append('turno', turno);

    const res  = await fetch(`${API}/asistencias/general?${params}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      contenido.innerHTML = `
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-building-columns"></i></div>
          <div class="vacio-texto">Sin datos en el rango seleccionado</div>
        </div>`;
      return;
    }

    contenido.innerHTML = data.map(g => {
      const pct = g.porcentaje ?? 0;
      return `
        <div class="card" style="margin-bottom:16px">
          <div class="card-header">
            <div class="card-titulo">${g.grado} ${g.nombre} — ${g.turno}</div>
            <span class="badge ${pct >= 80 ? 'badge-verde' : pct >= 60 ? 'badge-amarillo' : 'badge-rojo'}">
              ${pct}% asistencia
            </span>
          </div>
          <div class="card-body">
            <div class="d-flex gap-md" style="margin-bottom:10px">
              <span class="badge badge-verde">✓ ${g.asistencias} asistencias</span>
              <span class="badge badge-rojo">✗ ${g.faltas} faltas</span>
              <span class="badge badge-amarillo">⏱ ${g.retardos} retardos</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="
                width:${pct}%;
                background:${pct >= 80 ? 'var(--color-verde)' : pct >= 60 ? 'var(--color-amarillo)' : 'var(--color-rojo)'}
              "></div>
            </div>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    contenido.innerHTML = `
      <div class="vacio">
        <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="vacio-texto">Error al cargar datos</div>
      </div>`;
  }
}

// =============================================
//  CONSULTA POR GRUPO
// =============================================
async function cargarConsultaGrupo() {
  const grupoId  = document.getElementById('sel-grupo').value;
  const inicio   = document.getElementById('fecha-inicio').value;
  const fin      = document.getElementById('fecha-fin').value;
  const contenido = document.getElementById('contenido-grupo');

  if (!grupoId) { alert('Selecciona un grupo.'); return; }
  if (!inicio || !fin) { alert('Selecciona un rango de fechas.'); return; }

  contenido.innerHTML = `
    <div class="vacio">
      <div class="vacio-icono"><i class="fa-solid fa-spinner"></i></div>
      <div class="vacio-texto">Cargando datos...</div>
    </div>`;

  try {
    const params = new URLSearchParams({ grupoId, inicio, fin });
    const res    = await fetch(`${API}/asistencias/grupo?${params}`);
    const data   = await res.json();

    if (!data || data.alumnos.length === 0) {
      contenido.innerHTML = `
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-building-columns"></i></div>
          <div class="vacio-texto">Sin registros en el rango seleccionado</div>
        </div>`;
      return;
    }

    contenido.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-titulo">${data.grupo} — ${inicio} al ${fin}</div>
        </div>
        <div class="card-body" style="padding:0">
          <div class="tabla-wrap">
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Asistencias</th>
                  <th>Faltas</th>
                  <th>Retardos</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                ${data.alumnos.map(a => {
                  const pct = a.porcentaje ?? 0;
                  return `
                    <tr>
                      <td>
                        <div class="d-flex align-center gap-sm">
                          <div class="avatar">${a.nombre[0]}</div>
                          <b>${a.nombre}</b>
                        </div>
                      </td>
                      <td><span class="badge badge-verde">${a.asistencias}</span></td>
                      <td><span class="badge badge-rojo">${a.faltas}</span></td>
                      <td><span class="badge badge-amarillo">${a.retardos}</span></td>
                      <td>
                        <b style="color:${pct >= 80 ? 'var(--color-verde)' : pct >= 60 ? 'var(--color-amarillo)' : 'var(--color-rojo)'}">
                          ${pct}%
                        </b>
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

  } catch (err) {
    contenido.innerHTML = `
      <div class="vacio">
        <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="vacio-texto">Error al cargar datos</div>
      </div>`;
  }
}

// =============================================
//  CONSULTA POR ALUMNO
// =============================================
async function cargarConsultaAlumno() {
  const alumnoId  = document.getElementById('sel-alumno').value;
  const inicio    = document.getElementById('fecha-inicio')?.value || '';
  const contenido = document.getElementById('contenido-alumno');

  if (!alumnoId) { alert('Selecciona un alumno.'); return; }

  contenido.innerHTML = `
    <div class="vacio">
      <div class="vacio-icono"><i class="fa-solid fa-spinner"></i></div>
      <div class="vacio-texto">Cargando datos...</div>
    </div>`;

  try {
    const params = new URLSearchParams({ alumnoId });
    if (inicio) params.append('inicio', inicio);

    const res  = await fetch(`${API}/asistencias/alumno?${params}`);
    const data = await res.json();

    const pct = data.porcentaje ?? 0;

    contenido.innerHTML = `
      <!-- Resumen -->
      <div class="stats-grid-3" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-label">Asistencias</div>
          <div class="stat-valor verde">${data.asistencias ?? 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Faltas</div>
          <div class="stat-valor rojo">${data.faltas ?? 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Retardos</div>
          <div class="stat-valor amarillo">${data.retardos ?? 0}</div>
        </div>
      </div>

      <!-- Porcentaje -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <div class="d-flex justify-between align-center" style="margin-bottom:8px">
            <span style="font-weight:600">${data.nombre}</span>
            <span style="font-weight:700;color:${pct >= 80 ? 'var(--color-verde)' : pct >= 60 ? 'var(--color-amarillo)' : 'var(--color-rojo)'}">${pct}%</span>
          </div>
          <div class="progress-bar" style="height:10px">
            <div class="progress-fill" style="
              width:${pct}%;
              background:${pct >= 80 ? 'var(--color-verde)' : pct >= 60 ? 'var(--color-amarillo)' : 'var(--color-rojo)'}
            "></div>
          </div>
        </div>
      </div>

      <!-- Historial -->
      <div class="card">
        <div class="card-header">
          <div class="card-titulo">Historial de Asistencias</div>
        </div>
        <div class="card-body" style="padding:0">
          <div class="tabla-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Grupo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${!data.historial || data.historial.length === 0
                  ? `<tr><td colspan="3">
                      <div class="vacio">
                        <div class="vacio-icono"><i class="fa-solid fa-building-columns"></i></div>
                        <div class="vacio-texto">Sin registros</div>
                      </div>
                    </td></tr>`
                  : data.historial.map(h => `
                    <tr>
                      <td class="mono">${h.fecha}</td>
                      <td>${h.grupo}</td>
                      <td>${badgeEstado(h.estado)}</td>
                    </tr>`).join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

  } catch (err) {
    contenido.innerHTML = `
      <div class="vacio">
        <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="vacio-texto">Error al cargar datos</div>
      </div>`;
  }
}

// --- Badge de estado ---
function badgeEstado(estado) {
  const badges = {
    asistio: '<span class="badge badge-verde">✓ Asistió</span>',
    falto:   '<span class="badge badge-rojo">✗ Faltó</span>',
    retardo: '<span class="badge badge-amarillo">⏱ Retardo</span>',
  };
  return badges[estado] || estado;
}