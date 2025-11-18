// controllers/productoController.js
const Producto = require('../models/Producto');

// ====================== PUBLIC ======================
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAllPublic();
    res.json({ success: true, productos });
  } catch (err) {
    console.error('getAllProductos error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.getProductosPorOferente = async (req, res) => {
  try {
    const { id_oferente } = req.params;
    const productos = await Producto.findByOferente(id_oferente);
    res.json({ success: true, productos });
  } catch (err) {
    console.error('getProductosPorOferente error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
// En productoController.js, en la sección PUBLIC

exports.getProductosPorOferente = async (req, res) => {
  try {
    const { id_oferente } = req.params;
    const productos = await Producto.findByOferente(id_oferente);
    res.json({ success: true, productos });
  } catch (err) {
    console.error('getProductosPorOferente error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdPublic(id);
    if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    res.json({ success: true, producto });
  } catch (err) {
    console.error('getProducto error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProductosPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params; // "gastronomica" | "artesanal" | "todos"
    const productos = await Producto.findByCategoriaTipo(tipo);
    res.json({ success: true, productos });
  } catch (err) {
    console.error('getProductosPorTipo error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.verificarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad = 1 } = req.query;
    const disponible = await Producto.checkStock(id, Number(cantidad));
    res.json({ success: true, disponible });
  } catch (err) {
    console.error('verificarStock error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ====================== OFERENTE (PRIVATE) ======================
exports.getMisProductos = async (req, res) => {
  try {
    const id_oferente = req.oferente.id_oferente;
    const productos = await Producto.findByOferente(id_oferente);
    res.json({ success: true, productos });
  } catch (err) {
    console.error('getMisProductos error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.crearProducto = async (req, res) => {
  try {
    const id_oferente = req.oferente.id_oferente;
    const {
      nombre,
      descripcion,
      precio,
      inventario = 0,
      imagen = [],
      id_categoria
    } = req.body;

    const id_producto = await Producto.create({
      id_oferente,
      nombre,
      descripcion,
      precio,
      inventario,
      imagen,
      id_categoria
    });

    res.status(201).json({ success: true, message: 'Producto creado', id_producto });
  } catch (err) {
    console.error('crearProducto error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const id_oferente = req.oferente.id_oferente;

    const isOwner = await Producto.verifyOwnership(id, id_oferente);
    if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });

    const updated = await Producto.update(id, req.body);
    if (!updated) return res.status(400).json({ success: false, message: 'Nada que actualizar' });

    res.json({ success: true, message: 'Producto actualizado' });
  } catch (err) {
    console.error('actualizarProducto error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const id_oferente = req.oferente.id_oferente;

    const isOwner = await Producto.verifyOwnership(id, id_oferente);
    if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });

    const deleted = await Producto.softDelete(id);
    res.json({ success: true, message: 'Producto eliminado (soft-delete)', deleted });
  } catch (err) {
    console.error('eliminarProducto error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.actualizarInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body; // can be + or -
    const id_oferente = req.oferente.id_oferente;

    const isOwner = await Producto.verifyOwnership(id, id_oferente);
    if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });

    const updated = await Producto.adjustInventory(id, Number(cantidad));
    res.json({ success: true, message: 'Inventario actualizado', updated });
  } catch (err) {
    console.error('actualizarInventario error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};