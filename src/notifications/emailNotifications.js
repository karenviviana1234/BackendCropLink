import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes usar otro servicio de correo si prefieres
    auth: {
        user: process.env.CORREO_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendNotificationToEmployee = async (to, message) => {
    const mailOptions = {
        from: process.env.CORREO_USER,
        to,
        subject: 'Notificación de Programación de Actividad',
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo electrónico enviado a:', to);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};
