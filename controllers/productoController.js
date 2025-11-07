// controllers/productoController.js
const Producto = require('../models/Producto');
const db = require('../config/db');

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

// Obtener servicios de restaurante (para la página de Gastronomía)
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

// Crear producto (requiere autenticación del oferente)
exports.crearProducto = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const productoData = {
      ...req.body,
      id_oferente: req.user.id_oferente // Del middleware de auth
    };
    
    await connection.beginTransaction();
    
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
    const actualizado = await Producto.update(id, req.body);
    
    if (!actualizado) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado o sin cambios'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
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
    const eliminado = await Producto.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// Verificar disponibilidad de stock
exports.verificarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.query;
    
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