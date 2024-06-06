import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";
//olaaaaa
export const listarProduccion = async (req, res) => {
    try {
        // Obtener el admin_id del usuario autenticado
        const adminId = req.usuario;

        let sql = `
            SELECT 
                produ.id_producccion,
                produ.cantidad_produccion, 
                produ.precio, 
                produ.fk_id_programacion AS id_programacion,  
                pro.fecha_inicio, 
                pro.fecha_fin,
                produ.fk_id_inversiones AS id_inversiones,
                inv.valor_inversion,
                produ.estado
            FROM 
                produccion AS produ
            JOIN 
                programacion AS pro ON produ.fk_id_programacion = pro.id_programacion
            JOIN 
                inversiones AS inv ON produ.fk_id_inversiones = inv.id_inversiones
            WHERE
                pro.admin_id = ?;
        `;

        const [listar] = await pool.query(sql, [adminId]);

        if (listar.length > 0) {
            res.status(200).json(listar);
        } else {
            res.status(400).json({
                status: 400,
                message: 'No hay ninguna producción asociada al administrador actual'
            });
        }
    } catch (error) {
        res.status (500) .json({
            status: 500,
            message: 'Error en el servidor',
        });
        console.log(error);
    }
};


export const registrarProduccion = async (req, res) => {
    try {
        // Validación de los resultados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { cantidad_produccion, precio, fk_id_programacion, fk_id_inversiones } = req.body;

        // Obtener el adminId del usuario autenticado
        const adminId = req.usuario;

        // Verificar si la programación existe y pertenece al administrador actual
        const [programacionExist] = await pool.query(
            'SELECT * FROM programacion WHERE id_programacion = ? AND admin_id = ?',
            [fk_id_programacion, adminId]
        );

        if (programacionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Esta programación no existe o no está autorizada para este administrador. Registre primero la programación.'
            });
        }

        // Verificar si la inversión existe
        const [inversionExist] = await pool.query(
            'SELECT * FROM inversiones WHERE id_inversiones = ?',
            [fk_id_inversiones]
        );

        if (inversionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'La inversión especificada no existe. Registre primero la inversión.'
            });
        }

        // Establecer estado como 'activo' por defecto
        const estado = 'activo';

        // Realizar la inserción en la tabla produccion
        const [Registrar] = await pool.query(
            'INSERT INTO produccion (cantidad_produccion, precio, fk_id_programacion, fk_id_inversiones, estado, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
            [cantidad_produccion, precio, fk_id_programacion, fk_id_inversiones, estado, adminId]
        );

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
        console.error(error); // Mejor uso de logging
        return res.status(500).json({
            status: 500,
            message: 'Error en el servidor'
        });
    }
};



export const BuscarProduccion = async (req, res) => {
    try {
        const { id_producccion } = req.params;

        let sql = `
            SELECT 
                produ.id_producccion,
                produ.cantidad_produccion, 
                produ.precio,
                produ.fk_id_programacion AS id_programacion,  
                pro.fecha_inicio, 
                pro.fecha_fin,
                produ.fk_id_inversiones AS id_inversiones,
                inv.valor_inversion, 
                produ.estado
            FROM 
                produccion AS produ
            JOIN 
                programacion AS pro ON produ.fk_id_programacion = pro.id_programacion
            JOIN 
                inversiones AS inv ON produ.fk_id_inversiones = inv.id_inversiones
            WHERE
                produ.id_producccion = ?;
        `;

        const [resultado] = await pool.query(sql, [id_producccion]);

        if (resultado.length > 0) {
            return res.status(200).json({ resultado });
        } else {
            res.status(404).json({
                status: 404,
                message: "No se encontraron resultados con el id especificado.",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Error en el servidor.",
        });
        console.log(error);
    }
};



export const actualizarProduccion = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id_producccion } = req.params;
        const { cantidad_produccion, precio, fk_id_programacion, fk_id_inversiones } = req.body;

        if (!cantidad_produccion && !precio && !fk_id_programacion && !fk_id_inversiones) {
            return res.status(400).json({
                message: "Se requiere al menos uno de los campos para actualizar (cantidad_produccion, precio, fk_id_programacion, fk_id_inversiones)",
            });
        }

        // Obtener el admin_id del usuario autenticado
        const adminId = req.usuario;

        // Verificar si la producción a actualizar existe y pertenece al administrador actual
        const [produccionExistente] = await pool.query(
            'SELECT * FROM produccion AS p INNER JOIN programacion AS pro ON p.fk_id_programacion = pro.id_programacion WHERE p.id_producccion = ? AND pro.admin_id = ?',
            [id_producccion, adminId]
        );

        if (produccionExistente.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'La producción no existe o no está autorizada para actualizar por este administrador. Verifique el ID proporcionado.'
            });
        }

        // Verificar si la nueva inversión (si se proporciona) existe
        if (fk_id_inversiones) {
            const [inversionExistente] = await pool.query(
                'SELECT * FROM inversiones WHERE id_inversiones = ?',
                [fk_id_inversiones]
            );

            if (inversionExistente.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: 'La inversión especificada no existe. Verifique el ID de la inversión proporcionado.'
                });
            }
        }

        // Construir y ejecutar la consulta de actualización
        const updateValues = {
            cantidad_produccion: cantidad_produccion || produccionExistente[0].cantidad_produccion,
            precio: precio || produccionExistente[0].precio,
            fk_id_programacion: fk_id_programacion || produccionExistente[0].fk_id_programacion,
            fk_id_inversiones: fk_id_inversiones || produccionExistente[0].fk_id_inversiones
        };

        const updateQuery = `
            UPDATE produccion 
            SET cantidad_produccion=?, precio=?, fk_id_programacion=?, fk_id_inversiones=? 
            WHERE id_producccion=?
        `;

        const [updatedProduccion] = await pool.query(updateQuery, [
            updateValues.cantidad_produccion,
            updateValues.precio,
            updateValues.fk_id_programacion,
            updateValues.fk_id_inversiones,
            id_producccion
        ]);

        if (updatedProduccion.affectedRows > 0) {
            res.status(200).json({
                status: 200,
                message: updatedProduccion.changedRows > 0 ? 'La producción se actualizó correctamente' : 'No se realizaron cambios',
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'No se encontraron resultados para actualizar',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Error en el servidor',
            error: error.message
        });
        console.log(error);
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

        const nuevoEstado = currentState === 'activo' ? 'inactivo' : 'activo';

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