import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";
import { sendNotificationToEmployee } from '../notifications/emailNotifications.js'; // Asegúrate de tener esta función definida en emailNotifications.js
import cron from 'node-cron';

// Cron job para enviar recordatorios a las 8:15 PM cada noche
cron.schedule('15 20 * * *', async () => {
    try {
        // Obtener la fecha de mañana
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];

        // Obtener la hora actual para el log
        const currentTime = new Date().toISOString();

        // Imprimir en consola la hora y fecha del recordatorio
        console.log(`Recordatorio generado en: ${currentTime}`);
        console.log(`Se enviarán recordatorios para actividades que terminan el ${formattedDate}`);

        // Seleccionar actividades que terminan mañana
        const [activities] = await pool.query(
            "SELECT fk_identificacion, fk_id_actividad, fecha_fin FROM programacion WHERE fecha_fin = ?",
            [formattedDate]
        );

        // Imprimir cuántas actividades se encontraron
        console.log(`Se encontraron ${activities.length} actividades que terminan el ${formattedDate}`);

        // Iterar sobre cada actividad encontrada
        for (const activity of activities) {
            // Obtener el correo del usuario asociado a la actividad
            const [usuarios] = await pool.query("SELECT correo FROM usuarios WHERE identificacion = ?", [activity.fk_identificacion]);
            if (usuarios.length > 0) {
                // Crear el mensaje del recordatorio
                const message = `Recordatorio: la actividad ${activity.fk_id_actividad} termina mañana.`;

                // Imprimir en consola el mensaje que se enviará
                console.log(`Enviando recordatorio a ${usuarios[0].correo}: ${message}`);

                // Enviar recordatorio por correo electrónico
                sendNotificationToEmployee(usuarios[0].correo, message);

                // Imprimir en consola la fecha y hora del recordatorio
                console.log(`Correo de recordatorio enviado a ${usuarios[0].correo} a las ${new Date().toISOString()}`);
            }
        }
    } catch (error) {
        console.error('Error al enviar recordatorios:', error);
    }
});

export const registrarProgramacion = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        const {
            fecha_inicio,
            fecha_fin,
            fk_identificacion,
            fk_id_actividad,
            fk_id_lote,
            estado
        } = req.body;

        const adminId = req.usuario;

        if (!estado) {
            return res.status(400).json({
                status: 400,
                message: "El campo 'estado' es obligatorio"
            });
        }

        const [usuarioExist] = await pool.query(
            "SELECT * FROM usuarios WHERE identificacion = ? AND admin_id = ?", 
            [fk_identificacion, adminId]
        );
        if (usuarioExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "El usuario no existe o no está autorizado para registrar programaciones."
            });
        }

        const [actividadExist] = await pool.query(
            "SELECT * FROM actividad WHERE id_actividad = ?",
            [fk_id_actividad]
        );
        if (actividadExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "La actividad no existe. Registre primero una actividad."
            });
        }

        const [cultivoExist] = await pool.query(
            "SELECT * FROM lotes WHERE id_lote = ?",
            [fk_id_lote]
        );
        if (cultivoExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "El lote no existe. Registre primero un lote."
            });
        }

        // Verificar si la actividad ya está programada
        const [existingProgram] = await pool.query(
            "SELECT * FROM programacion WHERE fk_id_actividad = ?",
            [fk_id_actividad]
        );
        if (existingProgram.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "La actividad ya está programada. No se puede programar nuevamente."
            });
        }

        const [result] = await pool.query(
            "INSERT INTO programacion (fecha_inicio, fecha_fin, estado, fk_identificacion, fk_id_actividad, fk_id_lote, admin_id) VALUES (?,?,?,?,?,?,?)",
            [fecha_inicio, fecha_fin, estado, fk_identificacion, fk_id_actividad, fk_id_lote, adminId]
        );

        const [actividad] = await pool.query(
            "SELECT nombre_actividad FROM actividad WHERE id_actividad = ?", 
            [fk_id_actividad]
        );
        const [lote] = await pool.query(
            "SELECT nombre FROM lotes WHERE id_lote = ?", 
            [fk_id_lote]
        );

        if (result.affectedRows > 0) {
            const [usuario] = usuarioExist;
            sendNotificationToEmployee(usuario.correo, `
                ¡Hola ${usuario.nombre}!
                ¡Buenas noticias! Se ha programado una nueva actividad para ti.
                Detalles de la actividad:
                - Fecha de inicio: ${fecha_inicio}
                - Fecha de finalización: ${fecha_fin}
                - Actividad: ${actividad[0].nombre_actividad}
                - Lote: ${lote[0].nombre}

                ¡Estamos seguros de que harás un trabajo excelente! ¡Sigue así!

                Para más información, ingresa a la App.
            `);

            return res.status(200).json({
                status: 200,
                message: "Se registró con éxito y notificación enviada al empleado."
            });
        } else {
            return res.status(403).json({
                status: 403,
                message: "No se registró"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message || "Error en el sistema"
        });
    }
};


//actualizar
export const actualizarProgramacion = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        const { id } = req.params;
        const {
            fecha_inicio,
            fecha_fin,
            fk_identificacion,
            fk_id_actividad,
            fk_id_lote,
            estado,
        } = req.body;

        const adminId = req.usuario;

        const [usuarioExist] = await pool.query(
            "SELECT * FROM usuarios WHERE identificacion = ? AND admin_id = ?", 
            [fk_identificacion, adminId]
        );
        if (usuarioExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "El usuario no existe o no está autorizado para actualizar"
            });
        }

        const [actividadExist] = await pool.query(
            "SELECT * FROM actividad WHERE id_actividad = ?",
            [fk_id_actividad]
        );
        if (actividadExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "La actividad no existe. Registre primero una actividad."
            });
        }

        const [cultivoExist] = await pool.query(
            "SELECT * FROM lotes WHERE id_lote = ?",
            [fk_id_lote]
        );
        if (cultivoExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "El lote no existe. Registre primero un lote."
            });
        }

        const [result] = await pool.query(
            `UPDATE programacion 
             SET fecha_inicio = ?, fecha_fin = ?, fk_identificacion = ?, fk_id_actividad = ?, fk_id_lote = ?, estado = ? 
             WHERE id_programacion = ? AND fk_identificacion = ?`,
            [fecha_inicio, fecha_fin, fk_identificacion, fk_id_actividad, fk_id_lote, estado, id, fk_identificacion]
        );

        if (result.affectedRows > 0) {
            const [actividad] = await pool.query(
                "SELECT nombre_actividad FROM actividad WHERE id_actividad = ?", 
                [fk_id_actividad]
            );
            const [lote] = await pool.query(
                "SELECT nombre FROM lotes WHERE id_lote = ?", 
                [fk_id_lote]
            );

            const [usuario] = usuarioExist;
            sendNotificationToEmployee(usuario.correo, `
                ¡Hola ${usuario.nombre}!
                ¡Actualización importante! La actividad programada ha sido actualizada con los siguientes detalles:
                - Nueva fecha de inicio: ${fecha_inicio}
                - Nueva fecha de finalización: ${fecha_fin}
                - Actividad: ${actividad[0].nombre_actividad}
                - Lote: ${lote[0].nombre}

                ¡Estamos seguros de que seguirás haciendo un trabajo excelente! ¡Sigue así!

                Para más información, ingresa a la App.
            `);

            return res.status(200).json({
                status: 200,
                message: "Se actualizó con éxito y notificación enviada al empleado."
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "No se encontró la programación para actualizar o no está autorizado para realizar la actualización"
            });
        }
    } catch (error) {
        return res.status (500).json({
            status: 500,
            message: error.message || "Error interno del servidor"
        });
    }
};


// CRUD - Listar
export const listarProgramacion = async (req, res) => {
	try {
		// Obtener el admin_id del usuario autenticado
		const adminId = req.usuario;

		let sql = `SELECT 
    p.*,
        p.id_programacion, 
        p.fecha_inicio,
        p.fecha_fin,
        u.nombre AS usuario,
        a.nombre_actividad,
        v.nombre_variedad,
        l.nombre AS lote,
        p.estado
    FROM 
        programacion AS p
    JOIN 
        usuarios AS u ON p.fk_identificacion = u.identificacion
    JOIN 
        actividad AS a ON p.fk_id_actividad = a.id_actividad
    JOIN 
        variedad AS v ON a.fk_id_variedad = v.id_variedad
    JOIN 
        lotes AS l ON p.fk_id_lote = l.id_lote
    WHERE 
        u.admin_id = ?;
    `;

		const [result] = await pool.query(sql, [adminId]);

		if (result.length > 0) {
			res.status(200).json(result);
		} else {
			res.status(404).json({
				status: 404,
				message: "No hay ninguna asignación",
			});
		}
	} catch (error) {
		res.status(500).json({
			message: error.message || "Error interno del servidor",
		});
	}
};

// CRUD - Estado
export const estadoProgramacion = async (req, res) => {
	try {
		const { id } = req.params;
		const { estado } = req.body;

		// Consulta el estado actual del usuario asociado a la programación
		const [usuario] = await pool.query(
			"SELECT estado FROM usuarios WHERE identificacion = (SELECT fk_identificacion FROM programacion WHERE id_programacion = ?)",
			[id]
		);

		// Verifica si se encontró el usuario asociado
		if (usuario.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "No se pudo encontrar el usuario asociado a la programación",
			});
		}

		// Verifica si el usuario asociado está activo
		if (usuario[0].estado === "inactivo") {
			return res.status(400).json({
				status: 400,
				message:
					"No se puede cambiar el estado de la programación porque el usuario asociado está inactivo",
			});
		}

		// Consulta el fk_id_lote y fk_id_actividad de la programación
		const [programacion] = await pool.query(
			"SELECT estado, fk_id_lote, fk_id_actividad FROM programacion WHERE id_programacion = ?",
			[id]
		);

		// Verifica si se encontró la programación
		if (programacion.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "No se pudo encontrar la programación",
			});
		}

		// Consulta el estado actual del lote asociado
		const [lote] = await pool.query(
			"SELECT estado FROM lotes WHERE id_lote = ?",
			[programacion[0].fk_id_lote]
		);

		// Verifica si se encontró el lote asociado
		if (lote.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "No se pudo encontrar el lote asociado a la programación",
			});
		}

		// Verifica si el lote asociado está activo
		if (lote[0].estado === "inactivo") {
			return res.status(400).json({
				status: 400,
				message:
					"No se puede cambiar el estado de la programación porque el lote asociado está inactivo",
			});
		}

		// Consulta el estado actual de la actividad asociada
		const [actividad] = await pool.query(
			"SELECT estado FROM actividad WHERE id_actividad = ?",
			[programacion[0].fk_id_actividad]
		);

		// Verifica si se encontró la actividad asociada
		if (actividad.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "No se pudo encontrar la actividad asociada a la programación",
			});
		}

		// Verifica si la actividad asociada está activa
		if (actividad[0].estado === "inactivo") {
			return res.status(400).json({
				status: 400,
				message:
					"No se puede cambiar el estado de la programación porque la actividad asociada está inactiva",
			});
		}

		// Determina el nuevo estado
		const nuevoEstado =
			estado || (programacion[0].estado === "activo" ? "inactivo" : "activo");

		// Actualiza el estado de la programación
		const [result] = await pool.query(
			"UPDATE programacion SET estado = ? WHERE id_programacion = ?",
			[nuevoEstado, id]
		);

		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: `El estado se actualizó correctamente y ahora es ${nuevoEstado}`,
			});
		} else {
			res.status(404).json({
				status: 404,
				message: "El estado no se actualizó correctamente",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message || "Error interno del servidor",
		});
	}
};

// CRUD -buscar
export const buscarProgramacion = async (req, res) => {
	try {
		const { id } = req.params;
		const [result] = await pool.query(
			`
    SELECT 
    p.id_programacion, 
    p.fecha_inicio,
    p.fecha_fin,
    u.nombre AS usuario,
    a.nombre_actividad,
    v.nombre_variedad,
    l.nombre AS lote,
    p.estado
FROM 
    programacion AS p
JOIN 
    usuarios AS u ON p.fk_identificacion = u.identificacion
JOIN 
    actividad AS a ON p.fk_id_actividad = a.id_actividad
JOIN 
    variedad AS v ON a.fk_id_variedad = v.id_variedad
JOIN 
    lotes AS l ON p.fk_id_lote = l.id_lote
      WHERE 
        p.id_programacion = ?;
    `,
			[id]
		);

		if (result.length > 0) {
			res.status(200).json(result);
		} else {
			res.status(404).json({
				status: 404,
				message: "No se encontraron resultados para la búsqueda",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message || "Error interno del servidor",
		});
	}
};
