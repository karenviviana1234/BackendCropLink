import { pool } from "../database/conexion.js";
import { validationResult } from 'express-validator';
//ya basta freezer
//git crud
//crud listar
export const listarTipoRecurso = async (req, res) => {
    try {
        // Obtener el admin_id del usuario que realiza la solicitud
        const admin_id = req.usuario;

        // Consultar la base de datos para obtener los recursos asociados al admin_id
        const [result] = await pool.query("SELECT * FROM tipo_recursos WHERE admin_id = ?", [admin_id]);

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(400).json({
                "Mensaje": "No hay recursos asociados al administrador"
            });
        }
    } catch (error) {
        res.status(500).json({
            "Mensaje": "Error en el sistema"
        });
    }
}

//crud Registrar
export const RegistroTipoRecurso = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        
        const { nombre_recursos, cantidad_medida, unidades_medida, extras } = req.body;

        // Obtener el admin_id del usuario que realiza el registro
        const admin_id = req.usuario;

        // Asigna el estado predeterminado como "existente"
        const estado = 'existente';

        const [result] = await pool.query("INSERT INTO tipo_recursos (nombre_recursos, cantidad_medida, unidades_medida, estado, extras, admin_id) VALUES (?, ?, ?, ?, ?, ?)", [nombre_recursos, cantidad_medida, unidades_medida, estado, extras, admin_id]);
        
        if (result.affectedRows > 0) {
            res.status(200).json({
                status: 200,
                message: 'Se registró el recurso con éxito.',
                result: result
            });
        } else {
            res.status(403).json({
                status: 403,
                message: 'No se registró el recurso.',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message || 'Error en el sistema.'
        });
    }
}

export const ActualizarTipoRecurso = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        const { id } = req.params;
        const { nombre_recursos, cantidad_medida, unidades_medida, extras } = req.body;

        // Verifica si al menos uno de los campos está presente en la solicitud
        if (!nombre_recursos && !cantidad_medida && !unidades_medida && !extras) {
            return res.status(400).json({ message: 'Al menos uno de los campos (nombre_recursos, cantidad_medida, unidades_medida, extras) debe estar presente en la solicitud para realizar la actualización.' });
        }

        console.log("Consulta SQL:", `SELECT * FROM tipo_recursos WHERE id_tipo_recursos=${id}`);

        const [oldRecurso] = await pool.query("SELECT * FROM tipo_recursos WHERE id_tipo_recursos=? AND admin_id = ?", [id, req.usuario]);

        if (oldRecurso.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No se encontró el recurso para actualizar o no está autorizado para realizar esta acción'
            });
        }

        const [result] = await pool.query(
            `UPDATE tipo_recursos SET nombre_recursos = ?, cantidad_medida = ?, unidades_medida = ?, extras = ? WHERE id_tipo_recursos = ?`,
            [nombre_recursos || oldRecurso[0].nombre_recursos, cantidad_medida || oldRecurso[0].cantidad_medida, unidades_medida || oldRecurso[0].unidades_medida, extras || oldRecurso[0].extras, id]
        );

        if (result.affectedRows > 0) {
            return res.status(200).json({
                status: 200,
                message: 'Se actualizó con éxito',
                result: result
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: 'No se encontró el registro para actualizar'
            });
        }
    } catch (error) {
        console.error("Error en la función Actualizar:", error);
        return res.status(500).json({
            status: 500,
            message: error.message || "error en el sistema"
        });
    }
};

//CRUD - Desactivar
export const DesactivarR = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.usuario;

        // Verificar si el recurso existe y obtener su estado actual
        const [oldRecurso] = await pool.query("SELECT * FROM tipo_recursos WHERE id_tipo_recursos = ?", [id]); 
        
        if (oldRecurso.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No se encontró el recurso con el ID especificado'
            });
        }

        // Verifica si el estado actual es "existente" para cambiarlo a "gastada_o" y viceversa
        const newEstado = oldRecurso[0].estado === 'existente' ? 'gastada_o' : 'existente';

        const [result] = await pool.query(
            "UPDATE tipo_recursos SET estado = ?, admin_id = ? WHERE id_tipo_recursos = ?",
            [newEstado, adminId, id]
        );

        if (result.affectedRows > 0) {
            return res.status(200).json({
                status: 200,
                message: `Se cambió el estado del recurso a '${newEstado}' con éxito`
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: 'No se encontró el registro para cambiar el estado'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message || 'Error en el servidor'
        });
    }
};

    

// CRUD - Buscar
export const BuscarTipoRecurso = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("SELECT * FROM tipo_recursos WHERE id_tipo_recursos =?", [id]);
                    
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
            message: "error en el sistema"
        });
    }
};