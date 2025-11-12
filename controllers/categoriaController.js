// controllers/categoriaController.js
const Categoria = require('../models/Categoria');
const db = require('../config/db');

// Obtener todas las categorías
exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    
    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// Obtener categorías por tipo
exports.getCategoriasPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    
    // Validar tipo
    if (!['gastronomica', 'artesanal'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de categoría inválido. Debe ser "gastronomica" o "artesanal"'
      });
    }
    
    const categorias = await Categoria.findByTipo(tipo);
    
    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error al obtener categorías por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// Obtener categoría específica
exports.getCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);
    
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
};

// Crear nueva categoría (requiere autenticación de admin)
exports.crearCategoria = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { nombre, tipo } = req.body;
    
    // Validaciones
    if (!nombre || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y tipo son requeridos'
      });
    }
    
    if (!['gastronomica', 'artesanal'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de categoría inválido'
      });
    }
    
    await connection.beginTransaction();
    
    const id_categoria = await Categoria.create({ nombre, tipo });
    
    await connection.commit();
    
    // Obtener la categoría creada
    const nuevaCategoria = await Categoria.findById(id_categoria);
    
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: nuevaCategoria
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear categoría:', error);
    
    if (error.message.includes('Ya existe')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Actualizar categoría
exports.actualizarCategoria = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    const { nombre, tipo } = req.body;
    
    // Validar tipo si se proporciona
    if (tipo && !['gastronomica', 'artesanal'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de categoría inválido'
      });
    }
    
    await connection.beginTransaction();
    
    const actualizado = await Categoria.update(id, { nombre, tipo });
    
    if (!actualizado) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada o sin cambios'
      });
    }
    
    await connection.commit();
    
    // Obtener la categoría actualizada
    const categoriaActualizada = await Categoria.findById(id);
    
    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: categoriaActualizada
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar categoría:', error);
    
    if (error.message.includes('Ya existe')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Eliminar categoría
exports.eliminarCategoria = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    const eliminado = await Categoria.delete(id);
    
    if (!eliminado) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar categoría:', error);
    
    if (error.message.includes('productos asociados')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Obtener estadísticas de categorías
exports.getEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Categoria.getEstadisticas();
    
    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener productos de una categoría
exports.getProductosDeCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la categoría existe
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    const productos = await Categoria.getProductosPorCategoria(id);
    
    res.json({
      success: true,
      data: {
        categoria,
        productos
      }
    });
  } catch (error) {
    console.error('Error al obtener productos de categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};