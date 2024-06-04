import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

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
                p.fecha_inicio,
                p.fecha_fin,
                v.nombre_variedad,
                t.nombre_actividad,
                t.tiempo,
                t.observaciones
            FROM 
                programacion p
            INNER JOIN 
                cultivo c ON p.fk_id_cultivo = c.id_cultivo
            INNER JOIN 
                variedad v ON c.fk_id_variedad = v.id_variedad
            INNER JOIN 
                actividad t ON p.fk_id_actividad = t.id_actividad
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
export const Empleado = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Obtener la identificación del usuario autenticado
    const identificacion = req.usuario;

    // Verificar si la actividad existe en la tabla programacion y está asignada al usuario
    const [programacionExist] = await pool.query(
      "SELECT * FROM programacion WHERE fk_id_actividad = ? AND fk_identificacion = ?",
      [id, identificacion]
    );

    // Verificar si se encontró la actividad asignada al usuario en la tabla programacion
    if (programacionExist.length > 0) {
      // Verificar si la actividad existe en la tabla actividad
      const [oldActividad] = await pool.query(
        "SELECT * FROM actividad WHERE id_actividad = ?",
        [id]
      );

      if (oldActividad.length > 0) {
        // Determinar el nuevo estado
        let nuevoEstado;
        switch (oldActividad[0].estado) {
          case "activo":
            nuevoEstado = "proceso";
            break;
          case "proceso":
            nuevoEstado = "terminado";
            break;
          case "terminado":
            nuevoEstado = "terminado"; // No hay siguiente estado después de terminado
            break;
          default:
            nuevoEstado = oldActividad[0].estado;
        }

        // Actualizar el estado de la actividad en la base de datos
        const [resultActividad] = await pool.query(
          "UPDATE actividad SET estado = ? WHERE id_actividad = ?",
          [nuevoEstado, id]
        );

        // Actualizar el estado en la tabla programacion
        const [resultProgramacion] = await pool.query(
          "UPDATE programacion SET estado = ? WHERE fk_id_actividad = ?",
          [nuevoEstado, id]
        );

        // Verificar si se afectaron filas en ambas tablas
        if (
          resultActividad.affectedRows > 0 &&
          resultProgramacion.affectedRows > 0
        ) {
          // Si se actualizó correctamente en ambas tablas, enviar una respuesta con estado 200
          res.status(200).json({
            status: 200,
            message:
              "Estado de la actividad y de la programación actualizados con éxito",
            nuevoEstado: nuevoEstado,
          });
        } else {
          // Si no se encontró el registro para actualizar en alguna de las tablas, enviar una respuesta con estado 404
          res.status(404).json({
            status: 404,
            message:
              "No se encontró la actividad o la programación para actualizar",
          });
        }
      } else {
        // Si no se encontró la actividad en la tabla actividad, enviar una respuesta con estado 404
        res.status(404).json({
          status: 404,
          message: "No se encontró la actividad",
        });
      }
    } else {
      // Si no se encontró la actividad asignada al usuario en la tabla programacion, enviar una respuesta con estado 404
      res.status(404).json({
        status: 404,
        message:
          "No se encontró la actividad asignada al usuario en la tabla programación",
      });
    }
  } catch (error) {
    // Si hay algún error en el proceso, enviar una respuesta con estado 500
    res.status(500).json({
      status: 500,
      message: "Error en el sistema: " + error.message,
    });
  }
};

/* //para cambiar los estados y este va para los botones
export const Empleado = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        // Verificar si la actividad existe
        const [oldActividad] = await pool.query("SELECT * FROM actividad WHERE id_actividad = ?", [id]);

        // Verificar si se encontró la actividad
        if (oldActividad.length > 0) {
            // Determinar el nuevo estado
            let nuevoEstado;
            switch (oldActividad[0].estado) {
                case 'activo':
                    nuevoEstado = 'proceso';
                    break;
                case 'proceso':
                    nuevoEstado = 'terminado';
                    break;
                case 'terminado':
                    nuevoEstado = 'terminado'; // No hay siguiente estado después de terminado
                    break;
                default:
                    nuevoEstado = oldActividad[0].estado;
            }

            // Actualizar el estado de la actividad en la base de datos
            const [resultActividad] = await pool.query(
                `UPDATE actividad SET estado = ? WHERE id_actividad = ?`, [nuevoEstado, id]
            );

            // Actualizar el estado en la tabla programacion
            const [resultProgramacion] = await pool.query(
                `UPDATE programacion SET estado = ? WHERE fk_id_actividad = ?`, [nuevoEstado, id]
            );

            // Verificar si se afectaron filas en ambas tablas
            if (resultActividad.affectedRows > 0 && resultProgramacion.affectedRows > 0) {
                // Si se actualizó correctamente en ambas tablas, enviar una respuesta con estado 200
                res.status(200).json({
                    status: 200,
                    message: 'Estado de la actividad y de la programación actualizados con éxito',
                    nuevoEstado: nuevoEstado
                });
            } else {
                // Si no se encontró el registro para actualizar en alguna de las tablas, enviar una respuesta con estado 404
                res.status(404).json({
                    status: 404,
                    message: 'No se encontró la actividad o la programación para actualizar'
                });
            }
        } else {
            // Si no se encontró la actividad, enviar una respuesta con estado 404
            res.status(404).json({
                status: 404,
                message: 'No se encontró la actividad'
            });
        }
    } catch (error) {
        // Si hay algún error en el proceso, enviar una respuesta con estado 500
        res.status(500).json({
            status: 500,
            message: 'Error en el sistema: ' + error.message
        });
    }
};
  */
