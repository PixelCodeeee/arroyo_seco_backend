const Oferente = require('../models/Oferente');
const Usuario = require('../models/Usuario');

// CREATE crear oferente
exports.crearOferente = async (req, res) => {
    try {
        const { id_usuario, nombre_negocio, direccion, tipo, horario_disponibilidad } = req.body;

        // validar campos requeridos
        if (!id_usuario || !nombre_negocio || !tipo) {
            return res.status(400).json({ 
                error: 'Los campos id_usuario, nombre_negocio y tipo son requeridos' 
            });
        }

        // valida tipo
        const tiposValidos = ['restaurante', 'artesanal'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ 
                error: `Tipo inválido. Debe ser: ${tiposValidos.join(', ')}` 
            });
        }

        // verificar si existe usuario
        const usuario = await Usuario.findById(id_usuario);
        if (!usuario) {
            return res.status(404).json({ 
                error: 'El usuario especificado no existe' 
            });
        }

        // si el rol es oferent 
        if (usuario.rol !== 'oferente') {
            return res.status(400).json({ 
                error: 'El usuario debe tener rol de "oferente"' 
            });
        }

        // si el usuario ya tiene un oferente
        const existingOferente = await Oferente.findByUserId(id_usuario);
        if (existingOferente) {
            return res.status(409).json({ 
                error: 'Este usuario ya tiene un perfil de oferente' 
            });
        }

        // crear oferente 
        const oferente = await Oferente.create({ 
            id_usuario, 
            nombre_negocio, 
            direccion, 
            tipo, 
            horario_disponibilidad 
        });

        res.status(201).json({
            message: 'Oferente creado exitosamente',
            oferente
        });
    } catch (error) {
        console.error('Error creating oferente:', error);
        res.status(500).json({ error: error.message || 'Error al crear oferente' });
    }
};

// traer todos los oferentes
exports.obtenerOferentes = async (req, res) => {
    try {
        const oferentes = await Oferente.findAll();
        res.json({
            total: oferentes.length,
            oferentes
        });
    } catch (error) {
        console.error('Error fetching oferentes:', error);
        res.status(500).json({ error: 'Error al obtener oferentes' });
    }
};

// oferente por id 
exports.obtenerOferentePorId = async (req, res) => {
    try {
        const oferente = await Oferente.findById(req.params.id);

        if (!oferente) {
            return res.status(404).json({ error: 'Oferente no encontrado' });
        }

        res.json(oferente);
    } catch (error) {
        console.error('Error fetching oferente:', error);
        res.status(500).json({ error: 'Error al obtener oferente' });
    }
};

// traer oferente por ID de usuario
exports.obtenerOferentePorUsuario = async (req, res) => {
    try {
        const oferente = await Oferente.findByUserId(req.params.userId);

        if (!oferente) {
            return res.status(404).json({ error: 'Oferente no encontrado para este usuario' });
        }

        res.json(oferente);
    } catch (error) {
        console.error('Error fetching oferente:', error);
        res.status(500).json({ error: 'Error al obtener oferente' });
    }
};

//ACTUALIZAR 
exports.actualizarOferente = async (req, res) => {
    try {
        const { nombre_negocio, direccion, tipo, horario_disponibilidad } = req.body;
        const oferenteId = req.params.id;

        // Check if oferente exists
        const existingOferente = await Oferente.findById(oferenteId);
        if (!existingOferente) {
            return res.status(404).json({ error: 'Oferente no encontrado' });
        }

        // Validate tipo if provided
        if (tipo) {
            const tiposValidos = ['restaurante', 'artesanal'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({ 
                    error: `Tipo inválido. Debe ser: ${tiposValidos.join(', ')}` 
                });
            }
        }

        // actualizar oferente
        const oferente = await Oferente.update(oferenteId, { 
            nombre_negocio, 
            direccion, 
            tipo, 
            horario_disponibilidad 
        });

        if (!oferente) {
            return res.status(400).json({ 
                error: 'No hay campos para actualizar' 
            });
        }

        res.json({
            message: 'Oferente actualizado exitosamente',
            oferente
        });
    } catch (error) {
        console.error('Error updating oferente:', error);
        res.status(500).json({ error: error.message || 'Error al actualizar oferente' });
    }
};

// eliminar oferente
exports.eliminarOferente = async (req, res) => {
    try {
        const deleted = await Oferente.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Oferente no encontrado' });
        }

        res.json({ 
            message: 'Oferente eliminado exitosamente',
            id_oferente: req.params.id
        });
    } catch (error) {
        console.error('Error deleting oferente:', error);
        res.status(500).json({ error: 'Error al eliminar oferente' });
    }
};