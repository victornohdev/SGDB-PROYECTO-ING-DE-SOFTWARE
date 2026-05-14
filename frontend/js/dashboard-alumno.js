// =============================================
//  DASHBOARD-ALUMNO.JS
//  SGAE - Sistema de Gestión de Asistencias
// =============================================


document.addEventListener('DOMContentLoaded', async () => {
  const usuario = obtenerUsuario();
  if (usuario) {
    document.getElementById('saludo').textContent = `Bienvenido, ${usuario.nombre}`;
  }

  await cargarInfoAlumno();
  await cargarEstadisticas();
  await cargarHistorialReciente();
});

// --- Info del alumno ---
async function cargarInfoAlumno() {
  try {
    const usuario = obtenerUsuario();
    const res  = await fetch(`${API}/alumnos/${usuario.id}`);
    const data = await res.json();

    document.getElementById('info-control').textContent = data.control  ?? '—';
    document.getElementById('info-grupo').textContent   = `${data.grado} ${data.grupo}` ?? '—';
    document.getElementById('info-maestro').textContent = data.maestro  ?? '—';
    document.getElementById('info-turno').textContent   = data.turno    ?? '—';

  } catch (err) {
    console.error('Error al cargar info del alumno:', err);
  }
}

// --- Estadísticas de asistencia ---
async function cargarEstadisticas() {
  try {
    const usuario = obtenerUsuario();
    const res  = await fetch(`${API}/alumnos/${usuario.id}/estadisticas`);
    const data = await res.json();

    document.getElementById('total-asistencias').textContent = data.asistencias ?? '—';
    document.getElementById('total-faltas').textContent      = data.faltas      ?? '—';
    document.getElementById('total-retardos').textContent    = data.retardos    ?? '—';

    const pct = data.porcentaje ?? 0;
    document.getElementById('pct-texto').textContent        = `${pct}%`;
    document.getElementById('pct-texto').style.color        =
      pct >= 80 ? 'var(--color-verde)' :
      pct >= 60 ? 'var(--color-amarillo)' :
                  'var(--color-rojo)';

    const fill = document.getElementById('progress-asistencia');
    fill.style.width      = `${pct}%`;
    fill.style.background =
      pct >= 80 ? 'var(--color-verde)' :
      pct >= 60 ? 'var(--color-amarillo)' :
                  'var(--color-rojo)';

  } catch (err) {
    console.error('Error al cargar estadísticas:', err);
  }
}

// --- Historial reciente (últimas 5) ---
async function cargarHistorialReciente() {
  const tbody = document.getElementById('tabla-asistencias');

  try {
    const usuario = obtenerUsuario();
      console.log('Usuario:', usuario);
    const res  = await fetch(`${API}/alumnos/${usuario.id}/asistencias?limit=5`);
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Historial:', data);

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="3">
          <div class="vacio">
            <div class="vacio-icono">📅</div>
            <div class="vacio-texto">Sin asistencias registradas</div>
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(a => `
      <tr>
        <td class="mono">${a.fecha}</td>
        <td>${a.grupo}</td>
        <td>${badgeEstado(a.estado)}</td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="3">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="vacio-texto">Error al cargar historial</div>
        </div>
      </td></tr>`;
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