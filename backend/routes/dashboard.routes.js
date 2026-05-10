const router = require('express').Router();
const { getEstadisticas } = require('../controllers/dashboard.controller');

router.get('/estadisticas', getEstadisticas);

module.exports = router;