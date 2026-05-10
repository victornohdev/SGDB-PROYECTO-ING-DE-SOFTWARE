const router = require('express').Router();
const { getRecientes, registrar } = require('../controllers/asistencias.controller');

router.get('/recientes',  getRecientes);
router.post('/registrar', registrar);

module.exports = router;