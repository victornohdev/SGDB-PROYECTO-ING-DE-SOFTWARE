const router = require('express').Router();
const { getMaestros, getGruposMaestro, getAlumnosMaestro, crearMaestro, editarMaestro, eliminarMaestro } = require('../controllers/maestros.controller');

router.get('/',              getMaestros);
router.get('/:id/grupos',    getGruposMaestro);
router.get('/:id/alumnos',   getAlumnosMaestro);
router.post('/',             crearMaestro);
router.put('/:id',           editarMaestro);
router.delete('/:id',        eliminarMaestro);

module.exports = router;