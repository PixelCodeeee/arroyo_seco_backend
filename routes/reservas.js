// routes/reservas.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

// Rutas de consulta
router.get('/', reservaController.obtenerReservas);
router.get('/proximas', reservaController.obtenerReservasProximas);
router.get('/disponibilidad', reservaController.verificarDisponibilidad);
router.get('/:id', reservaController.obtenerReservaPorId);
router.get('/usuario/:userId', reservaController.obtenerReservasPorUsuario);
router.get('/servicio/:serviceId', reservaController.obtenerReservasPorServicio);
router.get('/fecha/:fecha', reservaController.obtenerReservasPorFecha);
router.get('/estado/:estado', reservaController.obtenerReservasPorEstado);

// Rutas de modificación
router.post('/', reservaController.crearReserva);
router.put('/:id', reservaController.actualizarReserva);
router.patch('/:id/estado', reservaController.actualizarEstadoReserva);
router.delete('/:id', reservaController.eliminarReserva);

module.exports = router;