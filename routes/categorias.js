// routes/categorias.js
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
// const { authenticateToken, isAdmin } = require('../middleware/auth'); // Descomenta cuando tengas el middleware

// Rutas públicas (GET)
router.get('/', categoriaController.getCategorias);
router.get('/tipo/:tipo', categoriaController.getCategoriasPorTipo);
router.get('/estadisticas', categoriaController.getEstadisticas);
router.get('/:id', categoriaController.getCategoria);
router.get('/:id/productos', categoriaController.getProductosDeCategoria);

// Rutas protegidas (requieren autenticación de admin)
// Descomenta estas líneas cuando tengas el middleware de autenticación
// router.post('/', authenticateToken, isAdmin, categoriaController.crearCategoria);
// router.put('/:id', authenticateToken, isAdmin, categoriaController.actualizarCategoria);
// router.delete('/:id', authenticateToken, isAdmin, categoriaController.eliminarCategoria);

// Por ahora, sin autenticación (solo para desarrollo)
router.post('/', categoriaController.crearCategoria);
router.put('/:id', categoriaController.actualizarCategoria);
router.delete('/:id', categoriaController.eliminarCategoria);

module.exports = router;