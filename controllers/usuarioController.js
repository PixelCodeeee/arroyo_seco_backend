const Usuario = require('../models/Usuario');

// Allowed roles
const ROLES_VALIDOS = ['turista', 'oferente', 'admin'];

// CREATE - Register new user
exports.crearUsuario = async (req, res) => {
    try {
        const { correo, contrasena, nombre, rol } = req.body;

        // Validate required fields
        if (!correo || !contrasena || !nombre || !rol) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos: correo, contrasena, nombre, rol' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return res.status(400).json({ 
                error: 'Formato de correo inválido' 
            });
        }

        // Validate role
        if (!ROLES_VALIDOS.includes(rol)) {
            return res.status(400).json({ 
                error: `Rol inválido. Debe ser: ${ROLES_VALIDOS.join(', ')}` 
            });
        }

        // Validate password strength
        if (contrasena.length < 6) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }

        // Check if user already exists
        const existingUser = await Usuario.findByEmail(correo);
        if (existingUser) {
            return res.status(409).json({ 
                error: 'El correo ya está registrado' 
            });
        }

        // Create user
        const usuario = await Usuario.create({ correo, contrasena, nombre, rol });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

// READ - Get all users
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json({
            total: usuarios.length,
            usuarios
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// LOGIN - User login
exports.loginUsuario = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        
        console.log('Login attempt for:', correo); // Debug log
        
        if (!correo || !contrasena) {
            return res.status(400).json({
                error: 'Correo y contraseña son requeridos'
            });
        }
        
        const usuario = await Usuario.findByEmail(correo);
        if (!usuario) {
            console.log('User not found:', correo); // Debug log
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        const isPasswordValid = await Usuario.verifyPassword(contrasena, usuario.contrasena_hash);
        if (!isPasswordValid) {
            console.log('Invalid password for:', correo); // Debug log
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }
        
        // Generate JWT token (you'll need to install jsonwebtoken)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol },
            process.env.JWT_SECRET || 'your-secret-key', // Use environment variable
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login exitoso',
            token: token,  // ✅ Add token
            user: {  // ✅ Change "usuario" to "user"
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                nombre: usuario.nombre,
                rol: usuario.rol,
                esta_activo: usuario.esta_activo
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};


// READ - Get user by ID
exports.obtenerUsuarioPorId = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

// UPDATE - Update user
exports.actualizarUsuario = async (req, res) => {
    try {
        const { correo, contrasena, nombre, rol, esta_activo } = req.body;
        const userId = req.params.id;

        // Check if user exists
        const existingUser = await Usuario.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Validate email format if provided
        if (correo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                return res.status(400).json({ 
                    error: 'Formato de correo inválido' 
                });
            }

            // Check if email is already taken by another user
            const emailExists = await Usuario.emailExists(correo, userId);
            if (emailExists) {
                return res.status(409).json({ 
                    error: 'El correo ya está registrado por otro usuario' 
                });
            }
        }

        // Validate role if provided
        if (rol && !ROLES_VALIDOS.includes(rol)) {
            return res.status(400).json({ 
                error: `Rol inválido. Debe ser: ${ROLES_VALIDOS.join(', ')}` 
            });
        }

        // Validate password strength if provided
        if (contrasena && contrasena.length < 6) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }

        // Update user
        const usuario = await Usuario.update(userId, { 
            correo, 
            contrasena, 
            nombre, 
            rol, 
            esta_activo 
        });

        if (!usuario) {
            return res.status(400).json({ 
                error: 'No hay campos para actualizar' 
            });
        }

        res.json({
            message: 'Usuario actualizado exitosamente',
            usuario
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

// DELETE - Delete user
exports.eliminarUsuario = async (req, res) => {
    try {
        const deleted = await Usuario.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ 
            message: 'Usuario eliminado exitosamente',
            id_usuario: req.params.id
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};