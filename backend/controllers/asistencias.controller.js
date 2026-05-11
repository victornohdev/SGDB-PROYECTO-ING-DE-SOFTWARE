const db = require('../config/db');

const getRecientes = async (req, res) => {
    const { maestroId } = req.query;

    try {
        let query = `
            SELECT
                al.nombre                 AS alumno,
                as2.fecha,
                as2.asistencia_registrada AS estado,
                g.nombre                  AS grupo
            FROM Asistencias as2
            JOIN Alumnos al ON al.id_alumno = as2.alumno_id
            LEFT JOIN Grupos g ON g.id_grupo = as2.grupo_id
        `;

        const params = [];

        if (maestroId) {
            query += ` WHERE g.maestro_id = ?`;
            params.push(maestroId);
        }

        query += ` ORDER BY as2.fecha DESC, as2.id_asistencia DESC LIMIT 20`;

        const [rows] = await db.query(query, params);

        const data = rows.map(r => ({
            alumno: r.alumno,
            fecha:  r.fecha instanceof Date ? r.fecha.toISOString().slice(0, 10) : r.fecha,
            grupo:  r.grupo ?? '—',
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

// GET /api/asistencias/general
const getConsultaGeneral = async (req, res) => {
    const { inicio, fin, turno } = req.query;

    try {
        let query = `
            SELECT
                g.id_grupo,
                g.nombre,
                g.grado,
                g.turno,
                COUNT(CASE WHEN as2.asistencia_registrada = 'asistio' THEN 1 END) AS asistencias,
                COUNT(CASE WHEN as2.asistencia_registrada = 'falto'   THEN 1 END) AS faltas,
                COUNT(CASE WHEN as2.asistencia_registrada = 'retardo' THEN 1 END) AS retardos,
                COUNT(as2.id_asistencia) AS total
            FROM Grupos g
            LEFT JOIN Asistencias as2 ON as2.grupo_id = g.id_grupo
                AND as2.fecha BETWEEN ? AND ?
        `;

        const params = [inicio, fin];

        if (turno) {
            query += ` WHERE g.turno = ?`;
            params.push(turno.toLowerCase());
        }

        query += ` GROUP BY g.id_grupo, g.nombre, g.grado, g.turno
                   ORDER BY g.grado ASC, g.nombre ASC`;

        const [rows] = await db.query(query, params);

        const data = rows.map(r => ({
            ...r,
            porcentaje: r.total > 0 ? Math.round((r.asistencias / r.total) * 100) : 0
        }));

        res.json(data);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener consulta general' });
    }
};

// GET /api/asistencias/grupo
const getConsultaGrupo = async (req, res) => {
    const { grupoId, inicio, fin } = req.query;

    try {
        // Info del grupo
        const [[grupo]] = await db.query(
            `SELECT CONCAT(grado, '° ', nombre) AS nombre FROM Grupos WHERE id_grupo = ?`,
            [grupoId]
        );

        // Alumnos del grupo con sus conteos
        const [alumnos] = await db.query(`
            SELECT
                al.id_alumno AS id,
                al.nombre,
                COUNT(CASE WHEN as2.asistencia_registrada = 'asistio' THEN 1 END) AS asistencias,
                COUNT(CASE WHEN as2.asistencia_registrada = 'falto'   THEN 1 END) AS faltas,
                COUNT(CASE WHEN as2.asistencia_registrada = 'retardo' THEN 1 END) AS retardos,
                COUNT(as2.id_asistencia) AS total
            FROM Alumnos al
            LEFT JOIN Asistencias as2 ON as2.alumno_id = al.id_alumno
                AND as2.fecha BETWEEN ? AND ?
            WHERE al.grupo_id = ?
            GROUP BY al.id_alumno, al.nombre
            ORDER BY al.nombre ASC
        `, [inicio, fin, grupoId]);

        const data = alumnos.map(a => ({
            ...a,
            porcentaje: a.total > 0 ? Math.round((a.asistencias / a.total) * 100) : 0
        }));

        res.json({ grupo: grupo?.nombre ?? '—', alumnos: data });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener consulta por grupo' });
    }
};

// GET /api/asistencias/alumno
const getConsultaAlumno = async (req, res) => {
    const { alumnoId, inicio } = req.query;

    try {
        // Info del alumno
        const [[alumno]] = await db.query(
            `SELECT nombre FROM Alumnos WHERE id_alumno = ?`, [alumnoId]
        );

        // Conteos
        const [[{ asistencias }]] = await db.query(
            `SELECT COUNT(*) AS asistencias FROM Asistencias WHERE alumno_id = ? AND asistencia_registrada = 'asistio'`, [alumnoId]
        );
        const [[{ faltas }]] = await db.query(
            `SELECT COUNT(*) AS faltas FROM Asistencias WHERE alumno_id = ? AND asistencia_registrada = 'falto'`, [alumnoId]
        );
        const [[{ retardos }]] = await db.query(
            `SELECT COUNT(*) AS retardos FROM Asistencias WHERE alumno_id = ? AND asistencia_registrada = 'retardo'`, [alumnoId]
        );
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM Asistencias WHERE alumno_id = ?`, [alumnoId]
        );

        // Historial
        let historialQuery = `
            SELECT
                as2.fecha,
                as2.asistencia_registrada AS estado,
                g.nombre AS grupo
            FROM Asistencias as2
            LEFT JOIN Grupos g ON g.id_grupo = as2.grupo_id
            WHERE as2.alumno_id = ?
        `;

        const params = [alumnoId];

        if (inicio) {
            historialQuery += ` AND as2.fecha >= ?`;
            params.push(inicio);
        }

        historialQuery += ` ORDER BY as2.fecha DESC`;

        const [historial] = await db.query(historialQuery, params);

        const porcentaje = total > 0 ? Math.round((asistencias / total) * 100) : 0;

        res.json({
            nombre: alumno?.nombre ?? '—',
            asistencias,
            faltas,
            retardos,
            porcentaje,
            historial: historial.map(h => ({
                ...h,
                fecha: h.fecha instanceof Date ? h.fecha.toISOString().slice(0, 10) : h.fecha
            }))
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener consulta por alumno' });
    }
};

// GET /api/asistencias/verificar
const verificarLista = async (req, res) => {
    const { grupoId, fecha } = req.query;

    try {
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM Asistencias WHERE grupo_id = ? AND fecha = ?`,
            [grupoId, fecha]
        );

        res.json({ pasada: total > 0 });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al verificar lista' });
    }
};

// POST /api/asistencias — subir lista completa
const subirLista = async (req, res) => {
    const { asistencias, maestroId } = req.body;

    if (!asistencias || asistencias.length === 0) {
        return res.status(400).json({ mensaje: 'No hay asistencias para registrar' });
    }

    try {
        await Promise.all(asistencias.map(a =>
            db.query(
                `INSERT INTO Asistencias (alumno_id, grupo_id, fecha, asistencia_registrada, estado)
                 VALUES (?, ?, ?, ?, 'activo')
                 ON DUPLICATE KEY UPDATE asistencia_registrada = VALUES(asistencia_registrada)`,
                [a.alumnoId, a.grupoId, a.fecha, a.estado]
            )
        ));

        res.json({ mensaje: 'Lista registrada correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al registrar lista' });
    }
};

// GET /api/asistencias/editar
const getAsistenciasEditar = async (req, res) => {

    const { grupoId, fecha } = req.query;

    try {

        const [rows] = await db.query(`
            SELECT
                as2.id_asistencia AS id,
                al.nombre         AS alumno,
                al.no_control     AS control,
                as2.asistencia_registrada AS estado
            FROM Asistencias as2
            JOIN Alumnos al
                ON al.id_alumno = as2.alumno_id
            WHERE as2.grupo_id = ?
            AND as2.fecha = ?
            ORDER BY al.nombre ASC
        `, [grupoId, fecha]);

        res.json(rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al cargar asistencias'
        });

    }
};

// PUT /api/asistencias/:id
const actualizarAsistencia = async (req, res) => {

    const { id } = req.params;
    const { estado } = req.body;

    try {

        await db.query(`
            UPDATE Asistencias
            SET asistencia_registrada = ?
            WHERE id_asistencia = ?
        `, [estado, id]);

        res.json({
            mensaje: 'Asistencia actualizada'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al actualizar asistencia'
        });

    }
};

// GET /api/alumnos/:id/asistencias
const getAsistenciasAlumno = async (req, res) => {

    const { id } = req.params;

    try {

        const [rows] = await db.query(`
            SELECT
                a.fecha,
                a.asistencia_registrada AS estado,
                g.nombre AS grupo
            FROM Asistencias a
            LEFT JOIN Grupos g
                ON g.id_grupo = a.grupo_id
            WHERE a.alumno_id = ?
            ORDER BY a.fecha DESC
        `, [id]);

        const historial = rows.map(r => ({
            fecha: r.fecha instanceof Date
                ? r.fecha.toISOString().slice(0, 10)
                : r.fecha,
            estado: r.estado,
            grupo: r.grupo || '—'
        }));

        res.json({
            historial
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al obtener asistencias del alumno'
        });

    }

};

module.exports = {
    getRecientes,
    registrar,
    getConsultaGeneral,
    getConsultaGrupo,
    getConsultaAlumno,
    verificarLista,
    subirLista,
    getAsistenciasEditar,
    getAsistenciasAlumno,
    actualizarAsistencia
};
