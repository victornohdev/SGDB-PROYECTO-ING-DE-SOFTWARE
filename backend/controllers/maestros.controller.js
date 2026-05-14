const db = require('../config/db');

// GET /api/maestros
const getMaestros = async (req, res) => {
    try {

        const [maestros] = await db.query(`
            SELECT id_maestro AS id, usuario AS nombre, nombre AS usuario, estado
            FROM maestro
            ORDER BY usuario ASC
        `);

        const data = await Promise.all(maestros.map(async (m) => {

            const [grupos] = await db.query(`
                SELECT id_grupo, nombre
                FROM grupos
                WHERE maestro_id = ?
            `, [m.id]);

            return {
                ...m,
                grupos: grupos.map(g => ({
                    id: g.id_grupo,
                    nombre: g.nombre
                }))
            };

        }));

        res.json(data);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al obtener maestros'
        });

    }
};

// GET /api/maestros/:id/grupos
const getGruposMaestro = async (req, res) => {
    const { id } = req.params;
    const hoy = new Date().toISOString().slice(0, 10);

    try {
        const [grupos] = await db.query(`
            SELECT
                g.id_grupo      AS id,
                g.nombre,
                g.grado,
                COUNT(al.id_alumno) AS totalAlumnos
            FROM grupos g
            LEFT JOIN alumnos al ON al.grupo_id = g.id_grupo
            WHERE g.maestro_id = ?
            GROUP BY g.id_grupo, g.nombre, g.grado
        `, [id]);

        const data = await Promise.all(grupos.map(async (g) => {
            const [[{ pasadas }]] = await db.query(`
                SELECT COUNT(*) AS pasadas
                FROM asistencias
                WHERE grupo_id = ? AND fecha = ?
            `, [g.id, hoy]);

            return {
                ...g,
                listaPasada: pasadas > 0
            };
        }));

        res.json(data);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener grupos del maestro' });
    }
};

// POST /api/maestros
const crearMaestro = async (req, res) => {
    console.log('BODY:', req.body);
    const { nombre, usuario, contrasena, grupos } = req.body;

    if (!nombre || !usuario || !contrasena) {
        return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO maestro (nombre, usuario, contrasena, estado) VALUES (?, ?, ?, 'activo')`,
            [usuario, nombre, contrasena]  // usuario->nombre, nombre->usuario
        );
console.log('Result:', result);
console.log('insertId:', result.insertId);
console.log('grupos a asignar:', grupos);
        const maestroId = result.insertId;

        if (grupos && grupos.length > 0) {
            await Promise.all(grupos.map(grupo_id =>
                db.query(`UPDATE grupos SET maestro_id = ? WHERE id_grupo = ?`, [maestroId, grupo_id])
            ));
        }

        res.json({ mensaje: 'Maestro creado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al crear maestro' });
    }
};

const editarMaestro = async (req, res) => {
    const { id } = req.params;
    const { nombre, usuario, contrasena, grupos } = req.body;

    try {
        if (contrasena) {
            await db.query(
                `UPDATE maestro SET nombre = ?, usuario = ?, contrasena = ? WHERE id_maestro = ?`,
                [usuario, nombre, contrasena, id]
            );
        } else {
            await db.query(
                `UPDATE maestro SET nombre = ?, usuario = ? WHERE id_maestro = ?`,
                [usuario, nombre, id]
            );
        }

        await db.query(`UPDATE grupos SET maestro_id = NULL WHERE maestro_id = ?`, [id]);

        if (grupos && grupos.length > 0) {
            await Promise.all(grupos.map(grupo_id =>
                db.query(`UPDATE grupos SET maestro_id = ? WHERE id_grupo = ?`, [id, grupo_id])
            ));
        }

        res.json({ mensaje: 'Maestro actualizado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al editar maestro' });
    }
};

// DELETE /api/maestros/:id
const eliminarMaestro = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`UPDATE grupos SET maestro_id = NULL WHERE maestro_id = ?`, [id]);
        await db.query(`DELETE FROM Maestro WHERE id_maestro = ?`, [id]);
        res.json({ mensaje: 'Maestro eliminado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al eliminar maestro' });
    }
};

// GET /api/maestros/:id/alumnos
const getAlumnosMaestro = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT
                al.id_alumno  AS id,
                al.nombre,
                al.no_control AS control
            FROM alumnos al
            JOIN grupos g ON g.id_grupo = al.grupo_id
            WHERE g.maestro_id = ?
            ORDER BY al.nombre ASC
        `, [id]);

        res.json(rows);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener alumnos del maestro' });
    }
};

module.exports = { getMaestros, getGruposMaestro, getAlumnosMaestro, crearMaestro, editarMaestro, eliminarMaestro };