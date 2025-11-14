const express = require('express');
const router = express.Router();
const oferenteController = require('../controllers/oferenteController');

router.post('/', oferenteController.crearOferente);
router.get('/', oferenteController.obtenerOferentes);
router.get('/:id', oferenteController.obtenerOferentePorId);
router.get('/usuario/:userId', oferenteController.obtenerOferentePorUsuario);
router.put('/:id', oferenteController.actualizarOferente);
router.delete('/:id', oferenteController.eliminarOferente);
router.patch('/:id/estado', oferenteController.actualizarEstadoOferente);
module.exports = router;