const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

// ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas con parámetros dinámicos

// Verificar disponibilidad (debe ir ANTES de /:id)
router.get('/check/disponibilidad', reservaController.verificarDisponibilidad);

// Filtros por estado (debe ir ANTES de /:id)
router.get('/estado/:estado', reservaController.obtenerReservasPorEstado);

// Filtros por usuario (debe ir ANTES de /:id)
router.get('/usuario/:usuarioId', reservaController.obtenerReservasPorUsuario);

// Filtros por servicio (debe ir ANTES de /:id)
router.get('/servicio/:servicioId', reservaController.obtenerReservasPorServicio);

// Filtros por oferente (debe ir ANTES de /:id)
router.get('/oferente/:oferenteId', reservaController.obtenerReservasPorOferente);

// CRUD básico (las rutas dinámicas van AL FINAL)
router.post('/', reservaController.crearReserva);
router.get('/', reservaController.obtenerReservas);
router.get('/:id', reservaController.obtenerReservaPorId);
router.put('/:id', reservaController.actualizarReserva);
router.delete('/:id', reservaController.eliminarReserva);

// Acciones específicas sobre una reserva
router.patch('/:id/estado', reservaController.cambiarEstado);

module.exports = router;