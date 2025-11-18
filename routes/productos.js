// routes/productos.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController'); // ✅ Aquí SÍ
const { verifyOferente } = require('../middleware/auth');

console.log('📦 Rutas de productos cargadas');

// PÚBLICO - Esta ruta PRIMERO
router.get('/oferente/:id_oferente', productoController.getProductosPorOferente);
router.get('/', productoController.getAllProductos);
router.get('/categoria/:tipo', productoController.getProductosPorTipo);
router.get('/stock/:id', productoController.verificarStock);
router.get('/detalle/:id', productoController.getProducto);

// PRIVADO
router.get('/mis-productos', verifyOferente, productoController.getMisProductos);
router.post('/crear', verifyOferente, productoController.crearProducto);
router.put('/actualizar/:id', verifyOferente, productoController.actualizarProducto);
router.delete('/eliminar/:id', verifyOferente, productoController.eliminarProducto);
router.patch('/inventario/:id', verifyOferente, productoController.actualizarInventario);

module.exports = router;