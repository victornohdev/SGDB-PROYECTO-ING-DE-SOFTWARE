const db = require('../config/db');

const login = async (req, res) => {

    try {

        const { usuario, contrasena, rol } = req.body;

        let tabla = '';

        // Elegir tabla según el rol
        switch (rol) {

            case 'admin':
                tabla = 'Administradores';
                break;

            case 'maestro':
                tabla = 'Maestro';
                break;

            case 'alumno':
                tabla = 'Alumnos';
                break;

            default:
                return res.status(400).json({
                    mensaje: 'Rol inválido'
                });
        }

        console.log('TABLA:', tabla);
        console.log('USUARIO:', usuario);


        // Buscar usuario
        const [rows] = await db.query(
            `SELECT * FROM ${tabla} WHERE nombre = ?`,
            [usuario]
        );

        console.log(rows);

        // Verificar existencia
        if (rows.length === 0) {
            return res.status(401).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        const user = rows[0];

        // Validar contraseña
        if (user.contrasena !== contrasena) {
            return res.status(401).json({
                mensaje: 'Contraseña incorrecta'
            });
        }

        // Login exitoso
        return res.json({
            mensaje: 'Login exitoso',
            usuario: {
                nombre: user.nombre,
                rol: rol
            }
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            mensaje: 'Error interno del servidor'
        });

    }

};

module.exports = {
    login
};