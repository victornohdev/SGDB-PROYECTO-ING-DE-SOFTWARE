// =============================================
//  AUTH.JS — Login, logout y manejo de sesión
//  SGAE - Sistema de Gestión de Asistencias
// =============================================

// Rol seleccionado actualmente
let rolSeleccionado = 'maestro';

// --- Seleccionar rol en los tabs ---
function seleccionarRol(rol, btn) {
    rolSeleccionado = rol;

    // Quitar activo de todos los tabs
    document.querySelectorAll('.rol-tab').forEach(t => t.classList.remove('activo'));

    // Poner activo en el tab clickeado
    btn.classList.add('activo');

    // Limpiar campos
    document.getElementById('usuario').value = '';
    document.getElementById('contrasena').value = '';
    ocultarError();
}

// --- Mostrar/ocultar contraseña ---
function togglePassword() {
    const input = document.getElementById('contrasena');
    const ojo = document.getElementById('ojo');

    if (input.type === 'password') {
        input.type = 'text';
        ojo.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        ojo.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
}

// --- Mostrar error ---
function mostrarError(msg) {
    const el = document.getElementById('error-msg');

    el.textContent = msg;
    el.classList.add('visible');

    // Inputs en rojo
    document.getElementById('usuario')
        .classList.add('input-error');

    document.getElementById('contrasena')
        .classList.add('input-error');
}

// --- Ocultar error ---
function ocultarError() {
    document.getElementById('error-msg')
        .classList.remove('visible');

    // Quitar rojo
    document.getElementById('usuario')
        .classList.remove('input-error');

    document.getElementById('contrasena')
        .classList.remove('input-error');
}

// --- Iniciar sesión ---
async function iniciarSesion() {
    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();

    // Validar campos vacíos
    if (!usuario || !contrasena) {
        mostrarError('Por favor completa todos los campos.');
        return;
    }

    ocultarError();

    try {
        // Llamada al backend
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contrasena, rol: rolSeleccionado })
        });

        const data = await res.json();

        if (!res.ok) {
            mostrarError(data.mensaje || 'Usuario o contraseña incorrectos.');
            return;
        }

        // Guardar sesión en sessionStorage
        sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

        // Redirigir según rol
        redirigirSegunRol(data.usuario.rol);

    } catch (err) {
        mostrarError('No se pudo conectar con el servidor. Intenta más tarde.');
    }
}

// --- Redirigir según rol ---
function redirigirSegunRol(rol) {
    const rutas = {
        admin: 'pages/dashboard-admin.html',
        maestro: 'pages/dashboard-maestro.html',
        alumno: 'pages/dashboard-alumno.html',
    };

    const destino = rutas[rol];
    if (destino) {
        window.location.href = destino;
    } else {
        mostrarError('Rol no reconocido.');
    }
}

// --- Cerrar sesión (se llama desde cualquier página) ---
function cerrarSesion() {
    sessionStorage.removeItem('usuario');
    window.location.href = '../index.html';
}
/* CHORIZO QUE TIENE QUE HACER DIEGO
// --- Obtener usuario actual ---
function obtenerUsuario() {
    const data = sessionStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
}

// --- Proteger páginas (redirige si no hay sesión) ---
function verificarSesion() {
    const usuario = obtenerUsuario();
    if (!usuario) {
        window.location.href = '../index.html';
    }
    return usuario;
}
*/
// --- Permitir login con Enter ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') iniciarSesion();
});



// TEMPORAL — quitar cuando el backend esté listo
function obtenerUsuario() {
  return { nombre: 'Admin Prueba', rol: 'admin' };
}

function verificarSesion() {
  return { nombre: 'Admin Prueba', rol: 'admin' };
}