const express = require('express');
const cors = require('cors');
const app = express();

// Import routes
const usuariosRoutes = require('./routes/usuarios');
const oferentesRoutes = require('./routes/oferentes');
const serviciosRoutes = require('./routes/servicios');
const productosRoutes = require('./routes/productos');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'ARROYO SECO API running',
        version: '1.0.0',
        endpoints: {
            usuarios: '/api/usuarios',
            oferentes: '/api/oferentes',
            servicios: '/api/servicios',
            productos: '/api/productos' 
        }
    });
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/oferentes', oferentesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/productos', productosRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;