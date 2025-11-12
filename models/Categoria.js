// models/Categoria.js
const db = require('../config/db');

class Categoria {
  // Obtener todas las categorías
  static async findAll() {
    const query = `
      SELECT 
        id_categoria,
        nombre,
        tipo
      FROM CATEGORIA
      ORDER BY tipo, nombre
    `;
    
    const [categorias] = await db.query(query);
    return categorias;
  }

  // Obtener categorías por tipo
  static async findByTipo(tipo) {
    const query = `
      SELECT 
        id_categoria,
        nombre,
        tipo
      FROM CATEGORIA
      WHERE tipo = ?
      ORDER BY nombre
    `;
    
    const [categorias] = await db.query(query, [tipo]);
    return categorias;
  }

  // Obtener categoría por ID
  static async findById(id) {
    const query = `
      SELECT 
        c.id_categoria,
        c.nombre,
        c.tipo,
        COUNT(DISTINCT p.id_producto) as total_productos
      FROM CATEGORIA c
      LEFT JOIN PRODUCTO p ON c.id_categoria = p.id_categoria AND p.esta_disponible = TRUE
      WHERE c.id_categoria = ?
      GROUP BY c.id_categoria
    `;
    
    const [categorias] = await db.query(query, [id]);
    
    if (categorias.length === 0) {
      return null;
    }
    
    return categorias[0];
  }

  // Buscar categoría por nombre
  static async findByNombre(nombre) {
    const query = `
      SELECT 
        id_categoria,
        nombre,
        tipo
      FROM CATEGORIA
      WHERE nombre = ?
    `;
    
    const [categorias] = await db.query(query, [nombre]);
    
    if (categorias.length === 0) {
      return null;
    }
    
    return categorias[0];
  }

  // Crear nueva categoría
  static async create(categoriaData) {
    const { nombre, tipo } = categoriaData;
    
    // Verificar si ya existe una categoría con el mismo nombre
    const existente = await this.findByNombre(nombre);
    if (existente) {
      throw new Error('Ya existe una categoría con ese nombre');
    }
    
    const query = `
      INSERT INTO CATEGORIA (nombre, tipo)
      VALUES (?, ?)
    `;
    
    const [result] = await db.query(query, [nombre, tipo]);
    
    return result.insertId;
  }

  // Actualizar categoría
  static async update(id, updateData) {
    const { nombre, tipo } = updateData;
    
    const updates = [];
    const values = [];
    
    if (nombre !== undefined) {
      // Verificar que no exista otra categoría con el mismo nombre
      const query = 'SELECT id_categoria FROM CATEGORIA WHERE nombre = ? AND id_categoria != ?';
      const [existentes] = await db.query(query, [nombre, id]);
      
      if (existentes.length > 0) {
        throw new Error('Ya existe otra categoría con ese nombre');
      }
      
      updates.push('nombre = ?');
      values.push(nombre);
    }
    
    if (tipo !== undefined) {
      updates.push('tipo = ?');
      values.push(tipo);
    }
    
    if (updates.length === 0) {
      return false;
    }
    
    values.push(id);
    
    const updateQuery = `UPDATE CATEGORIA SET ${updates.join(', ')} WHERE id_categoria = ?`;
    const [result] = await db.query(updateQuery, values);
    
    return result.affectedRows > 0;
  }

  // Eliminar categoría
  static async delete(id) {
    // Verificar si hay productos asociados
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM PRODUCTO 
      WHERE id_categoria = ? AND esta_disponible = TRUE
    `;
    
    const [productos] = await db.query(checkQuery, [id]);
    
    if (productos[0].count > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${productos[0].count} productos asociados`);
    }
    
    const deleteQuery = 'DELETE FROM CATEGORIA WHERE id_categoria = ?';
    const [result] = await db.query(deleteQuery, [id]);
    
    return result.affectedRows > 0;
  }

  // Obtener estadísticas de categorías
  static async getEstadisticas() {
    const query = `
      SELECT 
        c.id_categoria,
        c.nombre,
        c.tipo,
        COUNT(DISTINCT p.id_producto) as total_productos,
        COALESCE(SUM(p.inventario), 0) as inventario_total,
        COALESCE(AVG(p.precio), 0) as precio_promedio
      FROM CATEGORIA c
      LEFT JOIN PRODUCTO p ON c.id_categoria = p.id_categoria AND p.esta_disponible = TRUE
      GROUP BY c.id_categoria
      ORDER BY c.tipo, c.nombre
    `;
    
    const [estadisticas] = await db.query(query);
    return estadisticas;
  }

  // Obtener productos de una categoría
  static async getProductosPorCategoria(id_categoria) {
    const query = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.precio,
        p.inventario,
        p.imagenes,
        o.nombre_negocio
      FROM PRODUCTO p
      INNER JOIN OFERENTE o ON p.id_oferente = o.id_oferente
      WHERE p.id_categoria = ? AND p.esta_disponible = TRUE
      ORDER BY p.nombre
    `;
    
    const [productos] = await db.query(query, [id_categoria]);
    
    return productos.map(p => ({
      ...p,
      imagenes: p.imagenes ? JSON.parse(p.imagenes) : []
    }));
  }
}

module.exports = Categoria;