// routes/productos.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const categoriaController = require('../controllers/categoriaController');

// =======================
// PRODUCTOS
// =======================
router.post('/', productoController.crearProducto);
router.get('/', productoController.obtenerProductos);
router.get('/mis-productos', productoController.obtenerMisProductos);

// 🆕 ADD THIS - Get products by oferente
router.get('/oferente/:oferenteId', productoController.obtenerProductosPorOferente);

// =======================
// CATEGORÍAS (MUST GO FIRST)
// =======================
router.post('/categorias', categoriaController.crearCategoria);
router.get('/categorias', categoriaController.obtenerCategorias);
router.put('/categorias/:id', categoriaController.actualizarCategoria);
router.delete('/categorias/:id', categoriaController.eliminarCategoria);

// =======================
// PRODUCTOS BY ID (PLACE LAST)
// =======================
router.get('/:id', productoController.obtenerProducto);
router.put('/:id', productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;