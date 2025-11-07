// routes/productos.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// Rutas públicas
router.get('/:tipo', productoController.getProductosPorTipo);
router.get('/detalle/:id', productoController.getProducto);
router.get('/servicios/restaurante', productoController.getServiciosRestaurante);

module.exports = router;