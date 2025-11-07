// models/Producto.js
const db = require('../config/db');

class Producto {
  // Obtener productos por tipo de categoría
  static async findByTipo(tipo) {
    let query = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.precio,
        p.inventario,
        p.imagenes,
        p.esta_disponible,
        o.nombre_negocio,
        o.direccion,
        o.tipo as tipo_oferente,
        c.nombre as categoria_nombre,
        c.tipo as categoria_tipo
      FROM PRODUCTO p
      INNER JOIN OFERENTE o ON p.id_oferente = o.id_oferente
      LEFT JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
      WHERE p.esta_disponible = TRUE
    `;
    
    let params = [];
    
    if (tipo !== 'todos') {
      query += ' AND c.tipo = ?';
      params.push(tipo);
    }
    
    query += ' ORDER BY p.id_producto DESC';
    
    const [productos] = await db.query(query, params);
    
    // Parsear el campo JSON de imágenes
    return productos.map(p => ({
      ...p,
      imagenes: p.imagenes ? JSON.parse(p.imagenes) : []
    }));
  }

  // Obtener producto por ID con toda la información
  static async findById(id) {
    const query = `
      SELECT 
        p.*,
        o.nombre_negocio,
        o.direccion,
        o.tipo as tipo_oferente,
        o.horario_disponibilidad,
        u.nombre as nombre_oferente,
        u.telefono,
        c.nombre as categoria_nombre
      FROM PRODUCTO p
      INNER JOIN OFERENTE o ON p.id_oferente = o.id_oferente
      INNER JOIN USUARIO u ON o.id_usuario = u.id_usuario
      LEFT JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = ?
    `;
    
    const [productos] = await db.query(query, [id]);
    
    if (productos.length === 0) {
      return null;
    }
    
    return {
      ...productos[0],
      imagenes: productos[0].imagenes ? JSON.parse(productos[0].imagenes) : [],
      horario_disponibilidad: productos[0].horario_disponibilidad ? 
        JSON.parse(productos[0].horario_disponibilidad) : {}
    };
  }

  // Crear nuevo producto
  static async create(productoData) {
    const { 
      id_oferente,
      id_servicio,
      nombre, 
      descripcion, 
      precio, 
      inventario, 
      imagenes, 
      id_categoria
    } = productoData;
    
    const query = `
      INSERT INTO PRODUCTO 
      (id_oferente, id_servicio, nombre, descripcion, precio, inventario, imagenes, id_categoria, esta_disponible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `;
    
    const imagenesJSON = JSON.stringify(imagenes || []);
    
    const [result] = await db.query(query, [
      id_oferente,
      id_servicio || null,
      nombre,
      descripcion,
      precio,
      inventario || 0,
      imagenesJSON,
      id_categoria
    ]);
    
    return result.insertId;
  }

  // Actualizar producto
  static async update(id, updateData) {
    const { nombre, descripcion, precio, inventario, imagenes, esta_disponible } = updateData;
    
    const updates = [];
    const values = [];
    
    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(descripcion);
    }
    if (precio !== undefined) {
      updates.push('precio = ?');
      values.push(precio);
    }
    if (inventario !== undefined) {
      updates.push('inventario = ?');
      values.push(inventario);
    }
    if (imagenes !== undefined) {
      updates.push('imagenes = ?');
      values.push(JSON.stringify(imagenes));
    }
    if (esta_disponible !== undefined) {
      updates.push('esta_disponible = ?');
      values.push(esta_disponible);
    }
    
    if (updates.length === 0) {
      return false;
    }
    
    values.push(id);
    
    const query = `UPDATE PRODUCTO SET ${updates.join(', ')} WHERE id_producto = ?`;
    const [result] = await db.query(query, values);
    
    return result.affectedRows > 0;
  }

  // Eliminar producto (soft delete)
  static async delete(id) {
    const query = 'UPDATE PRODUCTO SET esta_disponible = FALSE WHERE id_producto = ?';
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  }

  // Actualizar inventario
  static async updateInventario(id, cantidad) {
    const query = 'UPDATE PRODUCTO SET inventario = inventario + ? WHERE id_producto = ?';
    const [result] = await db.query(query, [cantidad, id]);
    return result.affectedRows > 0;
  }

  // Verificar disponibilidad de stock
  static async checkStock(id, cantidadRequerida) {
    const query = 'SELECT inventario FROM PRODUCTO WHERE id_producto = ? AND esta_disponible = TRUE';
    const [productos] = await db.query(query, [id]);
    
    if (productos.length === 0) {
      return false;
    }
    
    return productos[0].inventario >= cantidadRequerida;
  }

  // Obtener productos por oferente
  static async findByOferente(id_oferente) {
    const query = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre
      FROM PRODUCTO p
      LEFT JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
      WHERE p.id_oferente = ?
      ORDER BY p.id_producto DESC
    `;
    
    const [productos] = await db.query(query, [id_oferente]);
    
    return productos.map(p => ({
      ...p,
      imagenes: p.imagenes ? JSON.parse(p.imagenes) : []
    }));
  }
}

module.exports = Producto;