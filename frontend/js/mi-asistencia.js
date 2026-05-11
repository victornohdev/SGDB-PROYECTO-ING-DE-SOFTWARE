// =============================================
//  MI-ASISTENCIA.JS — Vista del alumno
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

const API = 'http://localhost:3000/api';
let historialCompleto = [];

// --- Inicializar ---
document.addEventListener('DOMContentLoaded', async () => {
  setFechasDefault();
  await cargarMiAsistencia();
});

// --- Fechas por defecto (mes actual) ---
function setFechasDefault() {
  const hoy    = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  document.getElementById('fecha-inicio').value = inicio.toISOString().split('T')[0];
  document.getElementById('fecha-fin').value    = hoy.toISOString().split('T')[0];
}

// --- Cargar asistencia del alumno ---
async function cargarMiAsistencia() {
  try {
    const usuario = obtenerUsuario();

    document.getElementById('nombre-alumno').textContent = usuario.nombre;

    const res  = await fetch(`${API}/alumnos/${usuario.id}/asistencias`);
    const data = await res.json();

    historialCompleto = data.historial || [];

    // Estadísticas
    const s   = historialCompleto.filter(h => h.estado === 'asistio').length;
    const f   = historialCompleto.filter(h => h.estado === 'falto').length;
    const r   = historialCompleto.filter(h => h.estado === 'retardo').length;
    const pct = historialCompleto.length > 0
      ? Math.round((s / historialCompleto.length) * 100)
      : 0;

    document.getElementById('total-asistencias').textContent = s;
    document.getElementById('total-faltas').textContent      = f;
    document.getElementById('total-retardos').textContent    = r;

    // Porcentaje
    const pctEl  = document.getElementById('pct-texto');
    const fillEl = document.getElementById('progress-asistencia');
    const color  = pct >= 80 ? 'var(--color-verde)' :
                   pct >= 60 ? 'var(--color-amarillo)' :
                               'var(--color-rojo)';

    pctEl.textContent    = `${pct}%`;
    pctEl.style.color    = color;
    fillEl.style.width   = `${pct}%`;
    fillEl.style.background = color;

    renderHistorial(historialCompleto);

  } catch (err) {
    document.getElementById('tabla-historial').innerHTML = `
      <tr><td colspan="3">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="vacio-texto">Error al cargar asistencias</div>
        </div>
      </td></tr>`;
  }
}

// --- Renderizar historial en tabla ---
function renderHistorial(lista) {
  const tbody = document.getElementById('tabla-historial');

  document.getElementById('total-registros').textContent =
    `${lista.length} registro${lista.length !== 1 ? 's' : ''}`;

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="3">
        <div class="vacio">
          <div class="vacio-icono"><i class="fa-solid fa-building-columns"></i></div>
          <div class="vacio-texto">Sin registros en el período seleccionado</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(h => `
    <tr>
      <td class="mono">${h.fecha}</td>
      <td>${h.grupo}</td>
      <td>${badgeEstado(h.estado)}</td>
    </tr>
  `).join('');
}

// --- Filtrar historial por fechas ---
function filtrarHistorial() {
  const inicio = document.getElementById('fecha-inicio').value;
  const fin    = document.getElementById('fecha-fin').value;

  if (!inicio || !fin) {
    alert('Selecciona un rango de fechas.');
    return;
  }

  const filtrado = historialCompleto.filter(h => {
    return h.fecha >= inicio && h.fecha <= fin;
  });

  renderHistorial(filtrado);
}

// --- Limpiar filtro ---
function limpiarFiltro() {
  setFechasDefault();
  renderHistorial(historialCompleto);
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