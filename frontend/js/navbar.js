// =============================================
//  NAVBAR.JS — Sidebar dinámico según rol
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

// Menús según rol
const menus = {
  admin: [
    {
      seccion: 'General',
      items: [
        { icono: '<i class="fa-solid fa-house"></i>', label: 'Dashboard', url: 'dashboard-admin.html' },
        { icono: '<i class="fa-solid fa-user-graduate"></i>', label: 'Alumnos', url: 'alumnos.html' },
        { icono: '<i class="fa-duotone fa-solid fa-chalkboard-user"></i>', label: 'Maestros', url: 'maestros.html' },
        { icono: '<i class="fa-solid fa-users"></i>', label: 'Grupos', url: 'grupos.html' },
      ]
    },
    {
      seccion: 'Asistencias',
      items: [
        { icono: '<i class="fa-solid fa-chart-pie"></i>', label: 'Consulta General', url: 'consulta-general.html' },
        { icono: '<i class="fa-solid fa-clipboard-list"></i>', label: 'Por Grupo', url: 'consulta-grupo.html' },
        { icono: '<i class="fa-solid fa-pen"></i>', label: 'Por Alumno', url: 'consulta-alumno.html' },
      ]
    }
  ],
  maestro: [
    {
      seccion: 'Principal',
      items: [
        { icono: '<i class="fa-solid fa-house"></i>', label: 'Dashboard', url: 'dashboard-maestro.html' },
        { icono: '<i class="fa-solid fa-clipboard-check"></i>', label: 'Pasar Lista', url: 'pase-lista.html' },
        { icono: '<i class="fa-solid fa-file-pen"></i>', label: 'Editar Asistencia', url: 'editar-asistencia.html' },
      ]
    },
    {
      seccion: 'Consultas',
      items: [
        { icono: '<i class="fa-solid fa-users"></i>', label: 'Por Grupo', url: 'consulta-grupo.html' },
        { icono: '<i class="fa-solid fa-user-graduate"></i>', label: 'Por Alumno', url: 'consulta-alumno.html' },
      ]
    }
  ],
  alumno: [
    {
      seccion: 'Mi Información',
      items: [
        { icono: '<i class="fa-solid fa-house"></i>', label: 'Mi Dashboard', url: 'dashboard-alumno.html' },
        { icono: '<i class="fa-solid fa-calendar-days"></i>', label: 'Mi Asistencia', url: 'mi-asistencia.html' },
      ]
    }
  ]
};

// --- Generar el sidebar completo ---
function generarNavbar() {
  const usuario = obtenerUsuario();
  if (!usuario) return;

  const menu = menus[usuario.rol];
  if (!menu) return;

  // Página actual para marcar el nav-item activo
  const paginaActual = window.location.pathname.split('/').pop();

  const html = `
    <aside class="sidebar">

      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span style="color:var(--color-primario)">Edú</span><span>Track</span>
        </div>
        <div class="sidebar-usuario">${usuario.nombre} · ${usuario.rol}</div>
      </div>

      <nav class="sidebar-nav">
        ${menu.map(grupo => `
          <div class="nav-seccion">${grupo.seccion}</div>
          ${grupo.items.map(item => `
            <a href="${item.url}"
               class="nav-item ${paginaActual === item.url ? 'activo' : ''}">
              <span class="icono">${item.icono}</span>
              ${item.label}
            </a>
          `).join('')}
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <button class="btn btn-outline btn-sm btn-full" onclick="cerrarSesion()">
          <i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión
        </button>
      </div>

    </aside>
  `;

  document.getElementById('navbar').innerHTML = html;
}

// --- Inicializar al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
  const usuario = verificarSesion();
  if (usuario) generarNavbar();
});