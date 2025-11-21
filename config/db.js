const mysql = require('mysql2');

// Database configuration
const dbConfig = {
    host: process.env.MYSQL_ADDON_HOST || 'localhost',
    port: process.env.MYSQL_ADDON_PORT || 3306,
    user: process.env.MYSQL_ADDON_USER || 'root',
    password: process.env.MYSQL_ADDON_PASSWORD || 'AlphaPrime1.',
    database: process.env.MYSQL_ADDON_DB || 'arroyo_seco',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Add SSL for production (Clever Cloud requires it)
if (process.env.NODE_ENV === 'production' && process.env.MYSQL_ADDON_HOST) {
    dbConfig.ssl = {
        rejectUnauthorized: false // Clever Cloud uses self-signed certificates
    };
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Get promise-based connection
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        return;
    }
    
    const dbName = process.env.MYSQL_ADDON_DB || 'arroyo_seco';
    const host = process.env.MYSQL_ADDON_HOST || 'localhost';
    
    console.log(`✓ Connected to MySQL database: ${dbName} on ${host}`);
    connection.release();
});

module.exports = promisePool;