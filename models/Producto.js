// models/Producto.js
const db = require('../config/db');

class Producto {
  // -----------------------------------------------------------------
  // PUBLIC helpers (used by public endpoints)
  // -----------------------------------------------------------------
  static async findAllPublic() {
    const query = `
      SELECT 
        p.*,
        o.nombre_negocio,
        o.direccion,
        o.tipo AS tipo_oferente,
        c.nombre AS categoria_nombre,
        c.tipo  AS categoria_tipo
      FROM producto p
      INNER JOIN oferente o ON p.id_oferente = o.id_oferente
      LEFT  JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.esta_disponible = 1
      ORDER BY p.id_producto DESC
    `;

    const [rows] = await db.query(query);
    return rows.map(p => ({
      ...p,
      imagen: p.imagen ? JSON.parse(p.imagen) : []
    }));
  }

  static async findByIdPublic(id) {
    const query = `
      SELECT 
        p.*,
        o.nombre_negocio,
        o.direccion,
        o.tipo AS tipo_oferente,
        c.nombre AS categoria_nombre,
        c.tipo  AS categoria_tipo
      FROM producto p
      INNER JOIN oferente o ON p.id_oferente = o.id_oferente
      LEFT  JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = ? AND p.esta_disponible = 1
    `;

    const [rows] = await db.query(query, [id]);
    if (!rows.length) return null;

    const row = rows[0];
    return { ...row, imagen: row.imagen ? JSON.parse(row.imagen) : [] };
  }

  static async findByCategoriaTipo(tipo) {
    let sql = `
      SELECT 
        p.*,
        o.nombre_negocio,
        o.direccion,
        o.tipo AS tipo_oferente,
        c.nombre AS categoria_nombre,
        c.tipo  AS categoria_tipo
      FROM producto p
      INNER JOIN oferente o ON p.id_oferente = o.id_oferente
      LEFT  JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.esta_disponible = 1
    `;
    const params = [];

    if (tipo !== 'todos') {
      sql += ` AND c.tipo = ?`;
      params.push(tipo);
    }

    sql += ` ORDER BY p.id_producto DESC`;

    const [rows] = await db.query(sql, params);
    return rows.map(p => ({
      ...p,
      imagen: p.imagen ? JSON.parse(p.imagen) : []
    }));
  }

  // -----------------------------------------------------------------
  // OFERENTE helpers (private)
  // -----------------------------------------------------------------
  static async findByOferente(id_oferente) {
    const query = `
      SELECT p.*, c.nombre AS categoria_nombre, c.tipo AS categoria_tipo
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_oferente = ?
      ORDER BY p.id_producto DESC
    `;
    const [rows] = await db.query(query, [id_oferente]);
    return rows.map(p => ({
      ...p,
      imagen: p.imagen ? JSON.parse(p.imagen) : []
    }));
  }

  static async verifyOwnership(id_producto, id_oferente) {
    const [rows] = await db.query(
      `SELECT 1 FROM producto WHERE id_producto = ? AND id_oferente = ?`,
      [id_producto, id_oferente]
    );
    return rows.length > 0;
  }

  static async create({
    id_oferente,
    nombre,
    descripcion,
    precio,
    inventario = 0,
    imagen = [],
    id_categoria,
    esta_disponible = 1
  }) {
    const query = `
      INSERT INTO producto
        (id_oferente, nombre, descripcion, precio, inventario, imagen, id_categoria, esta_disponible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      id_oferente,
      nombre,
      descripcion,
      precio,
      inventario,
      JSON.stringify(imagen),
      id_categoria,
      esta_disponible
    ]);

    return result.insertId;
  }

  static async update(id_producto, updates) {
    const allowed = [
      'nombre',
      'descripcion',
      'precio',
      'inventario',
      'esta_disponible',
      'id_categoria'
    ];
    const sets = [];
    const values = [];

    allowed.forEach(col => {
      if (updates[col] !== undefined) {
        sets.push(`${col} = ?`);
        values.push(updates[col]);
      }
    });

    if (updates.imagen !== undefined) {
      sets.push(`imagen = ?`);
      values.push(JSON.stringify(updates.imagen));
    }

    if (!sets.length) return false;

    values.push(id_producto);
    const query = `UPDATE producto SET ${sets.join(', ')} WHERE id_producto = ?`;
    const [res] = await db.query(query, values);
    return res.affectedRows > 0;
  }

  static async softDelete(id_producto) {
    const [res] = await db.query(
      `UPDATE producto SET esta_disponible = 0 WHERE id_producto = ?`,
      [id_producto]
    );
    return res.affectedRows > 0;
  }

  static async adjustInventory(id_producto, cantidad) {
    const [res] = await db.query(
      `UPDATE producto SET inventario = inventario + ? WHERE id_producto = ?`,
      [cantidad, id_producto]
    );
    return res.affectedRows > 0;
  }

  static async checkStock(id_producto, qty = 1) {
    const [rows] = await db.query(
      `SELECT inventario FROM producto WHERE id_producto = ? AND esta_disponible = 1`,
      [id_producto]
    );
    if (!rows.length) return false;
    return rows[0].inventario >= qty;
  }
}

module.exports = Producto;