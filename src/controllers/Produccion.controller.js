import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

export const listarProduccion = async (req, res) => {
    try {
        // Obtener el admin_id del usuario autenticado
        const adminId = req.usuario;
//Consulta sql
        let sql = `
            SELECT 
                produ.id_producccion,
                produ.cantidad_produccion, 
                produ.precio, 
                produ.fk_id_programacion AS id_programacion,  
                pro.fecha_inicio, 
                pro.fecha_fin,
                produ.valor_inversion,
                produ.estado
            FROM 
                produccion AS produ
            JOIN 
                programacion AS pro ON produ.fk_id_programacion = pro.id_programacion
            WHERE
                pro.admin_id = ?;
        `;
//lista por el id del administracion
        const [listar] = await pool.query(sql, [adminId]);
    //condicionales para ver si se cumplio el proceso, el else es por si no se cumplio o ocurrio un problema 

        if (listar.length > 0) {
            res.status(200).json(listar);
        } else {
            res.status(400).json({
                status: 400,
                message: 'No hay ninguna producción asociada al administrador actual'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Error en el servidor',
        });
    }
};

export const registrarProduccion = async (req, res) => {
    try {
        // Validación de los resultados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
//datos que se pide para registrar la produccion
        const { cantidad_produccion, precio, fk_id_programacion } = req.body;

        // Obtener el adminId del usuario autenticado
        const adminId = req.usuario;

        // Verificar si la programación existe y pertenece al administrador actual
        const [programacionExist] = await pool.query(
            'SELECT * FROM programacion WHERE id_programacion = ? AND admin_id = ?',
            [fk_id_programacion, adminId]
        );
//condicional para verificar si hay una programacion registrada
        if (programacionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Esta programación no existe o no está autorizada para este administrador. Registre primero la programación.'
            });
        }

        // Calcular valor_inversion basado en los recursos asociados a la programación
        const [recursos] = await pool.query(`
            SELECT SUM(tr.cantidad_medida * c.precio) AS total_valor_inversion
            FROM actividad_tipo_recursos AS atr
            JOIN tipo_recursos AS tr ON atr.fk_id_tipo_recursos = tr.id_tipo_recursos
            JOIN costos AS c ON tr.id_tipo_recursos = c.fk_id_tipo_recursos
            WHERE atr.fk_id_actividad = ?
        `, [fk_id_programacion]);

        const valor_inversion = recursos[0].total_valor_inversion || 0;

        // Establecer estado como 'activo' por defecto
        const estado = 'activo';

        // Realizar la inserción en la tabla produccion
        const [Registrar] = await pool.query(
            'INSERT INTO produccion (cantidad_produccion, precio, fk_id_programacion, valor_inversion, estado, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
            [cantidad_produccion, precio, fk_id_programacion, valor_inversion, estado, adminId]
        );
    //condicionales para ver si se cumplio el proceso, el else es por si no se cumplio o ocurrio un problema 

        if (Registrar.affectedRows > 0) {
            return res.status(200).json({
                status: 200,
                message: 'Se registró correctamente la producción.',
                result: Registrar
            });
        } else {
            return res.status(400).json({
                status: 400,
                message: 'No se ha podido registrar la producción.'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Error en el servidor'
        });
    }
};


export const actualizarProduccion = async (req, res) => {
    try {
        // Validación de los resultados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
//datos que se pueden actualizar
        const { cantidad_produccion, precio, fk_id_programacion } = req.body;
        const { id_producccion } = req.params; // Obtener id_producccion de los parámetros de la URL

        // Obtener el adminId del usuario autenticado
        const adminId = req.usuario;

        // Verificar si la producción existe y pertenece al administrador actual
        const [produccionExist] = await pool.query(
            'SELECT * FROM produccion WHERE id_producccion = ? AND admin_id = ?',
            [id_producccion, adminId]
        );
//conidcional para ver la produccion del admin
        if (produccionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'La producción especificada no existe o no está autorizada para este administrador.'
            });
        }

        // Verificar si la programación existe y pertenece al administrador actual
        const [programacionExist] = await pool.query(
            'SELECT * FROM programacion WHERE id_programacion = ? AND admin_id = ?',
            [fk_id_programacion, adminId]
        );
//condicional para verificar la programacion
        if (programacionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Esta programación no existe o no está autorizada para este administrador. Registre primero la programación.'
            });
        }

        // Calcular valor_inversion basado en los recursos asociados a la programación
        const [recursos] = await pool.query(`
            SELECT SUM(tr.cantidad_medida * c.precio) AS total_valor_inversion
            FROM actividad_tipo_recursos AS atr
            JOIN tipo_recursos AS tr ON atr.fk_id_tipo_recursos = tr.id_tipo_recursos
            JOIN costos AS c ON tr.id_tipo_recursos = c.fk_id_tipo_recursos
            WHERE atr.fk_id_actividad = ?
        `, [fk_id_programacion]);

        const valor_inversion = recursos[0].total_valor_inversion || 0;

        // Actualizar la producción en la tabla produccion
        const [actualizar] = await pool.query(
            'UPDATE produccion SET cantidad_produccion = ?, precio = ?, fk_id_programacion = ?, valor_inversion = ? WHERE id_producccion = ? AND admin_id = ?',
            [cantidad_produccion, precio, fk_id_programacion, valor_inversion, id_producccion, adminId]
        );
    //condicionales para ver si se cumplio el proceso, el else es por si no se cumplio o ocurrio un problema 
        if (actualizar.affectedRows > 0) {
            return res.status(200).json({
                status: 200,
                message: 'Se actualizó correctamente la producción.',
                result: actualizar
            });
        } else {
            return res.status(400).json({
                status: 400,
                message: 'No se ha podido actualizar la producción.'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Error en el servidor'
        });
    }
};


export const desactivarProduccion = async (req, res) => {
    try {
        const { id_producccion } = req.params;

        await pool.query("START TRANSACTION");

        const [currentResult] = await pool.query(
            "SELECT estado FROM produccion WHERE id_producccion = ?",
            [id_producccion]
        );

        if (currentResult.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({
                status: 404,
                message: "La produccion con el id " + id_producccion  + " no fue encontrada",
            });
        }

        const currentState = currentResult[0].estado;
//cambiar el estado
        const nuevoEstado = currentState === 'activo' ? 'inactivo' : 'activo';
//se actualiza por la produccion
        await pool.query(
            "UPDATE produccion SET estado = ? WHERE id_producccion = ?",
            [nuevoEstado, id_producccion]
        );


        // Confirmar la transacción
        await pool.query("COMMIT");

        res.status(200).json({
            status: 200,
            message: "El estado de la produccion ha sido cambiado a " + nuevoEstado + ".",
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