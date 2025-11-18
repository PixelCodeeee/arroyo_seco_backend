require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Import SOLO las rutas, NO los controladores
const usuariosRoutes = require('./routes/usuarios');
const oferentesRoutes = require('./routes/oferentes');
const serviciosRoutes = require('./routes/servicios');
const productosRoutes = require('./routes/productos');
const reservasRoutes = require('./routes/reservas');
const paypalRoutes = require('./routes/paypal');
// Middleware
app.use(cors());
app.use(express.json());

// Routes
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
            reservas: '/api/reservas'
        }
    });
});

app.use('/api/paypal', paypalRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/oferentes', oferentesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/reservas', reservasRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;