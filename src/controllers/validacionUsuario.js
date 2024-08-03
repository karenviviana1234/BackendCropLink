import { pool } from "../database/conexion.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const tokenPassword = async (req, res) => {
    try {
        const { correo } = req.body;
        const sql = `SELECT * FROM usuarios WHERE correo = ?`;
        const [user] = await pool.query(sql, [correo]);

        if (user.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const token = jwt.sign({ identificacion: user[0].identificacion }, "estemensajedebeserlargoyseguro", { expiresIn: "2h" });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.CORREO_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: process.env.CORREO_USER,
            to: user[0].correo,
            subject: "Restablecer Contraseña Crop Link",
            html: `
                <p>Estimado Usuario,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Para proceder, por favor haz clic en el botón a continuación:</p>
                <a href="http://localhost:5173/reset-password?token=${token}" style="background-color: #006000; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Restablecer Contraseña</a>
                <p>Si no has solicitado un cambio de contraseña, puedes ignorar este correo con seguridad.</p>
                <p>Gracias,<br>El equipo de Crop Link</p>
                <img src="cid:senaLogo" alt="SENA" style="width: 100px; height: auto;">
            `,
            attachments: [{
                filename: 'logoSena.jpg',
                path: './public/logoSena.png',
                cid: 'senaLogo'
            }]
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Correo enviado Exitosamente" });

    } catch (error) {
        res.status(500).json({ message: "No se pudo enviar el Correo", error: error.message });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, "estemensajedebeserlargoyseguro");
        const userId = decoded.identificacion; 

        // Consultar el usuario por su ID
        const sql = "SELECT * FROM usuarios WHERE identificacion = ?";
        const [usuario] = await pool.query(sql, [userId]);

        if (usuario.length === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sqlUpdate = "UPDATE usuarios SET password = ? WHERE identificacion = ?";
        const [actualizar] = await pool.query(sqlUpdate, [hashedPassword, userId]);

        if (actualizar.affectedRows > 0) {
            return res.status(200).json({ message: "Contraseña actualizada" });
        } else {
            return res.status(400).json({ message: "No se pudo actualizar la contraseña" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al restablecer la contraseña" });
    }
};
