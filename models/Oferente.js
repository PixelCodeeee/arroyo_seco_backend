const db = require('../config/db');

class Oferente {
    // Crear oferente
    static async create(oferenteData) {
        const { id_usuario, nombre_negocio, direccion, tipo, horario_disponibilidad } = oferenteData;
        
        // validar tipo
        const tiposValidos = ['restaurante', 'artesanal'];
        if (!tiposValidos.includes(tipo)) {
            throw new Error('Tipo debe ser "restaurante" o "artesanal"');
        }

        // convertir horsrio
        const horarioJSON = typeof horario_disponibilidad === 'object' 
            ? JSON.stringify(horario_disponibilidad) 
            : horario_disponibilidad;
        
        const [result] = await db.query(
            'INSERT INTO OFERENTE (id_usuario, nombre_negocio, direccion, tipo, horario_disponibilidad) VALUES (?, ?, ?, ?, ?)',
            [id_usuario, nombre_negocio, direccion, tipo, horarioJSON]
        );
        
        return await this.findById(result.insertId);
    }

    // encontrar todos los oferentes 
    static async findAll() {
        const [oferentes] = await db.query(`
            SELECT 
                o.id_oferente,
                o.id_usuario,
                o.nombre_negocio,
                o.direccion,
                o.tipo,
                o.horario_disponibilidad,
                u.nombre as nombre_usuario,
                u.correo as correo_usuario
            FROM OFERENTE o
            INNER JOIN USUARIO u ON o.id_usuario = u.id_usuario
            ORDER BY o.id_oferente DESC
        `);
        
        //  JSON horario_disponibilidad
        return oferentes.map(oferente => ({
            ...oferente,
            horario_disponibilidad: oferente.horario_disponibilidad 
                ? JSON.parse(oferente.horario_disponibilidad) 
                : null
        }));
    }

    // encontrar oferente por ID
    static async findById(id) {
        const [oferentes] = await db.query(`
            SELECT 
                o.id_oferente,
                o.id_usuario,
                o.nombre_negocio,
                o.direccion,
                o.tipo,
                o.horario_disponibilidad,
                u.nombre as nombre_usuario,
                u.correo as correo_usuario
            FROM OFERENTE o
            INNER JOIN USUARIO u ON o.id_usuario = u.id_usuario
            WHERE o.id_oferente = ?
        `, [id]);
        
        if (oferentes.length === 0) return null;
        
        const oferente = oferentes[0];
        oferente.horario_disponibilidad = oferente.horario_disponibilidad 
            ? JSON.parse(oferente.horario_disponibilidad) 
            : null;
        
        return oferente;
    }

    // encontrar oferente por ID de usuario
    static async findByUserId(userId) {
        const [oferentes] = await db.query(`
            SELECT 
                o.id_oferente,
                o.id_usuario,
                o.nombre_negocio,
                o.direccion,
                o.tipo,
                o.horario_disponibilidad
            FROM OFERENTE o
            WHERE o.id_usuario = ?
        `, [userId]);
        
        if (oferentes.length === 0) return null;
        
        const oferente = oferentes[0];
        oferente.horario_disponibilidad = oferente.horario_disponibilidad 
            ? JSON.parse(oferente.horario_disponibilidad) 
            : null;
        
        return oferente;
    }

    // actualizar oferente
    static async update(id, oferenteData) {
        const { nombre_negocio, direccion, tipo, horario_disponibilidad } = oferenteData;
        
        let updateFields = [];
        let values = [];

        if (nombre_negocio) {
            updateFields.push('nombre_negocio = ?');
            values.push(nombre_negocio);
        }
        if (direccion !== undefined) {
            updateFields.push('direccion = ?');
            values.push(direccion);
        }
        if (tipo) {
            const tiposValidos = ['restaurante', 'artesanal'];
            if (!tiposValidos.includes(tipo)) {
                throw new Error('Tipo debe ser "restaurante" o "artesanal"');
            }
            updateFields.push('tipo = ?');
            values.push(tipo);
        }
        if (horario_disponibilidad !== undefined) {
            const horarioJSON = typeof horario_disponibilidad === 'object' 
                ? JSON.stringify(horario_disponibilidad) 
                : horario_disponibilidad;
            updateFields.push('horario_disponibilidad = ?');
            values.push(horarioJSON);
        }

        if (updateFields.length === 0) {
            return null;
        }

        values.push(id);
        const query = `UPDATE OFERENTE SET ${updateFields.join(', ')} WHERE id_oferente = ?`;
        
        await db.query(query, values);
        return await this.findById(id);
    }

    // elimar oferente
    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM OFERENTE WHERE id_oferente = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    //verificar existencia por ID de usuario
    static async existsByUserId(userId, excludeId = null) {
        let query = 'SELECT id_oferente FROM OFERENTE WHERE id_usuario = ?';
        let params = [userId];
        
        if (excludeId) {
            query += ' AND id_oferente != ?';
            params.push(excludeId);
        }
        
        const [oferentes] = await db.query(query, params);
        return oferentes.length > 0;
    }
}

module.exports = Oferente;