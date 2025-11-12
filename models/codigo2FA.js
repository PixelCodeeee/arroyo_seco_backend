const db = require('../config/db');

class Codigo2FA {
    // Generate random 6-digit code
    static generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Create new 2FA code
    static async create(userId) {
        const codigo = this.generateCode();
        const fecha_expiracion = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing unused codes for this user
        await db.query(
            'DELETE FROM CODIGO_2FA WHERE id_usuario = ? AND usado = FALSE',
            [userId]
        );

        // Insert new code
        await db.query(
            'INSERT INTO CODIGO_2FA (id_usuario, codigo, fecha_expiracion) VALUES (?, ?, ?)',
            [userId, codigo, fecha_expiracion]
        );

        return codigo;
    }

    // Verify code
    static async verify(userId, codigo) {
        const [results] = await db.query(
            `SELECT * FROM CODIGO_2FA 
             WHERE id_usuario = ? 
             AND codigo = ? 
             AND usado = FALSE 
             AND fecha_expiracion > NOW()`,
            [userId, codigo]
        );

        if (results.length === 0) {
            return false;
        }

        // Mark code as used
        await db.query(
            'UPDATE CODIGO_2FA SET usado = TRUE WHERE id = ?',
            [results[0].id]
        );

        return true;
    }

    // Clean expired codes (run periodically)
    static async cleanExpired() {
        await db.query('DELETE FROM CODIGO_2FA WHERE fecha_expiracion < NOW()');
    }
}

module.exports = Codigo2FA;