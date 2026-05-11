// =============================================
//  DASHBOARD-MAESTRO.JS
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

const API = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
  const usuario = obtenerUsuario();
  if (usuario) {
    document.getElementById('saludo').textContent = `Bienvenido, ${usuario.nombre}`;
  }

  await cargarGrupos();
  await cargarAsistenciasRecientes();
});

// --- Grupos del maestro con estado de lista ---
async function cargarGrupos() {
  const tbody = document.getElementById('tabla-grupos');

  try {
    const usuario = obtenerUsuario();
    const res  = await fetch(`${API}/maestros/${usuario.id}/grupos`);
    const data = await res.json();

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="4">
          <div class="vacio">
            <div class="vacio-icono">🏫</div>
            <div class="vacio-texto">Sin grupos asignados</div>
          </div>
        </td></tr>`;
      return;
    }

    // Contar listas pasadas y pendientes
    const pasadas   = data.filter(g => g.listaPasada).length;
    const pendientes = data.length - pasadas;

    document.getElementById('total-grupos').textContent      = data.length;
    document.getElementById('listas-hoy').textContent        = pasadas;
    document.getElementById('listas-pendientes').textContent = pendientes;

    tbody.innerHTML = data.map(g => `
      <tr>
        <td><b>${g.nombre}</b></td>
        <td>${g.totalAlumnos} alumnos</td>
        <td>
          ${g.listaPasada
            ? '<span class="badge badge-verde">✓ Lista pasada</span>'
            : '<span class="badge badge-amarillo">⏳ Pendiente</span>'
          }
        </td>
        <td>
          ${!g.listaPasada
            ? `<a href="pase-lista.html" class="btn btn-primario btn-sm">Pasar lista</a>`
            : `<a href="consulta-grupo.html" class="btn btn-outline btn-sm">Ver detalle</a>`
          }
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="vacio-texto">Error al cargar grupos</div>
        </div>
      </td></tr>`;
  }
}

// --- Asistencias recientes del maestro ---
async function cargarAsistenciasRecientes() {
  const tbody = document.getElementById('tabla-asistencias');

  try {
    const usuario = obtenerUsuario();
    const res  = await fetch(`${API}/asistencias/recientes?maestroId=${usuario.id}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="4">
          <div class="vacio">
            <div class="vacio-icono">📋</div>
            <div class="vacio-texto">Sin asistencias registradas</div>
          </div>
        </td></tr>`;
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
      <tr><td colspan="4">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="vacio-texto">Error al cargar asistencias</div>
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