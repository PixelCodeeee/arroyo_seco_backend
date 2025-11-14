// routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verifyOferente } = require('../middleware/auth');

// ------------------- PUBLIC -------------------
router.get('/', productoController.getAllProductos);
router.get('/detalle/:id', productoController.getProducto);
router.get('/categoria/:tipo', productoController.getProductosPorTipo);
router.get('/stock/:id', productoController.verificarStock);

// ------------------- OFERENTE (PRIVATE) -------------------
router.get('/mis-productos', verifyOferente, productoController.getMisProductos);

router.post('/crear', verifyOferente, productoController.crearProducto);

router.put('/actualizar/:id', verifyOferente, productoController.actualizarProducto);

router.delete('/eliminar/:id', verifyOferente, productoController.eliminarProducto);

router.patch('/inventario/:id', verifyOferente, productoController.actualizarInventario);

module.exports = router;