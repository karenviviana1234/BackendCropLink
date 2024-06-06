import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

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
			fk_id_variedad, // Agregado fk_id_variedad
			fk_id_lote,
			estado,
		} = req.body;

		// Obtener el admin_id del usuario autenticado
		const adminId = req.usuario;

		// Verificar si el campo estado está presente en el cuerpo de la solicitud
		if (!estado) {
			return res.status(400).json({
				status: 400,
				message: "El campo 'estado' es obligatorio",
			});
		}

		// Verificar si el usuario existe y pertenece al admin_id
		const [usuarioExist] = await pool.query(
			"SELECT * FROM usuarios WHERE identificacion = ? AND admin_id = ?",
			[fk_identificacion, adminId]
		);
		if (usuarioExist.length === 0) {
			return res.status(404).json({
				status: 404,
				message:
					"El usuario no existe o no está autorizado para registrar programaciones.",
			});
		}

		// Verificar si la actividad existe
		const [actividadExist] = await pool.query(
			"SELECT * FROM actividad WHERE id_actividad = ?",
			[fk_id_actividad]
		);
		if (actividadExist.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "La actividad no existe. Registre primero una actividad.",
			});
		}

		// Verificar si el lote existe
		const [cultivoExist] = await pool.query(
			"SELECT * FROM lotes WHERE id_lote = ?",
			[fk_id_lote]
		);
		if (cultivoExist.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "El lote no existe. Registre primero un lote.",
			});
		}

		// Verificar si la variedad existe
		const [variedadExist] = await pool.query(
			"SELECT * FROM variedad WHERE id_variedad = ?", // Verificar la tabla de variedades
			[fk_id_variedad]
		);
		if (variedadExist.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "La variedad no existe. Registre primero una variedad.",
			});
		}

		// Insertar la programación
		const [result] = await pool.query(
			"INSERT INTO programacion (fecha_inicio, fecha_fin, estado, fk_identificacion, fk_id_actividad, fk_id_variedad, fk_id_lote ,admin_id) VALUES (?,?,?,?,?,?,?,?)",
			[
				fecha_inicio,
				fecha_fin,
				estado,
				fk_identificacion,
				fk_id_actividad,
				fk_id_variedad,
				fk_id_lote,
				adminId,
			]
		);

		if (result.affectedRows > 0) {
			return res.status(200).json({
				status: 200,
				message: "Se registró con éxito",
			});
		} else {
			return res.status(403).json({
				status: 403,
				message: "No se registró",
			});
		}
	} catch (error) {
		return res.status(500).json({
			status: 500,
			message: error.message || "Error en el sistema",
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

//actualizar
export const actualizarProgramacion = async (req, res) => {
	try {
		// Validar los errores de la solicitud
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors);
		}

		// Obtener el id de la programación desde los parámetros de la solicitud
		const { id } = req.params;
		const {
			fecha_inicio,
			fecha_fin,
			fk_identificacion,
			fk_id_actividad,
			fk_id_variedad, // Agregado fk_id_variedad
			fk_id_lote,
			estado,
		} = req.body;

		// Obtener el admin_id del usuario autenticado
		const adminId = req.usuario;

		// Verificar si el usuario existe y pertenece al administrador actual
		const [usuarioExist] = await pool.query(
			"SELECT * FROM usuarios WHERE identificacion = ? AND admin_id = ?",
			[fk_identificacion, adminId]
		);
		if (usuarioExist.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "El usuario no existe o no está autorizado para actualizar",
			});
		}

		// Verificar si la actividad existe
		const [actividadExist] = await pool.query(
			"SELECT * FROM actividad WHERE id_actividad = ?",
			[fk_id_actividad]
		);
		if (actividadExist.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "La actividad no existe. Registre primero una actividad.",
			});
		}

		// Verificar si el cultivo existe
		const [cultivoExist] = await pool.query(
			"SELECT * FROM lotes WHERE id_lote = ?",
			[fk_id_lote]
		);
		if (cultivoExist.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "El lote no existe. Registre primero un lote.",
			});
		}

		// Verificar si la variedad existe
		const [variedadExist] = await pool.query(
			"SELECT * FROM variedad WHERE id_variedad = ?",
			[fk_id_variedad]
		);
		if (variedadExist.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "La variedad no existe. Registre primero una variedad.",
			});
		}

		// Actualizar la programación
		const [result] = await pool.query(
			`UPDATE programacion 
            SET fecha_inicio = ?, fecha_fin = ?, fk_identificacion = ?, fk_id_actividad = ?, fk_id_variedad = ?, fk_id_lote = ?, estado = ? 
            WHERE id_programacion = ? AND fk_identificacion = ?`,
			[
				fecha_inicio,
				fecha_fin,
				fk_identificacion,
				fk_id_actividad,
				fk_id_variedad, // Incluido en el set de actualización
				fk_id_lote,
				estado,
				id,
				fk_identificacion,
			]
		);

		if (result.affectedRows > 0) {
			return res.status(200).json({
				status: 200,
				message: "Se actualizó con éxito",
			});
		} else {
			return res.status(404).json({
				status: 404,
				message:
					"No se encontró la programación para actualizar o no está autorizado para realizar la actualización",
			});
		}
	} catch (error) {
		return res.status(500).json({
			status: 500,
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
