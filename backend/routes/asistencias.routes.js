const router = require('express').Router();

const {
    getRecientes,
    registrar,
    getConsultaGeneral,
    getConsultaGrupo,
    getConsultaAlumno,
    verificarLista,
    subirLista,
    getAsistenciasEditar,
    actualizarAsistencia
} = require('../controllers/asistencias.controller');

router.get('/general',   getConsultaGeneral);
router.get('/grupo',     getConsultaGrupo);
router.get('/alumno',    getConsultaAlumno);
router.get('/verificar', verificarLista);
router.get('/recientes', getRecientes);

// NUEVAS RUTAS
router.get('/editar', getAsistenciasEditar);
router.put('/:id', actualizarAsistencia);

router.post('/',         subirLista);
router.post('/registrar', registrar);

module.exports = router;