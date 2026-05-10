const db = require('../config/db');

const login = async (req, res) => {

    try {

        // Datos enviados desde frontend
        const { usuario, contrasena, rol } = req.body;

        console.log(req.body);

        // Buscar usuario en la base de datos
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE usuario = ? AND rol = ?',
            [usuario, rol]
        );

        // Verificar si el usuario existe
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
                id: user.id,
                nombre: user.usuario,
                rol: user.rol
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