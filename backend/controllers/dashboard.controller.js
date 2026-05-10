const db = require('../config/db');

const getEstadisticas = async (req, res) => {
    try {
        const [[{ totalAlumnos }]]  = await db.query(`SELECT COUNT(*) AS totalAlumnos FROM Alumnos`);
        const [[{ totalMaestros }]] = await db.query(`SELECT COUNT(*) AS totalMaestros FROM Maestro`);
        const [[{ totalGrupos }]]   = await db.query(`SELECT COUNT(*) AS totalGrupos FROM Grupos`);

        // Asistencia de hoy
        const hoy = new Date().toISOString().slice(0, 10);
        const [[{ total }]]     = await db.query(`SELECT COUNT(*) AS total FROM Asistencias WHERE fecha = ?`, [hoy]);
        const [[{ asistidos }]] = await db.query(`SELECT COUNT(*) AS asistidos FROM Asistencias WHERE fecha = ? AND asistencia_registrada = 'asistio'`, [hoy]);
        const asistenciaHoy = total > 0 ? Math.round((asistidos / total) * 100) : 0;

        // Cumpleaños hoy
        const hoyMD = hoy.slice(5);
        const [cumpleRows] = await db.query(
            `SELECT nombre FROM Alumnos WHERE DATE_FORMAT(fecha_nacimiento, '%m-%d') = ?`,
            [hoyMD]
        );
        const cumpleanos = cumpleRows.map(r => r.nombre);

        res.json({ totalAlumnos, totalMaestros, totalGrupos, asistenciaHoy, cumpleanos });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    }
};

module.exports = { getEstadisticas };