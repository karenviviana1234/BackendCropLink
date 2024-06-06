import { pool } from "../database/conexion.js"
import {validationResult} from 'express-validator'
//nn
export const listarlotes = async (req, res) => {
    try {
        // Obtener el ID del administrador que realiza la solicitud desde el token
        const admin_id = req.usuario;

        let sql = `SELECT 
        lo.*,
        lo.id_lote, lo.nombre, lo.longitud, lo.latitud, 
                          fin.nombre_finca AS nombre_finca,
                          fin.longitud AS finca_longitud, 
                          fin.latitud AS finca_latitud,
                          lo.estado
                   FROM lotes AS lo
                   JOIN finca AS fin ON lo.fk_id_finca = fin.id_finca
                   WHERE fin.admin_id = ?`; // Restringir los lotes por el admin_id

        const [resultado] = await pool.query(sql, [admin_id]);

        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(404).json({
                mensaje: "No se encontraron lotes asociados al administrador actual",
            });
        }
    } catch (error) {
        res.status(500).json({
            mensaje: "Error en el sistema",
            error: error.message,
        });
    }
};
export const Registrarlotes = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors });
        }

        // Obtener el ID del administrador que realiza la solicitud desde el token
        const admin_id = req.usuario;

        // Obtener el fk_id_finca del cuerpo de la solicitud
        const { nombre, longitud, latitud, fk_id_finca } = req.body;

        // Verificar si el administrador tiene acceso a la finca especificada
        const [fincaExist] = await pool.query(
            "SELECT * FROM finca WHERE id_finca = ? AND admin_id = ?",
            [fk_id_finca, admin_id]
        );

        if (fincaExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No se encontró la finca asociada al administrador actual. Verifique la finca o los permisos del administrador.",
            });
        }

        // Definir el estado como activo
        const estado = 'activo';

        // Insertar el lote en la base de datos
        const [result] = await pool.query(
            "INSERT INTO lotes (nombre, longitud, latitud, fk_id_finca, estado, admin_id) VALUES (?, ?, ?, ?, ?,?)",
            [nombre, longitud, latitud, fk_id_finca, estado,admin_id]
        );

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Lote registrado con éxito" });
        } else {
            return res.status(400).json({ message: "Error al registrar el lote" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error en el sistema", error: error.message });
    }
};


export const Actualizarlote = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Obtener el ID del administrador que realiza la solicitud desde el token
        const admin_id = req.usuario;

        const { id_lote } = req.params;
        const { nombre, longitud, latitud, fk_id_finca } = req.body;

        // Verificar si al menos uno de los campos está presente en la solicitud
        if (!nombre && !longitud && !latitud && !fk_id_finca) {
            return res.status(400).json({ message: 'Al menos uno de los campos (nombre, longitud, latitud, fk_id_finca) debe estar presente en la solicitud para realizar la actualización.' });
        }

        // Realizar una consulta para obtener el lote antes de actualizarlo
        const [oldLote] = await pool.query("SELECT * FROM lotes WHERE id_lote=?", [id_lote]);

        if (oldLote.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Lote no encontrado',
            });
        }

        // Verificar si el administrador tiene acceso a la finca asociada al lote
        const [fincaExist] = await pool.query(
            "SELECT * FROM finca WHERE id_finca = ? AND admin_id = ?",
            [fk_id_finca, admin_id]
        );

        if (fincaExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No se encontró la finca asociada al administrador actual. Verifique la finca o los permisos del administrador.",
            });
        }

        // Realizar la actualización en la base de datos
        const [resultado] = await pool.query(
            `UPDATE lotes SET nombre=?, longitud=?, latitud=?, fk_id_finca=? WHERE id_lote=?`,
            [nombre || oldLote[0].nombre, longitud || oldLote[0].longitud, latitud || oldLote[0].latitud, fk_id_finca || oldLote[0].fk_id_finca, id_lote]
        );

        if (resultado.affectedRows > 0) {
            return res.status(200).json({ message: 'El lote ha sido actualizado' });
        } else {
            return res.status(403).json({ message: 'No se pudo actualizar el lote' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error en el sistema', error: error.message });
    }
};




export const Buscarlote = async (req, res) => {
    try {
        const { id_lote } = req.params;
        const [ resultado ] = await pool.query("select * from lotes where id_lote=?", [id_lote])

        if (resultado.length > 0) {
            res.status(200).json(resultado)
        } else {
            res.status(400).json({
                "mensaje": "No se encontró nada con ese ID"
            })
        }

    }  catch (error) {
        res.status(500).json({
            "mensaje": error
        })     
    }
}

export const eliminarlote = async (req, res) => {
    try{
        const { id_lote } = req.params;
        const [ resultado ] = await pool.query("delete from lotes where id_lote=?", [id_lote])

        if (resultado.affectedRows > 0) {
            res.status(200).json({
                "mensaje": "desactivado con exito"
            })
        } else {
            res.status(404).json({
                "mensaje": "No se pudo desactivar"
            })
        }
    } catch (error) {
        res.status(500).json({
            "mensaje": error
        })
    }
}


export const desactivarlote = async (req, res) => {
    try {
        const { id_lote } = req.params;

        // Inicia una transacción
        await pool.query("START TRANSACTION");

        // Consulta el estado actual del lote por su ID
        const [lote] = await pool.query("SELECT * FROM lotes WHERE id_lote = ?", [id_lote]);

        // Verifica si se encontró el lote
        if (lote.length === 0) {
            await pool.query("ROLLBACK"); // Si no se encontró, deshace la transacción
            return res.status(404).json({
                status: 404,
                message: 'Lote no encontrado',
            });
        }

        // Consulta el estado actual de la finca relacionada al lote
        const [finca] = await pool.query("SELECT estado FROM finca WHERE id_finca = ?", [lote[0].fk_id_finca]);

        // Verifica si la finca está activa
        if (finca.length === 0 || finca[0].estado !== 'activo') {
            await pool.query("ROLLBACK"); // Si la finca no está activa, deshace la transacción
            return res.status(400).json({
                status: 400,
                message: 'No se puede activar el lote porque la finca está inactiva',
            });
        }

        // Determina el nuevo estado
        let nuevoEstado;
        if (lote[0].estado === 'activo') {
            nuevoEstado = 'inactivo'; // Si estaba activo, se desactiva
        } else {
            nuevoEstado = 'activo'; // Si estaba inactivo, se activa
        }

        // Actualiza el estado del lote
        await pool.query("UPDATE lotes SET estado = ? WHERE id_lote = ?", [nuevoEstado, id_lote]);

        // Actualiza el estado de los cultivos relacionados
        await pool.query("UPDATE cultivo SET estado = ? WHERE fk_id_lote = ?", [nuevoEstado, id_lote]);

        // Actualiza el estado de la programación relacionada
        await pool.query("UPDATE programacion SET estado = ? WHERE fk_id_lote IN (SELECT id_lote FROM lotes WHERE fk_id_lote = ?)", [nuevoEstado, id_lote]);

        // Confirma la transacción
        await pool.query("COMMIT");

        res.status(200).json({
            status: 200,
            message: `Estado del lote y tablas relacionadas actualizados a ${nuevoEstado}`,
        });
    } catch (error) {
        // Si ocurre un error, deshace la transacción
        await pool.query("ROLLBACK");
        res.status(500).json({
            status: 500,
            message: error.message || 'Error en el sistema',
        });
    }
}

