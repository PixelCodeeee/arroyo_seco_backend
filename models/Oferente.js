const db = require('../config/db');

class Oferente {
    // ===== CREATE =====
    static async create(oferenteData) {
        const { id_usuario, nombre_negocio, direccion, tipo, horario_disponibilidad } = oferenteData;

        const tiposValidos = ['restaurante', 'artesanal'];
        if (!tiposValidos.includes(tipo)) {
            throw new Error('Tipo debe ser "restaurante" o "artesanal"');
        }

        // Guardamos como texto plano
        const horarioTexto = horario_disponibilidad || null;

        const [result] = await db.query(
            'INSERT INTO oferente (id_usuario, nombre_negocio, direccion, tipo, horario_disponibilidad) VALUES (?, ?, ?, ?, ?)',
            [id_usuario, nombre_negocio, direccion || null, tipo, horarioTexto]
        );

        return await this.findById(result.insertId);
    }

    // ===== FINDALL =====
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
            FROM oferente o
            INNER JOIN usuario u ON o.id_usuario = u.id_usuario
            ORDER BY o.id_oferente DESC
        `);

        // NO hacemos JSON.parse → es texto plano
        return oferentes.map(oferente => ({
            ...oferente,
            horario_disponibilidad: oferente.horario_disponibilidad || null
        }));
    }

    // ===== FINDBYID =====
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT 
                o.id_oferente,
                o.id_usuario,
                o.nombre_negocio,
                o.direccion,
                o.tipo,
                o.horario_disponibilidad,
                u.nombre as nombre_usuario,
                u.correo as correo_usuario
            FROM oferente o
            INNER JOIN usuario u ON o.id_usuario = u.id_usuario
            WHERE o.id_oferente = ?
        `, [id]);

        if (rows.length === 0) return null;

        const oferente = rows[0];
        oferente.horario_disponibilidad = oferente.horario_disponibilidad || null;
        return oferente;
    }

    // ===== FINDBYUSERID =====
    static async findByUserId(userId) {
        const [rows] = await db.query(`
            SELECT 
                o.id_oferente,
                o.id_usuario,
                o.nombre_negocio,
                o.direccion,
                o.tipo,
                o.horario_disponibilidad
            FROM oferente o
            WHERE o.id_usuario = ?
        `, [userId]);

        if (rows.length === 0) return null;

        const oferente = rows[0];
        oferente.horario_disponibilidad = oferente.horario_disponibilidad || null;
        return oferente;
    }

    // ===== UPDATE =====
    static async update(id, oferenteData) {
        const { nombre_negocio, direccion, tipo, horario_disponibilidad } = oferenteData;

        let updateFields = [];
        let values = [];

        if (nombre_negocio !== undefined) {
            updateFields.push('nombre_negocio = ?');
            values.push(nombre_negocio);
        }
        if (direccion !== undefined) {
            updateFields.push('direccion = ?');
            values.push(direccion);
        }
        if (tipo !== undefined) {
            const tiposValidos = ['restaurante', 'artesanal'];
            if (!tiposValidos.includes(tipo)) {
                throw new Error('Tipo debe ser "restaurante" o "artesanal"');
            }
            updateFields.push('tipo = ?');
            values.push(tipo);
        }
        if (horario_disponibilidad !== undefined) {
            updateFields.push('horario_disponibilidad = ?');
            values.push(horario_disponibilidad || null); // ← texto plano
        }

        if (updateFields.length === 0) return null;

        values.push(id);
        const query = `UPDATE oferente SET ${updateFields.join(', ')} WHERE id_oferente = ?`;

        await db.query(query, values);
        return await this.findById(id);
    }

    // ===== DELETE =====
    static async delete(id) {
        const [result] = await db.query('DELETE FROM oferente WHERE id_oferente = ?', [id]);
        return result.affectedRows > 0;
    }

    // ===== EXISTS BY USER ID =====
    static async existsByUserId(userId, excludeId = null) {
        let query = 'SELECT id_oferente FROM oferente WHERE id_usuario = ?';
        let params = [userId];

        if (excludeId) {
            query += ' AND id_oferente != ?';
            params.push(excludeId);
        }

        const [rows] = await db.query(query, params);
        return rows.length > 0;
    }
}

module.exports = Oferente;