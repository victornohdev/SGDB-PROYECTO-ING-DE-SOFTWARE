const db = require('../config/db');        // ← primera línea

const getGrupos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                g.id_grupo      AS id,
                g.nombre,
                g.grado,
                g.turno,
                g.maestro_id,
                m.nombre        AS maestro,
                COUNT(al.id_alumno) AS totalAlumnos
            FROM grupos g
            LEFT JOIN maestro m  ON m.id_maestro = g.maestro_id
            LEFT JOIN alumnos al ON al.grupo_id  = g.id_grupo
            GROUP BY g.id_grupo, g.nombre, g.grado, g.turno, g.maestro_id, m.nombre
            ORDER BY g.grado ASC, g.nombre ASC
        `);
        res.json(rows);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener grupos' });
    }
};

const crearGrupo = async (req, res) => {
    const { grado, nombre, turno } = req.body;

    if (!grado || !nombre || !turno) {
        return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    try {
        await db.query(
            `INSERT INTO grupos (grado, nombre, turno) VALUES (?, ?, ?)`,
            [grado, nombre, turno]
        );
        res.json({ mensaje: 'Grupo creado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al crear grupo' });
    }
};

const editarGrupo = async (req, res) => {
    const { id } = req.params;
    const { grado, nombre, turno } = req.body;

    try {
        await db.query(
            `UPDATE grupos SET grado = ?, nombre = ?, turno = ? WHERE id_grupo = ?`,
            [grado, nombre, turno, id]
        );
        res.json({ mensaje: 'Grupo actualizado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al editar grupo' });
    }
};

const eliminarGrupo = async (req, res) => {
    const { id } = req.params;

    try {
        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM alumnos WHERE grupo_id = ?`, [id]
        );

        if (total > 0) {
            return res.status(400).json({ mensaje: 'No se puede eliminar un grupo con alumnos asignados.' });
        }

        await db.query(`DELETE FROM grupos WHERE id_grupo = ?`, [id]);
        res.json({ mensaje: 'Grupo eliminado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al eliminar grupo' });
    }
};

// GET /api/grupos/:id/alumnos
const getAlumnosGrupo = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT
                id_alumno AS id,
                nombre,
                no_control AS control
            FROM alumnos
            WHERE grupo_id = ?
            ORDER BY nombre ASC
        `, [id]);

        res.json(rows);

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener alumnos del grupo' });
    }
};

module.exports = { getGrupos, crearGrupo, editarGrupo, eliminarGrupo, getAlumnosGrupo };      // ← última línea