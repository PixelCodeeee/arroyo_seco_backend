const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Rutas específicas primero
router.get('/usuario/:usuarioId', pedidoController.obtenerPedidosPorUsuario);
router.get('/oferente/:oferenteId', pedidoController.obtenerPedidosPorOferente);
router.get('/estado/:estado', pedidoController.obtenerPedidosPorEstado);

// CRUD básico
router.post('/', pedidoController.crearPedido);
router.get('/', pedidoController.obtenerPedidos);
router.get('/:id', pedidoController.obtenerPedidoPorId);
router.delete('/:id', pedidoController.eliminarPedido);

// Cambiar estado
router.patch('/:id/estado', pedidoController.cambiarEstado);

module.exports = router;