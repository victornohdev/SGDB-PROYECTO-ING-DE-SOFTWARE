// =============================================
//  DASHBOARD.JS — Lógica del dashboard admin
//  SGAE - Sistema de Gestión de Asistencias
// =============================================



// --- Cargar todo al iniciar ---
document.addEventListener('DOMContentLoaded', async () => {
  const usuario = obtenerUsuario();
  if (usuario) {
    document.getElementById('saludo').textContent = `Bienvenido, ${usuario.nombre}`;
  }

  await cargarEstadisticas();
  await cargarAsistenciasRecientes();
});

// --- Estadísticas generales ---
async function cargarEstadisticas() {
  try {
    const res  = await fetch(`${API}/dashboard/estadisticas`);
    const data = await res.json();

    document.getElementById('total-alumnos').textContent  = data.totalAlumnos  ?? '—';
    document.getElementById('total-maestros').textContent = data.totalMaestros ?? '—';
    document.getElementById('total-grupos').textContent   = data.totalGrupos   ?? '—';

    const pct = data.asistenciaHoy ?? 0;
    document.getElementById('asistencia-hoy').textContent     = `${pct}%`;
    document.getElementById('progress-hoy').style.width       = `${pct}%`;
    document.getElementById('progress-hoy').style.background  =
      pct >= 80 ? 'var(--color-verde)' :
      pct >= 60 ? 'var(--color-amarillo)' :
                  'var(--color-rojo)';

    // Cumpleaños
    if (data.cumpleanos && data.cumpleanos.length > 0) {
      const alerta = document.getElementById('cumple-alerta');
      document.getElementById('cumple-texto').textContent =
        '¡Cumpleaños hoy! ' + data.cumpleanos.join(', ');
      alerta.style.display = 'flex';
    }

  } catch (err) {
    console.error('Error al cargar estadísticas:', err);
  }
}

// --- Asistencias recientes ---
async function cargarAsistenciasRecientes() {
  const tbody = document.getElementById('tabla-asistencias');

  try {
    const res  = await fetch(`${API}/asistencias/recientes`);
    const data = await res.json();

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="vacio">
              <div class="vacio-icono">📋</div>
              <div class="vacio-texto">Sin asistencias registradas</div>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data.map(a => `
      <tr>
        <td>
          <div class="d-flex align-center gap-sm">
            <div class="avatar">${a.alumno[0]}</div>
            <b>${a.alumno}</b>
          </div>
        </td>
        <td class="mono">${a.fecha}</td>
        <td>${a.grupo}</td>
        <td>${badgeEstado(a.estado)}</td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="vacio">
            <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div class="vacio-texto">Error al cargar asistencias</div>
          </div>
        </td>
      </tr>`;
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