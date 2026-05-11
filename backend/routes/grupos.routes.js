const router = require('express').Router();
const { getGrupos, crearGrupo, editarGrupo, eliminarGrupo, getAlumnosGrupo } = require('../controllers/grupos.controller');

router.get('/',          getGrupos);
router.get('/:id/alumnos', getAlumnosGrupo);
router.post('/',         crearGrupo);
router.put('/:id',       editarGrupo);
router.delete('/:id',    eliminarGrupo);

module.exports = router;