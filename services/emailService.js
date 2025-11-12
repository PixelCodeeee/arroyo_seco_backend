const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Verify connection on startup
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Email configuration error:', error);
            } else {
                console.log('✅ Email server ready to send messages');
            }
        });
    }

    async send2FACode(email, code, userName) {
        const mailOptions = {
            from: `"Arroyo Seco" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Código de verificación - Arroyo Seco',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Verificación de dos factores</h2>
                    <p>Hola ${userName},</p>
                    <p>Tu código de verificación es:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${code}</h1>
                    </div>
                    <p>Este código expirará en 10 minutos.</p>
                    <p>Si no solicitaste este código, por favor ignora este correo.</p>
                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                    <p style="color: #6c757d; font-size: 12px;">Arroyo Seco - Sistema de autenticación</p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ 2FA code sent to:', email);
            console.log('Message ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error sending email:', error);
            throw new Error('Error al enviar el código de verificación');
        }
    }
}

module.exports = new EmailService();