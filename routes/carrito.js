// routes/carrito.js
const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const { verificarToken } = require('../middleware/auth'); // Asume que tienes middleware de auth

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener carrito del usuario
router.get('/', carritoController.getCarrito);

// Obtener resumen (cantidad y total) - útil para el badge del navbar
router.get('/resumen', carritoController.getResumenCarrito);

// Obtener carrito agrupado por oferente - útil para checkout
router.get('/agrupado', carritoController.getCarritoAgrupado);

// Verificar disponibilidad de productos en el carrito
router.get('/verificar-disponibilidad', carritoController.verificarDisponibilidad);

// Agregar producto al carrito
router.post('/agregar', carritoController.agregarAlCarrito);

// Actualizar cantidad de un item
router.put('/:id_carrito/cantidad', carritoController.actualizarCantidad);

// Eliminar item del carrito
router.delete('/:id_carrito', carritoController.eliminarItem);

// Vaciar carrito completo
router.delete('/', carritoController.vaciarCarrito);

module.exports = router;