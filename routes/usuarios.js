const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Authentication routes
router.post('/register', usuarioController.crearUsuario);
router.post('/login', usuarioController.loginUsuario);
router.post('/verify-2fa', usuarioController.verify2FA);
router.post('/resend-2fa', usuarioController.resend2FACode);

// User CRUD routes
router.get('/', usuarioController.obtenerUsuarios);
router.get('/:id', usuarioController.obtenerUsuarioPorId);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
