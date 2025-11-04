const db = require('../config/db');

class ServicioRestaurante {
    // crear nuevo servicio
    static async create(servicioData) {
        const { 
            id_oferente, 
            nombre, 
            descripcion, 
            rango_precio, 
            capacidad, 
            imagenes, 
            esta_disponible = true,
            id_categoria 
        } = servicioData;
        
        // convertir imagenes a JSON
        const imagenesJSON = imagenes && typeof imagenes === 'object' 
            ? JSON.stringify(imagenes) 
            : imagenes;
        
        const [result] = await db.query(
            `INSERT INTO SERVICIO_RESTAURANTE 
            (id_oferente, nombre, descripcion, rango_precio, capacidad, imagenes, esta_disponible, id_categoria) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_oferente, nombre, descripcion, rango_precio, capacidad, imagenesJSON, esta_disponible, id_categoria]
        );
        
        return await this.findById(result.insertId);
    }

    // encontrar todos los servicios
    static async findAll() {
        const [servicios] = await db.query(`
            SELECT 
                s.id_servicio,
                s.id_oferente,
                s.nombre,
                s.descripcion,
                s.rango_precio,
                s.capacidad,
                s.imagenes,
                s.esta_disponible,
                s.id_categoria,
                o.nombre_negocio,
                o.tipo as tipo_oferente,
                c.nombre as nombre_categoria
            FROM SERVICIO_RESTAURANTE s
            INNER JOIN OFERENTE o ON s.id_oferente = o.id_oferente
            LEFT JOIN CATEGORIA c ON s.id_categoria = c.id_categoria
            ORDER BY s.id_servicio DESC
        `);
        
        // json imagenes
        return servicios.map(servicio => ({
            ...servicio,
            imagenes: servicio.imagenes ? JSON.parse(servicio.imagenes) : null
        }));
    }

    // encontrar servicio por ID
    static async findById(id) {
        const [servicios] = await db.query(`
            SELECT 
                s.id_servicio,
                s.id_oferente,
                s.nombre,
                s.descripcion,
                s.rango_precio,
                s.capacidad,
                s.imagenes,
                s.esta_disponible,
                s.id_categoria,
                o.nombre_negocio,
                o.tipo as tipo_oferente,
                c.nombre as nombre_categoria
            FROM SERVICIO_RESTAURANTE s
            INNER JOIN OFERENTE o ON s.id_oferente = o.id_oferente
            LEFT JOIN CATEGORIA c ON s.id_categoria = c.id_categoria
            WHERE s.id_servicio = ?
        `, [id]);
        
        if (servicios.length === 0) return null;
        
        const servicio = servicios[0];
        servicio.imagenes = servicio.imagenes ? JSON.parse(servicio.imagenes) : null;
        
        return servicio;
    }

    // encontrar por id
    static async findByOfferenteId(oferenteId) {
        const [servicios] = await db.query(`
            SELECT 
                s.id_servicio,
                s.id_oferente,
                s.nombre,
                s.descripcion,
                s.rango_precio,
                s.capacidad,
                s.imagenes,
                s.esta_disponible,
                s.id_categoria,
                c.nombre as nombre_categoria
            FROM SERVICIO_RESTAURANTE s
            LEFT JOIN CATEGORIA c ON s.id_categoria = c.id_categoria
            WHERE s.id_oferente = ?
            ORDER BY s.id_servicio DESC
        `, [oferenteId]);
        
        return servicios.map(servicio => ({
            ...servicio,
            imagenes: servicio.imagenes ? JSON.parse(servicio.imagenes) : null
        }));
    }

    // actualizar servicio
    static async update(id, servicioData) {
        const { 
            nombre, 
            descripcion, 
            rango_precio, 
            capacidad, 
            imagenes, 
            esta_disponible,
            id_categoria 
        } = servicioData;
        
        let updateFields = [];
        let values = [];

        if (nombre) {
            updateFields.push('nombre = ?');
            values.push(nombre);
        }
        if (descripcion !== undefined) {
            updateFields.push('descripcion = ?');
            values.push(descripcion);
        }
        if (rango_precio !== undefined) {
            updateFields.push('rango_precio = ?');
            values.push(rango_precio);
        }
        if (capacidad !== undefined) {
            updateFields.push('capacidad = ?');
            values.push(capacidad);
        }
        if (imagenes !== undefined) {
            const imagenesJSON = imagenes && typeof imagenes === 'object' 
                ? JSON.stringify(imagenes) 
                : imagenes;
            updateFields.push('imagenes = ?');
            values.push(imagenesJSON);
        }
        if (typeof esta_disponible === 'boolean') {
            updateFields.push('esta_disponible = ?');
            values.push(esta_disponible);
        }
        if (id_categoria !== undefined) {
            updateFields.push('id_categoria = ?');
            values.push(id_categoria);
        }

        if (updateFields.length === 0) {
            return null;
        }

        values.push(id);
        const query = `UPDATE SERVICIO_RESTAURANTE SET ${updateFields.join(', ')} WHERE id_servicio = ?`;
        
        await db.query(query, values);
        return await this.findById(id);
    }

    // eliminar servicio
    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM SERVICIO_RESTAURANTE WHERE id_servicio = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getStats() {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN esta_disponible = 1 THEN 1 ELSE 0 END) as disponibles,
                SUM(CASE WHEN esta_disponible = 0 THEN 1 ELSE 0 END) as no_disponibles
            FROM SERVICIO_RESTAURANTE
        `);
        
        return stats[0];
    }
}

module.exports = ServicioRestaurante;