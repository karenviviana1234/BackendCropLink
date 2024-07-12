import { pool } from "../database/conexion.js";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.CORREO_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordByEmail = async (req, res) => {
  try {
    const { correo } = req.body;
    const [rows] = await pool.query("SELECT password FROM usuarios WHERE correo = ?", [correo]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const password = rows[0].password;

    await transporter.sendMail({
      to: correo,
      from: process.env.CORREO_USER,
      subject: 'Recuperación de Contraseña',
      text: `Tu contraseña es: ${password}`
    });

    res.status(200).json({ message: 'Se ha enviado un correo con tu contraseña.' });

  } catch (error) {
    console.error("Error al enviar el correo de recuperación de contraseña:", error);
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};
