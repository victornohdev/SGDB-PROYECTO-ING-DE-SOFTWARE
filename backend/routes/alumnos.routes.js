const router = require('express').Router();

const {
    getAlumnos,
    getInfoAlumno,
    getEstadisticasAlumno,
    getHistorialAlumno,
    crearAlumno,
    editarAlumno,
    eliminarAlumno
} = require('../controllers/alumnos.controller');

const {
    getAsistenciasAlumno
} = require('../controllers/asistencias.controller');

router.get('/:id/asistencias', getAsistenciasAlumno);

router.get('/',                 getAlumnos);
router.get('/:id',              getInfoAlumno);
router.get('/:id/estadisticas', getEstadisticasAlumno);
router.get('/:id/asistencias',  getHistorialAlumno);

router.post('/',                crearAlumno);
router.put('/:id',              editarAlumno);
router.delete('/:id',           eliminarAlumno);

module.exports = router;