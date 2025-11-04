const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');

// Servicio CRUD routes
router.post('/', servicioController.crearServicio);
router.get('/', servicioController.obtenerServicios);
router.get('/:id', servicioController.obtenerServicioPorId);
router.get('/oferente/:oferenteId', servicioController.obtenerServiciosPorOferente);
router.put('/:id', servicioController.actualizarServicio);
router.delete('/:id', servicioController.eliminarServicio);

module.exports = router;