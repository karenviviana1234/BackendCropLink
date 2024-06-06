import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

export const listarEmpleado = async (req, res) => {
  try {
    // Obtener la identificación del usuario autenticados
    const identificacion = req.usuario;

    // Obtener todas las asignaciones relacionadas con el empleado
    const [result] = await pool.query(
      `
        SELECT 
            u.identificacion,
            u.nombre,
            p.fecha_inicio,
            p.fecha_fin,
            v.nombre_variedad,
            a.nombre_actividad,
            a.tiempo,
            a.observaciones,
            p.estado
        FROM 
            programacion p
        INNER JOIN 
            lotes l ON p.fk_id_lote = l.id_lote
        INNER JOIN 
            cultivo c ON c.fk_id_lote = c.id_cultivo
        INNER JOIN 
            variedad v ON c.fk_id_variedad = v.id_variedad
        INNER JOIN 
            actividad a ON p.fk_id_actividad = a.id_actividad
        INNER JOIN 
            usuarios u ON p.fk_identificacion = u.identificacion
        WHERE 
            u.identificacion = ?;
      `,
      [identificacion]
    );

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




/* // Controlador para mostrar actividades asignadas a un empleado
export const listarE = async (req, res) => {
    try {
        // Aquí deberías obtener el ID del empleado que ha iniciado sesión (puedes acceder a esto desde req.user o alguna otra fuente de autenticación)
        const empleadoId = req.user.id; // Esto es un ejemplo, puedes obtener el ID del empleado según cómo manejes la autenticación

        // Consulta para obtener las actividades asignadas al empleado
        const actividadesAsignadas = await Actividad.findAll({
            where: {
                // Condición para seleccionar las actividades asignadas al empleado específico
                // Aquí deberías tener una relación en tu base de datos entre las actividades y los empleados para poder filtrarlas correctamente
                fk_id_empleado: empleadoId // Esto es un ejemplo, ajusta según tu modelo de datos
            },
            include: [{ model: Variedad, as: 'variedad' }] // Incluye la variedad asociada a cada actividad
        });

        // Si se encontraron actividades asignadas, las devolvemos como respuesta
        if (actividadesAsignadas) {
            return res.status(200).json({ actividades: actividadesAsignadas });
        } else {
            return res.status(404).json({ message: 'No se encontraron actividades asignadas.' });
        }
    } catch (error) {
        console.error('Error al obtener actividades asignadas:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
 */
// este sirve, solo que lo comente por si las moscas

export const RegistrarE = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const { id } = req.params;
    const { observacion } = req.body;

    // Verificar si se proporcionó una observación
    if (!observacion) {
      return res.status(400).json({
        status: 400,
        message: "La observación es requerida.",
      });
    }

    // Actualizar la observación en la tabla de actividad
    const nuevoEstado = observacion; // o el nombre del campo correspondiente en req.body
    const [resultActividad] = await pool.query(
      `UPDATE actividad SET observacion = ? WHERE id_actividad = ?`,
      [nuevoEstado, id]
    );

    if (resultActividad.affectedRows > 0) {
      return res.status(200).json({
        status: 200,
        message: "Se actualizó la observación en la actividad con éxito",
      });
    } else {
      return res.status(403).json({
        status: 403,
        message: "No se pudo actualizar la observación en la actividad",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message || "Error en el sistema",
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