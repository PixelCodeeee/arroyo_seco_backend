// models/Reserva.js
const db = require('../config/db');

class Reserva {
    // Crear nueva reserva
    static async create(reservaData) {
        const { 
            id_usuario, 
            id_servicio, 
            fecha, 
            hora, 
            numero_personas, 
            estado = 'pendiente',
            notas 
        } = reservaData;
        
        const [result] = await db.query(
            `INSERT INTO RESERVA 
            (id_usuario, id_servicio, fecha, hora, numero_personas, estado, notas) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, id_servicio, fecha, hora, numero_personas, estado, notas]
        );
        
        return await this.findById(result.insertId);
    }

    // Encontrar todas las reservas
    static async findAll() {
        const [reservas] = await db.query(`
            SELECT 
                r.id_reserva,
                r.id_usuario,
                r.id_servicio,
                r.fecha,
                r.hora,
                r.numero_personas,
                r.estado,
                r.notas,
                u.nombre as nombre_usuario,
                u.email as email_usuario,
                u.telefono as telefono_usuario,
                s.nombre as nombre_servicio,
                s.rango_precio,
                s.capacidad,
                o.nombre_negocio,
                o.direccion
            FROM RESERVA r
            INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
            INNER JOIN SERVICIO_RESTAURANTE s ON r.id_servicio = s.id_servicio
            INNER JOIN OFERENTE o ON s.id_oferente = o.id_oferente
            ORDER BY r.fecha DESC, r.hora DESC
        `);
        
        return reservas;
    }

    // Encontrar reserva por ID
    static async findById(id) {
        const [reservas] = await db.query(`
            SELECT 
                r.id_reserva,
                r.id_usuario,
                r.id_servicio,
                r.fecha,
                r.hora,
                r.numero_personas,
                r.estado,
                r.notas,
                u.nombre as nombre_usuario,
                u.email as email_usuario,
                u.telefono as telefono_usuario,
                s.nombre as nombre_servicio,
                s.descripcion as descripcion_servicio,
                s.rango_precio,
                s.capacidad,
                o.nombre_negocio,
                o.direccion,
                o.telefono as telefono_negocio
            FROM RESERVA r
            INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
            INNER JOIN SERVICIO_RESTAURANTE s ON r.id_servicio = s.id_servicio
            INNER JOIN OFERENTE o ON s.id_oferente = o.id_oferente
            WHERE r.id_reserva = ?
        `, [id]);
        
        if (reservas.length === 0) return null;
        
        return reservas[0];
    }

    // Encontrar reservas por usuario
    static async findByUserId(userId) {
        const [reservas] = await db.query(`
            SELECT 
                r.id_reserva,
                r.id_usuario,
                r.id_servicio,
                r.fecha,
                r.hora,
                r.numero_personas,
                r.estado,
                r.notas,
                s.nombre as nombre_servicio,
                s.rango_precio,
                o.nombre_negocio,
                o.direccion
            FROM RESERVA r
            INNER JOIN SERVICIO_RESTAURANTE s ON r.id_servicio = s.id_servicio
            INNER JOIN OFERENTE o ON s.id_oferente = o.id_oferente
            WHERE r.id_usuario = ?
            ORDER BY r.fecha DESC, r.hora DESC
        `, [userId]);
        
        return reservas;
    }

    // Encontrar reservas por servicio
    static async findByServiceId(serviceId) {
        const [reservas] = await db.query(`
            SELECT 
                r.id_reserva,
                r.id_usuario,
                r.id_servicio,
                r.fecha,
                r.hora,
                r.numero_personas,
                r.estado,
                r.notas,
                u.nombre as nombre_usuario,
                u.email as email_usuario,
                u.telefono as telefono_usuario
            FROM RESERVA r
            INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
            WHERE r.id_servicio = ?
            ORDER BY r.fecha DESC, r.hora DESC
        `, [serviceId]);
        
        return reservas;
    }

    // Encontrar reservas por fecha
    static async findByDate(fecha) {
        const [reservas] = await db.query(`
            SELECT 
                r.id_reserva,
                r.id_usuario,
                r.id_servicio,
                r.fecha,
                r.hora,
                r.numero_personas,
                r.estado,
                r.notas,
                u.nombre as nombre_usuario,
                s.nombre as nombre_servicio,
                o.nombre_negocio
            FROM RESERVA r
            INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
            INNER JOIN SERVICIO_RESTAURANTE s ON r.id_servicio = s.id_servicio
            INNER JOIN OFERENTE o ON s.id_oferente = o.id_oferente
            WHERE r.fecha = ?
            ORDER BY r.hora ASC
        `, [fecha]);
        
        return reservas;
    }

    // Encontrar reservas por estado
    static async findByStatus(estado) {
        const [reservas] = await db.query(`
            SELECT 
                r.id_reserva,
                r.id_usuario,
                r.id_servicio,
                r.fecha,
                r.hora,
                r.numero_personas,
                r.estado,
                r.notas,
                u.nombre as nombre_usuario,
                s.nombre as nombre_servicio,
                o.nombre_negocio
            FROM RESERVA r
            INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
            INNER JOIN SERVICIO_RESTAURANTE s ON r.id_servicio = s.id_servicio
            INNER JOIN OFERENTE o ON s.id_oferente = o.id_oferente
            WHERE r.estado = ?
            ORDER BY r.fecha DESC, r.hora DESC
        `, [estado]);
        
        return reservas;
    }

    // Actualizar reserva
    static async update(id, reservaData) {
        const { 
            fecha, 
            hora, 
            numero_personas, 
            estado,
            notas 
        } = reservaData;
        
        let updateFields = [];
        let values = [];

        if (fecha) {
            updateFields.push('fecha = ?');
            values.push(fecha);
        }
        if (hora) {
            updateFields.push('hora = ?');
            values.push(hora);
        }
        if (numero_personas !== undefined) {
            updateFields.push('numero_personas = ?');
            values.push(numero_personas);
        }
        if (estado) {
            updateFields.push('estado = ?');
            values.push(estado);
        }
        if (notas !== undefined) {
            updateFields.push('notas = ?');
            values.push(notas);
        }

        if (updateFields.length === 0) {
            return null;
        }

        values.push(id);
        const query = `UPDATE RESERVA SET ${updateFields.join(', ')} WHERE id_reserva = ?`;
        
        await db.query(query, values);
        return await this.findById(id);
    }

    // Actualizar solo el estado de la reserva
    static async updateStatus(id, estado) {
        await db.query(
            'UPDATE RESERVA SET estado = ? WHERE id_reserva = ?',
            [estado, id]
        );
        return await this.findById(id);
    }

    // Eliminar reserva
    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM RESERVA WHERE id_reserva = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Verificar disponibilidad
    static async checkAvailability(id_servicio, fecha, hora, numero_personas) {
        // Verificar capacidad del servicio
        const [servicio] = await db.query(
            'SELECT capacidad FROM SERVICIO_RESTAURANTE WHERE id_servicio = ? AND esta_disponible = TRUE',
            [id_servicio]
        );

        if (servicio.length === 0) {
            return { available: false, reason: 'Servicio no disponible' };
        }

        // Contar personas ya reservadas para esa fecha y hora
        const [reservas] = await db.query(`
            SELECT SUM(numero_personas) as total_personas
            FROM RESERVA
            WHERE id_servicio = ? 
            AND fecha = ? 
            AND hora = ?
            AND estado IN ('confirmada', 'pendiente')
        `, [id_servicio, fecha, hora]);

        const personasReservadas = reservas[0].total_personas || 0;
        const capacidadDisponible = servicio[0].capacidad - personasReservadas;

        if (capacidadDisponible < numero_personas) {
            return { 
                available: false, 
                reason: `Solo hay ${capacidadDisponible} espacios disponibles`,
                capacidadDisponible 
            };
        }

        return { available: true, capacidadDisponible };
    }

    // Obtener estadísticas
    static async getStats() {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
                SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas
            FROM RESERVA
        `);
        
        return stats[0];
    }

    // Obtener reservas próximas (próximos 7 días)
    static async getUpcoming(days = 7) {
        const [reservas] = await db.query(`
            SELECT 
                r.*,
                u.nombre as nombre_usuario,
                s.nombre as nombre_servicio,
                o.nombre_negocio
            FROM RESERVA r
            INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
            INNER JOIN SERVICIO_RESTAURANTE s ON r.id_servicio = s.id_servicio
            INNER JOIN OFERENTE o ON s.id_oferente = o.id_oferente
            WHERE r.fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND r.estado IN ('pendiente', 'confirmada')
            ORDER BY r.fecha ASC, r.hora ASC
        `, [days]);
        
        return reservas;
    }
}

module.exports = Reserva;