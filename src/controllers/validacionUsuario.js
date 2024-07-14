import { pool } from "../database/conexion.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const tokenPassword = async (req, res) => {
    try {
        const { correo } = req.body;
        const sql = `SELECT * FROM usuarios WHERE correo = '${correo}'`;
        const [user] = await pool.query(sql);
        
        if (user.length > 0) {
            console.log(user[0].identificacion);
        } else {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const token = jwt.sign({ identificacion: user[0].identificacion }, "estemensajedebeserlargoyseguro", { expiresIn: "2h" });
        console.log(token);
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "karenvivianadiazguevara@gmail.com",
                pass: "avzz nmrt wvhh kbma" 
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verifica si el correo del usuario está definido y no es una cadena vacía
        if (!user[0].correo) {
            return res.status(400).json({ message: "Correo del usuario no definido" });
        }

        const mailOptions = {
            from: "karenvivianadiazguevara@gmail.com",
            to: user[0].correo,
            subject: "Restablecer Contraseña SubCoffee",
            html: `
                <p>Querido Usuario,</p>
                <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
                <a href="http://localhost:5173/reset-password?token=${token}" style="background-color: #39A900; color: white;
                padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Restablecer Contraseña</a>
                <p>Si no solicitaste un cambio de contraseña, por favor ignora este correo.</p>
                <p>Saludos,<br>El equipo de SubCoffee</p>
                <br>
                <img src="cid:senaLogo" alt="SENA" style="width: 100px; height: auto;">
            `,
            attachments: [{
                filename: 'bebescabras.jpg',
                // path: '../src/assets/bebescabras.jpg',
                cid: 'senaLogo'
            }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error al enviar el correo:', error);
                return res.status(500).json({ message: "No se pudo enviar el Correo", error: error.message });
            }
            res.send({
                message: "Correo enviado Exitosamente"
            });
        });
    } catch (error) {
        res.status(500);
        res.send(error.message);
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
        console.error(error);
        res.status(500).json({ message: "Error al restablecer la contraseña" });
    }
};
