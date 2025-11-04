const ServicioRestaurante = require('../models/ServicioRestaurante');
const Oferente = require('../models/Oferente');

// crear nuevo servicio
exports.crearServicio = async (req, res) => {
    try {
        const { 
            id_oferente, 
            nombre, 
            descripcion, 
            rango_precio, 
            capacidad, 
            imagenes, 
            esta_disponible,
            id_categoria 
        } = req.body;

        // validar campos requeridos
        if (!id_oferente || !nombre) {
            return res.status(400).json({ 
                error: 'Los campos id_oferente y nombre son requeridos' 
            });
        }

        // si el oferente existe
        const oferente = await Oferente.findById(id_oferente);
        if (!oferente) {
            return res.status(404).json({ 
                error: 'El oferente especificado no existe' 
            });
        }

        // validar capacidad
        if (capacidad && capacidad < 0) {
            return res.status(400).json({ 
                error: 'La capacidad no puede ser negativa' 
            });
        }

        // crear servicio
        const servicio = await ServicioRestaurante.create({ 
            id_oferente, 
            nombre, 
            descripcion, 
            rango_precio, 
            capacidad, 
            imagenes, 
            esta_disponible,
            id_categoria 
        });

        res.status(201).json({
            message: 'Servicio creado exitosamente',
            servicio
        });
    } catch (error) {
        console.error('Error creating servicio:', error);
        res.status(500).json({ error: error.message || 'Error al crear servicio' });
    }
};

// traer los servicios
exports.obtenerServicios = async (req, res) => {
    try {
        const servicios = await ServicioRestaurante.findAll();
        const stats = await ServicioRestaurante.getStats();
        
        res.json({
            total: servicios.length,
            stats,
            servicios
        });
    } catch (error) {
        console.error('Error fetching servicios:', error);
        res.status(500).json({ error: 'Error al obtener servicios' });
    }
};

// servicio por ID
exports.obtenerServicioPorId = async (req, res) => {
    try {
        const servicio = await ServicioRestaurante.findById(req.params.id);

        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json(servicio);
    } catch (error) {
        console.error('Error fetching servicio:', error);
        res.status(500).json({ error: 'Error al obtener servicio' });
    }
};

// traer servicios por oferente ID
exports.obtenerServiciosPorOferente = async (req, res) => {
    try {
        const servicios = await ServicioRestaurante.findByOfferenteId(req.params.oferenteId);

        res.json({
            total: servicios.length,
            servicios
        });
    } catch (error) {
        console.error('Error fetching servicios:', error);
        res.status(500).json({ error: 'Error al obtener servicios' });
    }
};

// actualizar servicio
exports.actualizarServicio = async (req, res) => {
    try {
        const { 
            nombre, 
            descripcion, 
            rango_precio, 
            capacidad, 
            imagenes, 
            esta_disponible,
            id_categoria 
        } = req.body;
        const servicioId = req.params.id;

        // checar si servicio existe
        const existingServicio = await ServicioRestaurante.findById(servicioId);
        if (!existingServicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // validar capacidad
        if (capacidad !== undefined && capacidad < 0) {
            return res.status(400).json({ 
                error: 'La capacidad no puede ser negativa' 
            });
        }

        // actualizar servicio
        const servicio = await ServicioRestaurante.update(servicioId, { 
            nombre, 
            descripcion, 
            rango_precio, 
            capacidad, 
            imagenes, 
            esta_disponible,
            id_categoria 
        });

        if (!servicio) {
            return res.status(400).json({ 
                error: 'No hay campos para actualizar' 
            });
        }

        res.json({
            message: 'Servicio actualizado exitosamente',
            servicio
        });
    } catch (error) {
        console.error('Error updating servicio:', error);
        res.status(500).json({ error: error.message || 'Error al actualizar servicio' });
    }
};

// elinminar servicio
exports.eliminarServicio = async (req, res) => {
    try {
        const deleted = await ServicioRestaurante.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ 
            message: 'Servicio eliminado exitosamente',
            id_servicio: req.params.id
        });
    } catch (error) {
        console.error('Error deleting servicio:', error);
        res.status(500).json({ error: 'Error al eliminar servicio' });
    }
};