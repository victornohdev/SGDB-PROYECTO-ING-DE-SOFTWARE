const db = require('../config/db');

const getRecientes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                a.nombre        AS alumno,
                as2.fecha,
                as2.asistencia_registrada AS estado,
                g.nombre        AS grupo
            FROM Asistencias as2
            JOIN Alumnos a ON a.id_alumno = as2.alumno_id
            LEFT JOIN Grupos g ON g.id_grupo = as2.grupo_id
            ORDER BY as2.fecha DESC, as2.id_asistencia DESC
            LIMIT 20
        `);

        const data = rows.map(r => ({
            alumno: r.alumno,
            fecha:  r.fecha instanceof Date ? r.fecha.toISOString().slice(0, 10) : r.fecha,
            grupo:  r.grupo ?? '-',
            estado: r.estado
        }));

        res.json(data);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener asistencias' });
    }
};

const registrar = async (req, res) => {
    const { alumno_id, grupo_id, fecha, asistencia_registrada, estado } = req.body;

    if (!alumno_id || !fecha || !asistencia_registrada) {
        return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    try {
        await db.query(
            `INSERT INTO Asistencias (alumno_id, grupo_id, fecha, asistencia_registrada, estado)
             VALUES (?, ?, ?, ?, ?)`,
            [alumno_id, grupo_id ?? null, fecha, asistencia_registrada, estado ?? 'activo']
        );
        res.json({ mensaje: 'Asistencia registrada correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al registrar asistencia' });
    }
};

module.exports = { getRecientes, registrar };