// routes/productos.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middleware/auth');
const validation = require('../middleware/validation');

// Public routes
router.get('/', productoController.getAllProductos);
router.get('/servicios/restaurante', productoController.getServiciosRestaurante);
router.get('/detalle/:id', validation.validateId, productoController.getProducto);
router.get('/stock/:id', validation.validateId, productoController.verificarStock);
router.get('/:tipo', productoController.getProductosPorTipo);

// Protected routes with both auth and validation
router.get('/mis-productos', authMiddleware.verifyOferente, productoController.getMisProductos);
router.post('/crear', 
  authMiddleware.verifyOferente,
  validation.sanitizeInput,
  validation.validateRequiredFields(['nombre', 'precio']),
  productoController.crearProducto
);
router.put('/actualizar/:id', 
  authMiddleware.verifyOferente,
  validation.validateId,
  validation.sanitizeInput,
  productoController.actualizarProducto
);
router.delete('/eliminar/:id', 
  authMiddleware.verifyOferente,
  validation.validateId,
  productoController.eliminarProducto
);
router.patch('/inventario/:id', 
  authMiddleware.verifyOferente,
  validation.validateId,
  productoController.actualizarInventario
);

module.exports = router;