import { pool } from "../database/conexion.js";
import { validationResult } from 'express-validator';

//CRUD - registrar una variedad
export const registrarVariedad = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        
        const estado = "activo";
        const { nombre_variedad, tipo_cultivo } = req.body;

        // Obtener el ID del administrador que realiza la solicitud desde el token
        const admin_id = req.usuario;

        // Verificar si el campo tipo_cultivo está presente en el cuerpo de la solicitud
        if (!tipo_cultivo) {
            return res.status(400).json({
                status: 400,
                message: "El campo 'tipo_cultivo' es obligatorio"
            });
        }

        // Realizar el registro en la base de datos
        const [result] = await pool.query(
            "INSERT INTO variedad (nombre_variedad, tipo_cultivo, estado, admin_id) VALUES (?, ?, ?, ?)",
            [nombre_variedad, tipo_cultivo, estado, admin_id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                status: 200,
                message: 'Se registró la variedad con éxito',
                result: result
            });
        } else {
            res.status(403).json({
                status: 403,
                message: 'No se registró la variedad',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message || 'Error en el sistema'
        });
    }
};

// CRUD - Listar
export const listarVariedades = async (req, res) => {
    try {
        // Obtener el ID del administrador que realiza la solicitud desde el token
        const admin_id = req.usuario;

        // Consultar las variedades asociadas al administrador actual
        const [result] = await pool.query(
            "SELECT * FROM variedad WHERE admin_id = ?",
            [admin_id]
        );

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(400).json({
                message: 'No hay ninguna variedad registrada asociada a este administrador'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error en el sistema"
        });
    }
};


// CRUD - Actualizar
export const actualizarVariedad = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { nombre_variedad, tipo_cultivo } = req.body;
        if (!nombre_variedad && !tipo_cultivo) {
            return res.status(400).json({ message: 'Al menos uno de los campos (nombre_variedad, tipo_cultivo) debe estar presente en la solicitud para realizar la actualización.' });
        }

        // Obtener el ID del administrador que realiza la solicitud desde el token
        const admin_id = req.usuario;

        // Realizar una consulta para verificar si la variedad pertenece al administrador actual
        const [oldVariedad] = await pool.query("SELECT * FROM variedad WHERE id_variedad=? AND admin_id=?", [id, admin_id]);

        if (oldVariedad.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Variedad no encontrada o no autorizada para actualizar',
            });
        }

        // Realizar la actualización en la base de datos
        const [result] = await pool.query(
            `UPDATE variedad 
            SET nombre_variedad = ${nombre_variedad ? `'${nombre_variedad}'` : `'${oldVariedad[0].nombre_variedad}'`}, 
            tipo_cultivo = ${tipo_cultivo ? `'${tipo_cultivo}'` : `'${oldVariedad[0].tipo_cultivo}'`} 
            WHERE id_variedad = ? AND admin_id = ?`,
            [id, admin_id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                status: 200,
                message: 'Se actualizó con éxito',
            });
        } else {
            res.status(403).json({
                status: 403,
                message: 'No se encontró el registro para actualizar o no está autorizado para realizar la actualización',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message || 'Error en el sistema'
        });
    }
};


// CRUD - Buscar
export const buscarVariedad = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("SELECT * FROM variedad WHERE id_variedad=?", [id]);

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'No se encontraron resultados para la búsqueda'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Error en el sistema"
        });
    }

};
export const desactivarVariedad = async (req, res) => {
    try {
        const { id_variedad } = req.params;

        // Inicia una transacción
        await pool.query("START TRANSACTION");

        // Consulta el estado actual de la variedad
        const [currentResult] = await pool.query(
            "SELECT estado FROM variedad WHERE id_variedad = ?",
            [id_variedad]
        );

        // Verificar si se encontró la variedad
        if (currentResult.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({
                status: 404,
                message: "La variedad con el id " + id_variedad + " no fue encontrada",
            });
        }

        // Obtener el estado actual de la variedad
        const currentState = currentResult[0].estado;

        // Consultar las actividades asociadas a la variedad
        const [activitiesResult] = await pool.query(
            "SELECT id_actividad, estado FROM actividad WHERE fk_id_variedad = ?",
            [id_variedad]
        );

        // Cambiar el estado de la variedad
        const nuevoEstado = currentState === 'activo' ? 'inactivo' : 'activo';

        // Actualizar el estado de la variedad en la base de datos
        await pool.query(
            "UPDATE variedad SET estado = ? WHERE id_variedad = ?",
            [nuevoEstado, id_variedad]
        );

        // Actualizar el estado de las actividades asociadas
        for (const activity of activitiesResult) {
            await pool.query(
                "UPDATE actividad SET estado = ? WHERE id_actividad = ?",
                [nuevoEstado, activity.id_actividad]
            );
        }

        // Confirmar la transacción
        await pool.query("COMMIT");

        res.status(200).json({
            status: 200,
            message: "El estado de la variedad ha sido cambiado a " + nuevoEstado + ".",
            });
    } catch (error) {
        // Si ocurre un error, deshace la transacción
        await pool.query("ROLLBACK");
        res.status(500).json({
            status: 500,
            message: "Error en el sistema: " + error,
        });
    }
};