require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const oferentesRoutes = require('./routes/oferentes');
const serviciosRoutes = require('./routes/servicios');
const productosRoutes = require('./routes/productos');
const reservasRoutes = require('./routes/reservas');
const paypalRoutes = require('./routes/paypal');
const pedidoRoutes = require('./routes/pedido');

// CORS Settings
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL // <-- Render frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint raíz
app.get('/', (req, res) => {
  res.json({
    message: 'ARROYO SECO API running',
    version: '1.0.0',
    endpoints: {
      paypal: '/api/paypal',
      usuarios: '/api/usuarios',
      oferentes: '/api/oferentes',
      servicios: '/api/servicios',
      productos: '/api/productos',
      reservas: '/api/reservas',
      pedidos: '/api/pedido'
    }
  });
});

// Routes
app.use('/api/paypal', paypalRoutes);
app.use('/api/pedido', pedidoRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/oferentes', oferentesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/reservas', reservasRoutes);

// Health check para Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

module.exports = app;
