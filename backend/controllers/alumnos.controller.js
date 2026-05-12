const db = require('../config/db');

// GET /api/alumnos
const getAlumnos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                al.id_alumno        AS id,
                al.nombre,
                al.no_control       AS control,
                al.fecha_nacimiento AS cumpleanos,
                al.estado,
                al.grupo_id,
                g.nombre            AS grupo,
                g.grado             AS grado
            FROM alumnos al
            LEFT JOIN grupos g ON g.id_grupo = al.grupo_id
            ORDER BY al.nombre ASC
        `);

        const data = rows.map(r => ({
            ...r,
            cumpleanos: r.cumpleanos instanceof Date
                ? r.cumpleanos.toISOString().slice(0, 10)
                : r.cumpleanos
        }));

        res.json(data);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener alumnos' });
    }
};

// GET /api/alumnos/:id
const getInfoAlumno = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT
                al.no_control   AS control,
                g.grado         AS grado,
                g.nombre        AS grupo,
                m.nombre        AS maestro,
                g.turno
            FROM alumnos al
            LEFT JOIN grupos  g ON g.id_grupo   = al.grupo_id
            LEFT JOIN maestro m ON m.id_maestro = g.maestro_id
            WHERE al.id_alumno = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Alumno no encontrado' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener info del alumno' });
    }
};

// GET /api/alumnos/:id/estadisticas
const getEstadisticasAlumno = async (req, res) => {
    const { id } = req.params;
    try {
        const [[{ asistencias }]] = await db.query(
            `SELECT COUNT(*) AS asistencias FROM asistencias WHERE alumno_id = ? AND asistencia_registrada = 'asistio'`, [id]
        );
        const [[{ faltas }]] = await db.query(
            `SELECT COUNT(*) AS faltas FROM asistencias WHERE alumno_id = ? AND asistencia_registrada = 'falto'`, [id]
        );
        const [[{ retardos }]] = await db.query(
            `SELECT COUNT(*) AS retardos FROM asistencias WHERE alumno_id = ? AND asistencia_registrada = 'retardo'`, [id]
        );
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM asistencias WHERE alumno_id = ?`, [id]
        );

        const porcentaje = total > 0 ? Math.round((asistencias / total) * 100) : 0;

        res.json({ asistencias, faltas, retardos, porcentaje });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    }
};

// GET /api/alumnos/:id/asistencias
const getHistorialAlumno = async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const [rows] = await db.query(`
            SELECT
                as2.fecha,
                as2.asistencia_registrada AS estado,
                g.nombre                  AS grupo
            FROM asistencias as2
            LEFT JOIN Grupos g ON g.id_grupo = as2.grupo_id
            WHERE as2.alumno_id = ?
            ORDER BY as2.fecha DESC
            LIMIT ?
        `, [id, limit]);

        const data = rows.map(r => ({
            fecha:  r.fecha instanceof Date ? r.fecha.toISOString().slice(0, 10) : r.fecha,
            estado: r.estado,
            grupo:  r.grupo ?? '—'
        }));

        res.json(data);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener historial' });
    }
};

// POST /api/alumnos
const crearAlumno = async (req, res) => {
    console.log('BODY:', req.body);
    const { nombre, control, cumpleanos, grupo } = req.body;

    if (!nombre || !control || !grupo) {
        return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    try {
        await db.query(
            `INSERT INTO alumnos (nombre, contrasena, no_control, grupo_id, fecha_nacimiento, estado)
             VALUES (?, ?, ?, ?, ?, 'activo')`,
            [nombre, control, control, grupo, cumpleanos || null]
        );

        res.json({ mensaje: 'Alumno creado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al crear alumno' });
    }
};

// PUT /api/alumnos/:id
const editarAlumno = async (req, res) => {
    const { id } = req.params;
    const { nombre, control, cumpleanos, grupo } = req.body;

    try {
        await db.query(
            `UPDATE alumnos SET nombre = ?, no_control = ?, fecha_nacimiento = ?, grupo_id = ?
             WHERE id_alumno = ?`,
            [nombre, control, cumpleanos || null, grupo, id]
        );

        res.json({ mensaje: 'Alumno actualizado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al editar alumno' });
    }
};

// DELETE /api/alumnos/:id
const eliminarAlumno = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM alumnos WHERE id_alumno = ?`, [id]);
        res.json({ mensaje: 'Alumno eliminado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al eliminar alumno' });
    }
};

module.exports = {
    getAlumnos,
    getInfoAlumno,
    getEstadisticasAlumno,
    getHistorialAlumno,
    crearAlumno,
    editarAlumno,
    eliminarAlumno
};