import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";
import nodemailer from 'nodemailer';

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Usa el servicio de Gmail, que configura el host y el puerto automáticamente
  auth: {
    user: process.env.CORREO_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const RegistrarE = async (req, res) => {
  try {
    // Verificar si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors);
      return res.status(400).json({
        status: 400,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { id_actividad } = req.params;
    const { observacion } = req.body;
    const usuarioId = req.usuario; // Asumiendo que req.usuario tiene el identificador del usuario que está enviando la observación

    // Verificar si se proporcionó una observación
    if (!observacion) {
      return res.status(400).json({
        status: 400,
        message: "La observación es requerida.",
      });
    }

    console.log('Actualizando observación:', observacion, 'para id:', id_actividad);

    // Actualizar la observación en la tabla de actividad
    const [resultActividad] = await pool.query(
      `UPDATE actividad SET observacion = ? WHERE id_actividad = ?`,
      [observacion, id_actividad]
    );

    console.log('Resultado de la actualización:', resultActividad);

    if (resultActividad.affectedRows > 0) {
      // Obtener el nombre del usuario que está enviando la observación
      const [resultUsuario] = await pool.query(
        `SELECT nombre FROM usuarios WHERE identificacion = ?`,
        [usuarioId]
      );

      // Obtener detalles de la actividad y el email del administrador
      const [resultDetalles] = await pool.query(
        `SELECT a.nombre_actividad, u.correo AS admin_email, u.nombre AS nombre_administrador
         FROM actividad a
         INNER JOIN usuarios u ON a.admin_id = u.identificacion
         WHERE a.id_actividad = ?`,
        [id_actividad]
      );

      if (resultDetalles.length > 0 && resultUsuario.length > 0) {
        const { nombre_actividad, admin_email: adminEmail, nombre_administrador } = resultDetalles[0];
        const { nombre: nombre_usuario } = resultUsuario[0];

        // Enviar correo electrónico al administrador
        const mailOptions = {
          from: process.env.CORREO_USER,
          to: adminEmail,
          subject: 'Actualización de Observación en Actividad',
          text: `Hola ${nombre_administrador},\n\nTu empleado ${nombre_usuario} ha finalizado su asignación con la siguiente actividad:\n\nID de Actividad: ${id_actividad}\nNombre de Actividad: ${nombre_actividad}\nObservación: ${observacion}\n\nPara más información, verifica la aplicación CropLink.\n\nSaludos,\nEl equipo de CropLink`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error al enviar el correo:', error);
            return res.status(500).json({
              status: 500,
              message: 'No se pudo enviar el correo electrónico.',
            });
          } else {
            console.log('Correo enviado:', info.response);
            return res.status(200).json({
              status: 200,
              message: 'Se actualizó la observación en la actividad con éxito y se envió el correo al administrador.',
            });
          }
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: 'No se encontraron los detalles necesarios para enviar el correo.',
        });
      }
    } else {
      return res.status(403).json({
        status: 403,
        message: "No se pudo actualizar la observación en la Actividad",
      });
    }
  } catch (error) {
    console.error('Error al actualizar la observación:', error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Error en el sistema",
    });
  }
};





export const listarEmpleado = async (req, res) => {
  try {
    // Obtener la identificación del usuario autenticado
    const identificacion = req.usuario;

    // Obtener todas las asignaciones relacionadas con el empleado
    const [result] = await pool.query(
      `
        SELECT 
            u.identificacion,
            u.nombre,
            p.id_programacion,
            p.fecha_inicio,
            p.fecha_fin,
            l.nombre AS lote,
            v.nombre_variedad,
            a.id_actividad, 
            a.nombre_actividad,
            a.tiempo,
            a.observaciones,
            p.estado
        FROM 
            programacion p
        INNER JOIN 
            lotes l ON p.fk_id_lote = l.id_lote
        INNER JOIN 
            actividad a ON p.fk_id_actividad = a.id_actividad
        INNER JOIN 
            variedad v ON a.fk_id_variedad = v.id_variedad 
        INNER JOIN 
            usuarios u ON p.fk_identificacion = u.identificacion
        WHERE 
            u.identificacion = ?;
      `,
      [identificacion]
    );

    // Verificar si se encontraron resultados
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        status: 404,
        message: "No se encontró ninguna asignación para este empleado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error interno del servidor",
    });
  }
};

//

//para cambiar los estados y este va para los botones
export const Empleado = async (req, res) => {
  try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const { id_actividad } = req.params;

      // Verify if the activity exists
      const [oldActividad] = await pool.query("SELECT * FROM actividad WHERE id_actividad = ?", [id_actividad]);

      // Check if the activity was found
      if (oldActividad.length > 0) {
          // Determine the new state
          let nuevoEstado;
          switch (oldActividad[0].estado) {
              case 'activo':
                  nuevoEstado = 'proceso';
                  break;
              case 'proceso':
                  nuevoEstado = 'terminado';
                  break;
              case 'terminado':
                  nuevoEstado = 'terminado'; // No next state after terminado
                  break;
              default:
                  nuevoEstado = oldActividad[0].estado;
          }

          // Only update if the state is actually changing
          if (nuevoEstado !== oldActividad[0].estado) {
              // Start a transaction
              await pool.query("START TRANSACTION");

              // Update the state of the activity in the database
              const [resultActividad] = await pool.query(
                  `UPDATE actividad SET estado = ? WHERE id_actividad = ?`, [nuevoEstado, id_actividad]
              );

              // Update the state in the programacion table
              const [resultProgramacion] = await pool.query(
                  `UPDATE programacion SET estado = ? WHERE fk_id_actividad = ?`, [nuevoEstado, id_actividad]
              );

              // Commit transaction if both updates were successful
              if (resultActividad.affectedRows > 0 && resultProgramacion.affectedRows > 0) {
                  await pool.query("COMMIT");
                  res.status(200).json({
                      status: 200,
                      message: 'Estado de la actividad y de la programación actualizados con éxito',
                      nuevoEstado: nuevoEstado
                  });
              } else {
                  // Rollback transaction if any update failed
                  await pool.query("ROLLBACK");
                  res.status(404).json({
                      status: 404,
                      message: 'No se encontró la actividad o la programación para actualizar'
                  });
              }
          } else {
              res.status(200).json({
                  status: 200,
                  message: 'La actividad ya está en el estado finalizado',
                  nuevoEstado: nuevoEstado
              });
          }
      } else {
          // If the activity was not found, return 404
          res.status(404).json({
              status: 404,
              message: 'No se encontró la actividad'
          });
      }
  } catch (error) {
      // Rollback transaction in case of error
      await pool.query("ROLLBACK");
      // Return a 500 status with the error message
      res.status(500).json({
          status: 500,
          message: 'Error en el sistema: ' + error.message
      });
  }
};