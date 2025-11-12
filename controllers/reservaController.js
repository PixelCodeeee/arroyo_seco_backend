// controllers/reservaController.js
const Reserva = require('../models/Reserva');
const ServicioRestaurante = require('../models/ServicioRestaurante');
const Usuario = require('../models/Usuario');

// Crear nueva reserva
exports.crearReserva = async (req, res) => {
    try {
        const { 
            id_usuario, 
            id_servicio, 
            fecha, 
            hora, 
            numero_personas, 
            notas 
        } = req.body;

        // Validar campos requeridos
        if (!id_usuario || !id_servicio || !fecha || !hora || !numero_personas) {
            return res.status(400).json({ 
                success: false,
                error: 'Los campos id_usuario, id_servicio, fecha, hora y numero_personas son requeridos' 
            });
        }

        // Verificar que el usuario existe
        const usuario = await Usuario.findById(id_usuario);
        if (!usuario) {
            return res.status(404).json({ 
                success: false,
                error: 'El usuario especificado no existe' 
            });
        }

        // Verificar que el servicio existe
        const servicio = await ServicioRestaurante.findById(id_servicio);
        if (!servicio) {
            return res.status(404).json({ 
                success: false,
                error: 'El servicio especificado no existe' 
            });
        }

        // Validar número de personas
        if (numero_personas < 1) {
            return res.status(400).json({ 
                success: false,
                error: 'El número de personas debe ser mayor a 0' 
            });
        }

        // Verificar disponibilidad
        const disponibilidad = await Reserva.checkAvailability(
            id_servicio, 
            fecha, 
            hora, 
            numero_personas
        );

        if (!disponibilidad.available) {
            return res.status(409).json({ 
                success: false,
                error: disponibilidad.reason,
                capacidadDisponible: disponibilidad.capacidadDisponible 
            });
        }

        // Crear reserva
        const reserva = await Reserva.create({ 
            id_usuario, 
            id_servicio, 
            fecha, 
            hora, 
            numero_personas, 
            estado: 'pendiente',
            notas 
        });

        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            data: reserva
        });
    } catch (error) {
        console.error('Error creating reserva:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error al crear reserva' 
        });
    }
};

// Obtener todas las reservas
exports.obtenerReservas = async (req, res) => {
    try {
        const reservas = await Reserva.findAll();
        const stats = await Reserva.getStats();
        
        res.json({
            success: true,
            total: reservas.length,
            stats,
            data: reservas
        });
    } catch (error) {
        console.error('Error fetching reservas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener reservas' 
        });
    }
};

// Obtener reserva por ID
exports.obtenerReservaPorId = async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id);

        if (!reserva) {
            return res.status(404).json({ 
                success: false,
                error: 'Reserva no encontrada' 
            });
        }

        res.json({
            success: true,
            data: reserva
        });
    } catch (error) {
        console.error('Error fetching reserva:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener reserva' 
        });
    }
};

// Obtener reservas por usuario
exports.obtenerReservasPorUsuario = async (req, res) => {
    try {
        const reservas = await Reserva.findByUserId(req.params.userId);

        res.json({
            success: true,
            total: reservas.length,
            data: reservas
        });
    } catch (error) {
        console.error('Error fetching reservas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener reservas' 
        });
    }
};

// Obtener reservas por servicio
exports.obtenerReservasPorServicio = async (req, res) => {
    try {
        const reservas = await Reserva.findByServiceId(req.params.serviceId);

        res.json({
            success: true,
            total: reservas.length,
            data: reservas
        });
    } catch (error) {
        console.error('Error fetching reservas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener reservas' 
        });
    }
};

// Obtener reservas por fecha
exports.obtenerReservasPorFecha = async (req, res) => {
    try {
        const { fecha } = req.params;
        const reservas = await Reserva.findByDate(fecha);

        res.json({
            success: true,
            total: reservas.length,
            fecha,
            data: reservas
        });
    } catch (error) {
        console.error('Error fetching reservas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener reservas' 
        });
    }
};

// Obtener reservas por estado
exports.obtenerReservasPorEstado = async (req, res) => {
    try {
        const { estado } = req.params;
        
        // Validar estado
        const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                error: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`
            });
        }

        const reservas = await Reserva.findByStatus(estado);

        res.json({
            success: true,
            total: reservas.length,
            estado,
            data: reservas
        });
    } catch (error) {
        console.error('Error fetching reservas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener reservas' 
        });
    }
};

// Obtener reservas próximas
exports.obtenerReservasProximas = async (req, res) => {
    try {
        const days = req.query.days || 7;
        const reservas = await Reserva.getUpcoming(days);

        res.json({
            success: true,
            total: reservas.length,
            days,
            data: reservas
        });
    } catch (error) {
        console.error('Error fetching upcoming reservas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener reservas próximas' 
        });
    }
};

// Actualizar reserva
exports.actualizarReserva = async (req, res) => {
    try {
        const { 
            fecha, 
            hora, 
            numero_personas, 
            estado,
            notas 
        } = req.body;
        const reservaId = req.params.id;

        // Verificar si la reserva existe
        const existingReserva = await Reserva.findById(reservaId);
        if (!existingReserva) {
            return res.status(404).json({ 
                success: false,
                error: 'Reserva no encontrada' 
            });
        }

        // Validar número de personas si se proporciona
        if (numero_personas !== undefined && numero_personas < 1) {
            return res.status(400).json({ 
                success: false,
                error: 'El número de personas debe ser mayor a 0' 
            });
        }

        // Si se cambia fecha, hora o número de personas, verificar disponibilidad
        if (fecha || hora || numero_personas) {
            const nuevaFecha = fecha || existingReserva.fecha;
            const nuevaHora = hora || existingReserva.hora;
            const nuevoNumero = numero_personas || existingReserva.numero_personas;

            const disponibilidad = await Reserva.checkAvailability(
                existingReserva.id_servicio,
                nuevaFecha,
                nuevaHora,
                nuevoNumero
            );

            if (!disponibilidad.available) {
                return res.status(409).json({ 
                    success: false,
                    error: disponibilidad.reason,
                    capacidadDisponible: disponibilidad.capacidadDisponible 
                });
            }
        }

        // Actualizar reserva
        const reserva = await Reserva.update(reservaId, { 
            fecha, 
            hora, 
            numero_personas, 
            estado,
            notas 
        });

        if (!reserva) {
            return res.status(400).json({ 
                success: false,
                error: 'No hay campos para actualizar' 
            });
        }

        res.json({
            success: true,
            message: 'Reserva actualizada exitosamente',
            data: reserva
        });
    } catch (error) {
        console.error('Error updating reserva:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error al actualizar reserva' 
        });
    }
};

// Actualizar estado de reserva
exports.actualizarEstadoReserva = async (req, res) => {
    try {
        const { estado } = req.body;
        const reservaId = req.params.id;

        // Validar estado
        const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                error: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`
            });
        }

        // Verificar si la reserva existe
        const existingReserva = await Reserva.findById(reservaId);
        if (!existingReserva) {
            return res.status(404).json({ 
                success: false,
                error: 'Reserva no encontrada' 
            });
        }

        const reserva = await Reserva.updateStatus(reservaId, estado);

        res.json({
            success: true,
            message: `Estado de reserva actualizado a ${estado}`,
            data: reserva
        });
    } catch (error) {
        console.error('Error updating reserva status:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al actualizar estado de reserva' 
        });
    }
};

// Eliminar reserva
exports.eliminarReserva = async (req, res) => {
    try {
        const deleted = await Reserva.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ 
                success: false,
                error: 'Reserva no encontrada' 
            });
        }

        res.json({ 
            success: true,
            message: 'Reserva eliminada exitosamente',
            id_reserva: req.params.id
        });
    } catch (error) {
        console.error('Error deleting reserva:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al eliminar reserva' 
        });
    }
};

// Verificar disponibilidad
exports.verificarDisponibilidad = async (req, res) => {
    try {
        const { id_servicio, fecha, hora, numero_personas } = req.query;

        if (!id_servicio || !fecha || !hora || !numero_personas) {
            return res.status(400).json({
                success: false,
                error: 'Todos los parámetros son requeridos: id_servicio, fecha, hora, numero_personas'
            });
        }

        const disponibilidad = await Reserva.checkAvailability(
            id_servicio,
            fecha,
            hora,
            parseInt(numero_personas)
        );

        res.json({
            success: true,
            ...disponibilidad
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al verificar disponibilidad' 
        });
    }
};