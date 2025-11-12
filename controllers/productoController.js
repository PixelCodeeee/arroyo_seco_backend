// controllers/productoController.js
const Producto = require('../models/Producto');
const db = require('../config/db');

// =====================================================
// MÉTODOS PÚBLICOS (MARKETPLACE)
// =====================================================

// Obtener todos los productos (para admin o público)
exports.getAllProductos = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.precio,
        p.inventario,
        p.imagenes,
        p.esta_disponible,
        p.id_categoria,
        p.id_oferente,
        o.nombre_negocio,
        o.direccion,
        o.tipo as tipo_oferente,
        c.nombre as categoria_nombre,
        c.tipo as categoria_tipo
      FROM PRODUCTO p
      INNER JOIN OFERENTE o ON p.id_oferente = o.id_oferente
      LEFT JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
      ORDER BY p.id_producto DESC
    `;
    
    const [productos] = await db.query(query);
    
    const productosFormateados = productos.map(p => ({
      ...p,
      imagenes: p.imagenes ? JSON.parse(p.imagenes) : []
    }));
    
    res.json({
      success: true,
      productos: productosFormateados
    });
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// Obtener productos por categoría (gastronomica, artesanal o todos)
exports.getProductosPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    const productos = await Producto.findByTipo(tipo);
    
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// Obtener producto específico
exports.getProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findById(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

// Obtener servicios de restaurante
exports.getServiciosRestaurante = async (req, res) => {
  try {
    const query = `
      SELECT 
        sr.id_servicio,
        sr.nombre,
        sr.descripcion,
        sr.rango_precio,
        sr.capacidad,
        sr.imagenes,
        sr.esta_disponible,
        o.nombre_negocio,
        o.direccion,
        c.nombre as categoria_nombre
      FROM SERVICIO_RESTAURANTE sr
      INNER JOIN OFERENTE o ON sr.id_oferente = o.id_oferente
      LEFT JOIN CATEGORIA c ON sr.id_categoria = c.id_categoria
      WHERE sr.esta_disponible = TRUE AND o.tipo = 'restaurante'
      ORDER BY sr.id_servicio DESC
    `;
    
    const [servicios] = await db.query(query);
    
    const serviciosFormateados = servicios.map(s => ({
      ...s,
      imagenes: s.imagenes ? JSON.parse(s.imagenes) : []
    }));
    
    res.json({
      success: true,
      data: serviciosFormateados
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
};

// Verificar disponibilidad de stock
exports.verificarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad = 1 } = req.query;
    
    const disponible = await Producto.checkStock(id, parseInt(cantidad));
    
    res.json({
      success: true,
      disponible
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar stock',
      error: error.message
    });
  }
};

// =====================================================
// MÉTODOS PROTEGIDOS (REQUIEREN AUTENTICACIÓN)
// =====================================================

// Obtener productos del oferente autenticado
exports.getMisProductos = async (req, res) => {
  try {
    // req.oferente viene del middleware de autenticación
    const id_oferente = req.oferente.id_oferente;
    
    const query = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre,
        c.tipo as categoria_tipo
      FROM PRODUCTO p
      LEFT JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
      WHERE p.id_oferente = ?
      ORDER BY p.id_producto DESC
    `;
    
    const [productos] = await db.query(query, [id_oferente]);
    
    const productosFormateados = productos.map(p => ({
      ...p,
      imagenes: p.imagenes ? JSON.parse(p.imagenes) : []
    }));
    
    res.json({
      success: true,
      data: productosFormateados
    });
  } catch (error) {
    console.error('Error al obtener mis productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus productos',
      error: error.message
    });
  }
};

// Crear nuevo producto
exports.crearProducto = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const {
      nombre,
      descripcion,
      precio,
      inventario,
      imagenes,
      id_categoria,
      id_servicio
    } = req.body;
    
    // Validaciones básicas
    if (!nombre || nombre.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del producto debe tener al menos 3 caracteres'
      });
    }
    
    if (!precio || precio <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser mayor a 0'
      });
    }
    
    if (inventario && inventario < 0) {
      return res.status(400).json({
        success: false,
        message: 'El inventario no puede ser negativo'
      });
    }
    
    await connection.beginTransaction();
    
    const productoData = {
      id_oferente: req.oferente.id_oferente,
      nombre,
      descripcion,
      precio,
      inventario: inventario || 0,
      imagenes: imagenes || [],
      id_categoria,
      id_servicio: id_servicio || null
    };
    
    const id_producto = await Producto.create(productoData);
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { id_producto }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Actualizar producto
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const id_oferente = req.oferente.id_oferente;
    
    // Verificar que el producto pertenece al oferente
    const query = 'SELECT id_oferente FROM PRODUCTO WHERE id_producto = ?';
    const [productos] = await db.query(query, [id]);
    
    if (productos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    if (productos[0].id_oferente !== id_oferente) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este producto'
      });
    }
    
    // Validaciones
    const { precio, inventario } = req.body;
    
    if (precio !== undefined && precio <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser mayor a 0'
      });
    }
    
    if (inventario !== undefined && inventario < 0) {
      return res.status(400).json({
        success: false,
        message: 'El inventario no puede ser negativo'
      });
    }
    
    const actualizado = await Producto.update(id, req.body);
    
    if (!actualizado) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el producto'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// Eliminar producto (soft delete)
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const id_oferente = req.oferente.id_oferente;
    
    // Verificar que el producto pertenece al oferente
    const query = 'SELECT id_oferente FROM PRODUCTO WHERE id_producto = ?';
    const [productos] = await db.query(query, [id]);
    
    if (productos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    if (productos[0].id_oferente !== id_oferente) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este producto'
      });
    }
    
    const eliminado = await Producto.delete(id);
    
    if (!eliminado) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar el producto'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// Actualizar inventario
exports.actualizarInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    const id_oferente = req.oferente.id_oferente;
    
    if (!cantidad || isNaN(cantidad)) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser un número válido'
      });
    }
    
    // Verificar que el producto pertenece al oferente
    const query = 'SELECT id_oferente, inventario FROM PRODUCTO WHERE id_producto = ?';
    const [productos] = await db.query(query, [id]);
    
    if (productos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    if (productos[0].id_oferente !== id_oferente) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar el inventario de este producto'
      });
    }
    
    const nuevoInventario = productos[0].inventario + parseInt(cantidad);
    
    if (nuevoInventario < 0) {
      return res.status(400).json({
        success: false,
        message: 'El inventario no puede ser negativo'
      });
    }
    
    const actualizado = await Producto.updateInventario(id, cantidad);
    
    if (!actualizado) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el inventario'
      });
    }
    
    res.json({
      success: true,
      message: 'Inventario actualizado exitosamente',
      data: {
        nuevo_inventario: nuevoInventario
      }
    });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar inventario',
      error: error.message
    });
  }
};