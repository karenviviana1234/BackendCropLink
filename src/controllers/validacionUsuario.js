import { pool } from "../database/conexion.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import dotenv from 'dotenv'

dotenv.config({ path: './src/env/.env' });

const tokenPassword = async (peticion, respuesta) => {
    try {
        const { correo } = peticion.body;
        const sql = "SELECT * FROM usuarios WHERE correo = ?"
        const [user] = await pool.query(sql, correo);
        if (user.length > 0) {
            console.log(user[0].identificacion);
        } else {
            return respuesta.status(404).json({
                "message": "Usuario no encontrado"
            });
        }

        const token = jwt.sign({ identificacion: user[0].identificacion }, process.env.AUT_SECRET, { expiresIn: process.env.AUT_EXPIRE });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "karenvivianadiazguevara@gmail.com",
                pass: process.env.CORREO_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Recuperar contraseña",
        //     html: `
        //     <p>Hola,</p>
        //     <p>Da click en el siguiente botón para restablecer tu contraseña:</p>
        //     <a href="http://localhost:5173/restablecer?token=${token}" 
        //     style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; 
        //     background-color: #38a800; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
        //     <p>Si no solicitaste un cambio de contraseña, ignora este correo.</p>
        //   <img src="cid:imagenCorreo" alt="Descripción de la imagen" style="max-width: 200px;" />
           
        //     `,
        //     attachments: [
        //         {
        //             filename: 'sena.png',
        //             path: './src/public/sena.png',
        //             cid: 'imagenCorreo' // cid debe coincidir con el src en el contenido HTML
        //         }
        //     ]
             text: `Hola, da click en el siguiente enlace para restablecer la contraseña: 
            http://localhost:5173/restablecer?token=${token}`
            //text: ` token= ${token}`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return respuesta.status(500).json({
                    "message": "No se pudo enviar el correo"
                })
            }
            respuesta.send({
                "message": "correo enviado"
            })
        })
    } catch (error) {
        respuesta.status(500)
        respuesta.send(error.message)
    }
}

const resetPassword = async (peticion, respuesta) => {
    try {
        const { token, password } = peticion.body;

        const decoded = jwt.verify(token, process.env.SECRET);
        const user = decoded.identificacion

        const sql = "SELECT * FROM usuarios WHERE identificacion = ?"
        const [usuario] = await pool.query(sql, user)

        if (!usuario) {
            return respuesta.status(404).json({
                "message": "Usuario no encontrado"
            })
        }

        // Encriptar la nueva contraseña antes de actualizarla
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        const sqlUpdate = "UPDATE usuarios SET password = ? WHERE identificacion = ?";
        const [actualizar] = await pool.query(sqlUpdate, [hashedPassword, user]);

        if (actualizar.affectedRows > 0) {
            return respuesta.status(200).json({
                "message": "Contraseña actualizada"
            })
        }
    } catch (error) {
        respuesta.status(500);
        respuesta.send(error.message);
    }
}

export const contraseña = {
    tokenPassword,
    resetPassword
}
